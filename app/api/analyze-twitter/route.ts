import { groq } from '@ai-sdk/groq'
import { tavily } from '@tavily/core'
import { generateText, wrapLanguageModel, extractReasoningMiddleware } from 'ai'
import { TwitterAnalysisRequest, TwitterAnalysisError } from '@/types'
import { validateEnvironment } from '@/lib/env'

// Validate environment variables
validateEnvironment()

const tavilyClient = tavily({
    apiKey: process.env.TAVILY_API_KEY
})

const enhancedModel = wrapLanguageModel({
    model: groq('openai/gpt-oss-120b'),
    middleware: extractReasoningMiddleware({ tagName: 'think' }),
})

export async function POST(req: Request) {
    try {
        const { username }: TwitterAnalysisRequest = await req.json()

        // Input validation
        if (!username || typeof username !== 'string' || username.trim().length === 0) {
            return new Response(JSON.stringify({ error: 'Valid username is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        const cleanUsername = username.trim().replace('@', '')
        
        // Additional validation
        if (cleanUsername.length > 15) {
            return new Response(JSON.stringify({ error: 'Username too long' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Search for Twitter data
        const searchResult = await tavilyClient.search(`${cleanUsername} twitter`, {
            searchDepth: 'basic',
            maxResults: 10,
            includeDomains: ['twitter.com', 'x.com'],
            includeAnswer: false,
            includeRawContent: false,
            includeImages: false,
            includeVideo: false,
        })

        if (!searchResult.results || searchResult.results.length === 0) {
            return new Response(JSON.stringify({ 
                error: 'No Twitter data found for this username. Account might not exist or be private.' 
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Filter user's own content vs mentions
        const userOwnContent = searchResult.results.filter(result => 
            result.url.includes(`/${cleanUsername}/`) || 
            result.url.includes(`@${cleanUsername}`) ||
            result.title.toLowerCase().includes(`@${cleanUsername}`)
        )

        const mentionsFromOthers = searchResult.results.filter(result => 
            !result.url.includes(`/${cleanUsername}/`) && 
            !result.url.includes(`@${cleanUsername}`) &&
            !result.title.toLowerCase().includes(`@${cleanUsername}`)
        )

        // Check if account is private (only mentions, no own content)
        // if (userOwnContent.length === 0 && mentionsFromOthers.length > 0) {
        //     return new Response(JSON.stringify({ 
        //         error: 'This Twitter account appears to be private. We can only analyze public accounts.' 
        //     }), {
        //         status: 403,
        //         headers: { 'Content-Type': 'application/json' }
        //     })
        // }

        // Prepare content for analysis
        const contentToAnalyze = userOwnContent.length > 0 ? userOwnContent : mentionsFromOthers
        const twitterContent = contentToAnalyze
            .map(result => result.content)
            .filter(content => content)
            .join('\n\n')
            .substring(0, 1000)

        const system = `You are a goofy, fun-loving Twitter personality analyzer who loves to roast people in the most harmless, entertaining way possible! 🎭

Your mission: Analyze Twitter users and place them on a 4-dimensional "Chaos Grid" of personality traits. Be playful, witty, and never mean-spirited - this is all in good fun! 😄

Analyze the user's Twitter presence and determine their scores on these dimensions:

1. DESPERATE (-1 to +1): How much they seem to crave attention/validation
   - Low: Chill, doesn't need external validation
   - High: Constantly seeking likes, retweets, and attention

2. PERFORMATIVE (-1 to +1): How much they're putting on a show vs being authentic
   - Low: Genuine, real, what you see is what you get
   - High: Always performing for the audience, dramatic flair

3. CRY_FOR_HELP (-1 to +1): How much they seem to be struggling/asking for support
   - Low: Independent, handles things on their own
   - High: Constantly venting, asking for advice, emotional support

4. RAGEBAITER (-1 to +1): How much they intentionally provoke reactions
   - Low: Peaceful, avoids drama, brings people together
   - High: Loves stirring the pot, controversial takes, chaos energy

Output ONLY a JSON object with this exact format:
{
    "coordinates": {
        "desperate": 0.7,
        "performative": -0.3,
        "cry_for_help": 0.2,
        "ragebaiter": -0.8
    },
    "confidence": 0.85,
    "reasoning": "A goofy, fun analysis that's entertaining but never mean. Include emojis and playful language!",
    "key_indicators": ["fun indicator 1", "fun indicator 2", "fun indicator 3"]
}

Remember: 
- Be entertaining and goofy! 🎪
- Never be mean or offensive - this is fun analysis! 😊
- Use emojis and playful language throughout
- Output ONLY the JSON, no other text

User's Twitter data to analyze:
${twitterContent}`

        const response = await generateText({
            model: enhancedModel,
            system,
            messages: [
                { role: 'user', content: `Analyze the Twitter personality of @${cleanUsername}` }
            ],
            temperature: 0.3,
        })

        // Parse the AI response to extract JSON
        let analysisResult
        try {
            const jsonMatch = response.text.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                analysisResult = JSON.parse(jsonMatch[0])
            } else {
                throw new Error('No valid JSON found in response')
            }
        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError)
            throw new Error('AI response parsing failed')
        }

        return new Response(JSON.stringify(analysisResult), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error('Error analyzing Twitter user:', error)
        
        // Handle specific error types
        if (error instanceof Error) {
            if (error.message.includes('rate limit') || error.message.includes('429')) {
                return new Response(JSON.stringify({ error: 'Rate limited. Please try again later.' }), {
                    status: 429,
                    headers: { 'Content-Type': 'application/json' }
                })
            }
            
            if (error.message.includes('API key') || error.message.includes('unauthorized')) {
                return new Response(JSON.stringify({ error: 'Service temporarily unavailable.' }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                })
            }
        }
        
        const errorResponse: TwitterAnalysisError = { 
            error: 'Failed to analyze Twitter user. Please try again.' 
        }
        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}