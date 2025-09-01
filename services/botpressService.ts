import axios from 'axios'

const WEBHOOK_URL = 'https://chat.botpress.cloud/f9085fef-f7fe-4cbd-a1e5-657047d01b1f'

interface UserResponse {
  user: { id: string }
  key: string
}

interface ConversationResponse {
  conversation: { id: string }
}

interface MessageResponse {
  message: { id: string }
}

interface ListMessagesResponse {
  messages: { id: string; payload: any; text?: string; authorId?: string; direction?: string }[]
}

class BotpressService {
  private userKey: string | null = null
  private conversationId: string | null = null

  // Initialize the service
  async initialize() {
    // If already initialized, return true
    if (this.userKey && this.conversationId) {
      console.log('Service already initialized, skipping...')
      return true
    }

    try {
      // 1. Test connection
      const hello = await axios.get(`${WEBHOOK_URL}/hello`)
      console.log('Botpress connection:', hello.data)

      // 2. Create user
      const userRes = await axios.post<UserResponse>(`${WEBHOOK_URL}/users`, {
        name: 'Frontend User'
      })
      this.userKey = userRes.data.key
      console.log('User created:', this.userKey)

      // 3. Create conversation
      const convRes = await axios.post<ConversationResponse>(
        `${WEBHOOK_URL}/conversations`,
        {},
        { headers: { 'x-user-key': this.userKey } }
      )
      this.conversationId = convRes.data.conversation.id
      console.log('Conversation created:', this.conversationId)

      return true
    } catch (error) {
      console.error('Failed to initialize Botpress service:', error)
      return false
    }
  }

  // Send a message to the bot
  async sendMessage(text: string) {
    if (!this.userKey || !this.conversationId) {
      throw new Error('Service not initialized. Call initialize() first.')
    }

    try {
      console.log('Sending message to bot:', {
        text,
        conversationId: this.conversationId,
        userKey: this.userKey?.substring(0, 8) + '...'
      })

      const msgRes = await axios.post<MessageResponse>(
        `${WEBHOOK_URL}/messages`,
        {
          conversationId: this.conversationId,
          payload: { type: 'text', text }
        },
        { headers: { 'x-user-key': this.userKey } }
      )
      
      console.log('Message sent successfully:', msgRes.data.message.id)
      console.log('Full response:', msgRes.data)
      return msgRes.data.message.id
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  // Get conversation messages
  async getMessages() {
    if (!this.userKey || !this.conversationId) {
      throw new Error('Service not initialized. Call initialize() first.')
    }

    try {
      const listRes = await axios.get<ListMessagesResponse>(
        `${WEBHOOK_URL}/conversations/${encodeURIComponent(this.conversationId)}/messages`,
        { headers: { 'x-user-key': this.userKey } }
      )
      
      return listRes.data.messages
    } catch (error) {
      console.error('Failed to get messages:', error)
      throw error
    }
  }

  // Listen for bot responses (SSE)
  listenForResponses(onMessage: (message: any) => void, onError?: (error: any) => void) {
    if (!this.userKey || !this.conversationId) {
      throw new Error('Service not initialized. Call initialize() first.')
    }

    console.log('Starting SSE connection with:', {
      conversationId: this.conversationId,
      userKey: this.userKey?.substring(0, 8) + '...'
    })

    try {
      // Try SSE without authentication first (some backends support it)
      const sseUrl = `${WEBHOOK_URL}/conversations/${encodeURIComponent(this.conversationId)}/listen`
      console.log('Connecting to SSE endpoint:', sseUrl)
      const eventSource = new EventSource(sseUrl)

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('Raw SSE message received:', data)
          
          // Check if this is a bot message before processing
          if (this.isBotMessage(data)) {
            // Handle different message formats
            if (data.payload && data.payload.type === 'text') {
              onMessage(data)
            } else if (data.type === 'text' || data.text) {
              // Handle direct text messages
              onMessage({
                payload: {
                  type: 'text',
                  text: data.text || data.message || 'Bot response received'
                }
              })
            } else {
              // Handle other message types
              onMessage(data)
            }
          } else {
            console.log('SSE: Skipping user message:', data)
          }
        } catch (error) {
          console.error('Failed to parse SSE message:', error)
          // Try to handle as plain text
          if (event.data) {
            onMessage({
              payload: {
                type: 'text',
                text: event.data
              }
            })
          }
        }
      }

      eventSource.onerror = (error) => {
        console.error('SSE error:', error)
        console.log('Falling back to polling method...')
        eventSource.close()
        // Automatically fall back to polling
        this.startPolling(onMessage, onError)
      }

      eventSource.onopen = () => {
        console.log('SSE connection opened successfully')
      }

      return eventSource
    } catch (error) {
      console.error('SSE not supported, falling back to polling:', error)
      // Fallback to polling if SSE fails
      return this.startPolling(onMessage, onError)
    }
  }

