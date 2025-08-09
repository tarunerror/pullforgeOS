/**
 * OpenRouter Service for Pullforge OS
 * Primary LLM provider using Moonshot AI Kimi model
 */

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenRouterResponse {
  id: string
  choices: Array<{
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  model: string
}

interface ChatCompletionOptions {
  messages: OpenRouterMessage[]
  model?: string
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

interface EmbeddingOptions {
  input: string | string[]
  model?: string
}

class OpenRouterService {
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1'
  private defaultModel: string
  private fallbackModels: string[]
  private siteUrl: string
  private siteName: string

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || ''
    this.defaultModel = process.env.OPENROUTER_MODEL || 'moonshotai/kimi-vl-a3b-thinking:free'
    this.fallbackModels = (process.env.OPENROUTER_FALLBACK_MODELS || 'openai/gpt-3.5-turbo,anthropic/claude-3-haiku').split(',')
    this.siteUrl = process.env.OPENROUTER_SITE_URL || 'http://localhost:3000'
    this.siteName = process.env.OPENROUTER_SITE_NAME || 'Pullforge OS'
  }

  /**
   * Initialize the service and validate API key
   */
  async initialize(): Promise<{ success: boolean; error?: string }> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'OpenRouter API key not found. Please set OPENROUTER_API_KEY in your environment variables.'
      }
    }

    try {
      // Test the API key with a simple request
      const response = await this.chatCompletion({
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: `OpenRouter initialization failed: ${error.message}`
      }
    }
  }

  /**
   * Chat completion using Kimi model
   */
  async chatCompletion(options: ChatCompletionOptions): Promise<OpenRouterResponse> {
    const model = options.model || this.defaultModel
    
    const requestBody = {
      model,
      messages: options.messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 2000,
      stream: options.stream || false
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.siteUrl,
          'X-Title': this.siteName
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        // Try fallback models if primary model fails
        if (model === this.defaultModel && this.fallbackModels.length > 0) {
          console.warn(`Primary model ${model} failed, trying fallback models...`)
          
          for (const fallbackModel of this.fallbackModels) {
            try {
              return await this.chatCompletion({
                ...options,
                model: fallbackModel.trim()
              })
            } catch (fallbackError) {
              console.warn(`Fallback model ${fallbackModel} also failed:`, fallbackError)
              continue
            }
          }
        }
        
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error: any) {
      throw new Error(`OpenRouter request failed: ${error.message}`)
    }
  }

  /**
   * Generate embeddings (using a compatible model for embeddings)
   */
  async createEmbeddings(options: EmbeddingOptions): Promise<{ data: Array<{ embedding: number[] }> }> {
    // For embeddings, we'll use a dedicated embedding model
    const embeddingModel = 'text-embedding-3-small' // OpenAI model via OpenRouter
    
    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.siteUrl,
          'X-Title': this.siteName
        },
        body: JSON.stringify({
          model: embeddingModel,
          input: options.input
        })
      })

      if (!response.ok) {
        throw new Error(`OpenRouter embeddings API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error: any) {
      throw new Error(`OpenRouter embeddings request failed: ${error.message}`)
    }
  }

  /**
   * Simple chat method for easy integration
   */
  async chat(message: string, systemPrompt?: string): Promise<string> {
    const messages: OpenRouterMessage[] = []
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }
    
    messages.push({ role: 'user', content: message })

    try {
      const response = await this.chatCompletion({ messages })
      return response.choices[0]?.message?.content || 'No response generated'
    } catch (error: any) {
      throw new Error(`Chat request failed: ${error.message}`)
    }
  }

  /**
   * Code assistance with specialized prompt
   */
  async codeAssistant(code: string, task: string): Promise<string> {
    const systemPrompt = `You are an expert coding assistant. You help with code analysis, debugging, optimization, and generation. 
    You provide clear, concise explanations and practical solutions.
    
    Current task: ${task}`

    const userMessage = `Here's the code I'm working with:

\`\`\`
${code}
\`\`\`

Please help me with: ${task}`

    return await this.chat(userMessage, systemPrompt)
  }

  /**
   * Design assistance for UI/UX tasks
   */
  async designAssistant(description: string, context?: string): Promise<string> {
    const systemPrompt = `You are a UI/UX design expert. You provide guidance on user interface design, user experience, 
    accessibility, and modern design patterns. You give practical, actionable advice.`

    const userMessage = context 
      ? `Context: ${context}\n\nDesign request: ${description}`
      : `Design request: ${description}`

    return await this.chat(userMessage, systemPrompt)
  }

  /**
   * Writing assistance for documentation and content
   */
  async writingAssistant(content: string, task: string): Promise<string> {
    const systemPrompt = `You are a professional writing assistant. You help with documentation, content creation, 
    editing, and improving clarity and readability. You maintain the original tone while enhancing quality.`

    const userMessage = `Content: ${content}\n\nTask: ${task}`

    return await this.chat(userMessage, systemPrompt)
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      primaryModel: this.defaultModel,
      fallbackModels: this.fallbackModels,
      provider: 'OpenRouter',
      features: [
        'Vision capabilities (image understanding)',
        'Advanced reasoning and thinking',
        'Free tier available',
        'Multilingual support',
        'Code generation and analysis'
      ]
    }
  }

  /**
   * Check if service is properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey
  }
}

// Export singleton instance
export const openRouterService = new OpenRouterService()
export default openRouterService
