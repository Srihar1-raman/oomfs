import { groq } from '@ai-sdk/groq'
import { tavily } from '@tavily/core'
import {
    convertToCoreMessages,
    generateText,
    wrapLanguageModel,
    extractReasoningMiddleware,
} from 'ai'
import { TwitterAnalysisRequest, TwitterAnalysisError } from '@/types'

const tavilyClient = tavily({
    apiKey: process.env.TAVILY_API_KEY as string
})

const enhancedModel = wrapLanguageModel({
    model: groq('openai/gpt-oss-120b'),
    middleware: extractReasoningMiddleware({ tagName: 'think' }),
});

export async function POST(req: Request) {
    try {
        const { username }: TwitterAnalysisRequest = await req.json()

        if (!username) {
            const error: TwitterAnalysisError = { error: 'Username is required' }
            return new Response(JSON.stringify(error), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Fetch Twitter data using Tavily search (like in the image)
        console.log(`🔍 Searching Twitter data for username: ${username}`)
        
        const searchResult = await tavilyClient.search(
            `${username} twitter`,
            {
                searchDepth: 'basic',
                maxResults: 10, // Get more results to analyze
                includeDomains: ['twitter.com', 'x.com'],
                includeAnswer: false,
                includeRawContent: false,
                includeImages: false,
                includeVideo: false,
            }
        )

        console.log('📊 Tavily Search Response:', JSON.stringify(searchResult, null, 2))
        console.log('📝 Number of results:', searchResult.results?.length || 0)

        if (!searchResult.results || searchResult.results.length === 0) {
            console.log('❌ No results found from Tavily search')
            const error: TwitterAnalysisError = { 
                error: 'No Twitter data found for this username. Account might not exist.' 
            }
            return new Response(JSON.stringify(error), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Smart filtering: Separate user's own content from mentions
        const userOwnContent = searchResult.results.filter(result => {
            // Check if the URL contains the username (user's own tweets)
            return result.url.includes(`/${username}/`) || 
                   result.url.includes(`@${username}`) ||
                   result.title.toLowerCase().includes(`@${username}`)
        })

        const mentionsFromOthers = searchResult.results.filter(result => {
            // Check if it's mentions from other accounts
            return !result.url.includes(`/${username}/`) && 
                   !result.url.includes(`@${username}`) &&
                   !result.title.toLowerCase().includes(`@${username}`)
        })

        console.log('🔍 User own content found:', userOwnContent.length)
        console.log('🔍 Mentions from others found:', mentionsFromOthers.length)

        // If we only have mentions from others, the account is likely private
        if (userOwnContent.length === 0 && mentionsFromOthers.length > 0) {
            console.log('❌ Only mentions found - account is likely private')
            const error: TwitterAnalysisError = { 
                error: 'This Twitter account appears to be private. We can only analyze public accounts with visible content.' 
            }
            return new Response(JSON.stringify(error), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Use user's own content if available, otherwise use filtered mentions
        const contentToAnalyze = userOwnContent.length > 0 ? userOwnContent : mentionsFromOthers
        console.log('📝 Using content from:', userOwnContent.length > 0 ? 'user own tweets' : 'filtered mentions')

        // Combine relevant content from filtered results
        const twitterContent = contentToAnalyze
            .map(result => result.content)
            .filter(content => content)
            .join('\n\n')
            .substring(0, 1000)

        console.log('📝 Twitter content to analyze:', twitterContent)

        const system = `You are a goofy, fun-loving Twitter personality analyzer who loves to roast people in the most harmless, entertaining way possible! 🎭

        Your mission: Analyze Twitter users and place them on a 4-dimensional "Chaos Grid" of personality traits. Be playful, witty, and never mean-spirited - this is all in good fun! 😄

        IMPORTANT: If the content seems to be mostly mentions from other accounts (not the user's own tweets), the account is likely private. In that case, be extra cautious and note that you're working with limited data.

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
        - If the account seems private, mention it in your reasoning
        - Use emojis and playful language throughout
        - Output ONLY the JSON, no other text

        User's Twitter data to analyze:
        ${twitterContent}`

        console.log('🤖 Sending to Groq AI...')
        const response = await generateText({
            model: enhancedModel,
            system,
            messages: [
                { role: 'user', content: `Analyze the Twitter personality of @${username}` }
            ],
            temperature: 0.3,
        })

        console.log('✅ Groq AI Response:', response.text)

        // Parse the AI response to extract JSON
        let analysisResult
        try {
            // Try to find JSON in the response
            const jsonMatch = response.text.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                analysisResult = JSON.parse(jsonMatch[0])
            } else {
                throw new Error('No valid JSON found in response')
            }
        } catch (parseError) {
            console.error('Failed to parse AI response:', response.text)
            throw new Error('AI response parsing failed')
        }

        return new Response(JSON.stringify(analysisResult), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error('Error analyzing Twitter user:', error)
        const errorResponse: TwitterAnalysisError = { 
            error: 'Failed to analyze Twitter user. Please try again.' 
        }
        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