  // Fallback polling method for environments where SSE is not supported
  private startPolling(onMessage: (message: any) => void, onError?: (error: any) => void) {
    let isPolling = true
    let processedMessageIds = new Set<string>()
    let pollInterval: NodeJS.Timeout | null = null

    console.log('Starting polling fallback for bot responses...')

    const poll = async () => {
      if (!isPolling) return

      try {
        // Always use the current conversation ID
        if (!this.conversationId) {
          console.log('No conversation ID available, stopping polling')
          return
        }

        const messages = await this.getMessages()
        console.log('All messages from conversation:', messages)
        
        if (messages.length > 0) {
          console.log(`Processing ${messages.length} messages, already processed ${processedMessageIds.size} messages`)
          
          // Process messages in order and only show new bot responses
          for (const message of messages) {
            console.log('Processing message:', message.id, message.payload?.text || message.text)
            
            if (processedMessageIds.has(message.id)) {
              console.log('Skipping already processed message:', message.id)
              continue // Skip already processed messages
            }
            
            processedMessageIds.add(message.id)
            
            // Check if this is a bot response (not a user message)
            const isBotMessage = this.isBotMessage(message)
            
            if (isBotMessage) {
              // Format the message to match the expected structure
              const formattedMessage = {
                payload: {
                  type: 'text',
                  text: message.payload?.text || message.text || 'Bot response received'
                }
              }
              
              console.log('Polling: New bot message received:', formattedMessage)
              onMessage(formattedMessage)
            } else {
              console.log('Skipping user message:', message)
            }
          }
        }
      } catch (error) {
        console.error('Polling error:', error)
        if (onError) onError(error)
      }

      // Continue polling every 2 seconds
      if (isPolling) {
        pollInterval = setTimeout(poll, 2000)
      }
    }

    // Start polling
    poll()

    // Return a mock EventSource-like object for compatibility
    return {
      close: () => {
        console.log('Stopping polling...')
        isPolling = false
        if (pollInterval) {
          clearTimeout(pollInterval)
        }
      }
    } as EventSource
  }

  // Helper method to determine if a message is from the bot
  private isBotMessage(message: any): boolean {
    console.log('Checking if message is from bot:', message)
    
    // Check various ways the backend might indicate a bot message
    if (message.direction === 'outgoing') return true
    if (message.authorId === 'bot') return true
    if (message.authorId === 'assistant') return true
    if (message.authorId === 'system') return true
    if (message.payload?.fromUser === false) return true
    if (message.payload?.authorId === 'bot') return true
    
    // If the message has a different structure, check for bot indicators
    if (message.payload?.type === 'text' && !message.payload?.fromUser) return true
    
    // Check if this looks like a user message (has the same text as what was sent)
    // This is a heuristic to avoid showing user messages as bot responses
    if (message.payload?.text && message.payload.text.trim() === 'events') {
      console.log('Detected user message, skipping:', message.payload.text)
      return false
    }
    
    // For now, assume any message that's not clearly from user is from bot
    // This is a fallback and might need adjustment based on actual backend response
    return true
  }

  // Get current conversation ID
  getConversationId() {
    return this.conversationId
  }

  // Get current user key
  getUserKey() {
    return this.userKey
  }

  // Restart polling with current conversation
  restartPolling(onMessage: (message: any) => void, onError?: (error: any) => void) {
    console.log('Restarting polling with new conversation ID:', this.conversationId)
    return this.startPolling(onMessage, onError)
  }
}

export default BotpressService