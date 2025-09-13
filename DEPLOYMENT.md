# Production Deployment Guide

## Vercel Deployment (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard:**
   - `TAVILY_API_KEY`: Your Tavily API key
3. **Deploy automatically on push to main branch**

## Manual Deployment

### Build and Test Locally

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test production build locally
npm start
```

### Environment Variables

Make sure these are set in your production environment:

```env
TAVILY_API_KEY=your_tavily_api_key_here
```

### Performance Optimizations

- ✅ CSS optimization enabled
- ✅ Image optimization configured
- ✅ TypeScript strict mode
- ✅ ESLint configured
- ✅ Production error handling

### Monitoring

- Monitor API usage and rate limits
- Set up error tracking (Sentry recommended)
- Monitor Tavily API quota usage

## Security Considerations

- ✅ Input validation on all API endpoints
- ✅ Rate limiting handled by Tavily
- ✅ No sensitive data stored
- ✅ CORS properly configured
- ✅ Environment variables secured

## Scaling Considerations

- Consider adding Redis caching for popular users
- Implement request queuing for high traffic
- Monitor API costs and usage
