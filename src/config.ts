export const config = {
  dify: {
    apiEndpoint: `${import.meta.env.VITE_DIFY_API_ENDPOINT}/chat-messages`,
    apiKey: import.meta.env.VITE_DIFY_API_KEY
  }
} as const 