# OOMF Analyzer 🐦

A fun Twitter personality analyzer that places users on a 4-dimensional "Chaos Grid" of personality traits. Built with Next.js, Tailwind CSS, and AI-powered analysis.

## Features

- 🎭 **4D Personality Grid**: Analyzes users across Desperate, Performative, Cry for Help, and Ragebaiter dimensions
- 🤖 **AI-Powered Analysis**: Uses Groq AI and Tavily search for intelligent Twitter content analysis
- 🎨 **Beautiful UI**: Modern, responsive design with smooth animations and visual feedback
- 📱 **Mobile Friendly**: Works perfectly on all devices
- 📥 **Chart Export**: Download your personality chart as PNG image

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
TAVILY_API_KEY=your_tavily_api_key_here
```

**Get API Key:**
- **Tavily**: [https://tavily.com/](https://tavily.com/) - For Twitter data search

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Make sure to set the following environment variables in your production environment:

- `TAVILY_API_KEY`: Your Tavily API key

## How It Works

1. **Input**: Enter a Twitter username (without @)
2. **Search**: The app searches for the user's Twitter content using Tavily
3. **Analysis**: Groq AI analyzes the content and assigns scores across 4 dimensions
4. **Visualization**: Results are displayed on an interactive quadrant grid
5. **Export**: Download your personality chart to share with friends!

## Personality Dimensions

- **Desperate** (-1 to +1): How much they crave attention/validation
- **Performative** (-1 to +1): How much they're putting on a show vs being authentic
- **Cry for Help** (-1 to +1): How much they seem to be struggling/asking for support
- **Ragebaiter** (-1 to +1): How much they intentionally provoke reactions

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Groq AI SDK, Tavily Search API
- **UI Components**: Radix UI, Lucide React icons
- **Utilities**: html2canvas for chart export

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

## Credits

Made with ❤️ by [@combif1am](https://x.com/combif1am) & [@lowkeyverybored](https://x.com/lowkeyverybored)

## License

MIT License - feel free to use this project for fun and learning!

---

**Note**: This is a fun, lighthearted tool for entertainment purposes. Don't take the personality analysis too seriously! 😄