# OOMF Analyzer 🐦

A fun Twitter personality analyzer that places users on a 4-dimensional "Chaos Grid" of personality traits. Built with Next.js, Tailwind CSS, and AI-powered analysis.

## Features

- 🎭 **4D Personality Grid**: Analyzes users across Desperate, Performative, Cry for Help, and Ragebaiter dimensions
- 🤖 **AI-Powered Analysis**: Uses Groq AI and Tavily search for intelligent Twitter content analysis
- 🎨 **Beautiful UI**: Modern, responsive design with smooth animations and visual feedback
- 📱 **Mobile Friendly**: Works perfectly on all devices
- 📋 **Chart Export**: Copy your personality chart to clipboard as PNG

## Credits

Made with ❤️ by [@combif1am](https://x.com/combif1am) & [@lowkeyverybored](https://x.com/lowkeyverybored)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with:

```env
# Twitter Analysis API Keys
TAVILY_API_KEY=your_tavily_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

**Get API Keys:**
- **Tavily**: [https://tavily.com/](https://tavily.com/) - For Twitter data search
- **Groq**: [https://console.groq.com/](https://console.groq.com/) - For AI analysis

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **Input**: Enter a Twitter username (without @)
2. **Search**: The app searches for the user's Twitter content using Tavily
3. **Analysis**: Groq AI analyzes the content and assigns scores across 4 dimensions
4. **Visualization**: Results are displayed on an interactive quadrant grid
5. **Export**: Copy your personality chart to share with friends!

## Personality Dimensions

- **Desperate** (-1 to +1): How much they crave attention/validation
- **Performative** (-1 to +1): How much they're putting on a show vs being authentic
- **Cry for Help** (-1 to +1): How much they seem to be struggling/asking for support
- **Ragebaiter** (-1 to +1): How much they intentionally provoke reactions

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, tw-animate-css
- **AI**: Groq AI SDK, Tavily Search API
- **UI Components**: Radix UI, Lucide React icons
- **Utilities**: html2canvas for chart export

## Project Structure

```
oomf-analyzer/
├── app/
│   ├── api/analyze-twitter/    # Twitter analysis API endpoint
│   ├── globals.css             # Global styles with Tailwind
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main application page
├── src/
│   ├── components/ui/          # Reusable UI components
│   └── lib/                    # Utility functions
├── types/                      # TypeScript type definitions
└── public/                     # Static assets
```

## API Endpoints

### POST `/api/analyze-twitter`

Analyzes a Twitter user's personality.

**Request Body:**
```json
{
  "username": "twitter_username"
}
```

**Response:**
```json
{
  "coordinates": {
    "desperate": 0.7,
    "performative": -0.3,
    "cry_for_help": 0.2,
    "ragebaiter": -0.8
  },
  "confidence": 0.85,
  "reasoning": "Analysis explanation...",
  "key_indicators": ["indicator1", "indicator2"]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for fun and learning!

---

**Note**: This is a fun, lighthearted tool for entertainment purposes. Don't take the personality analysis too seriously! 😄
