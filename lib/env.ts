// Environment validation
export function validateEnvironment() {
  const requiredEnvVars = {
    TAVILY_API_KEY: process.env.TAVILY_API_KEY,
  }

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }

  return true
}
