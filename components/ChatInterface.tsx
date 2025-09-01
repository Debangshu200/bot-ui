import React, { useState, useEffect, useRef } from 'react'
import BotpressService from '../services/botpressService'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('Connecting...')
  
  const botpressService = useRef<BotpressService>(new BotpressService())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

    // Initialize the bot service
  useEffect(() => {
    let isInitialized = false

    const initializeBot = async () => {
      if (isInitialized) return
      isInitialized = true

      try {
        setConnectionStatus('Initializing bot connection...')
        const success = await botpressService.current.initialize()
        
        if (success) {
          setIsConnected(true)
          setConnectionStatus('Connected to Eventello Bot! 🎉')
          
          // Start listening for bot responses
          startListening()
          
          // Add welcome message only if no messages exist
          setMessages(prev => {
            if (prev.length === 0) {
              return [{
                id: `welcome-${Date.now()}`,
                text: 'Hello! I\'m your Eventello assistant. Ask me about events, tickets, or anything else!',
                isUser: false,
                timestamp: new Date()
              }]
            }
            return prev
          })
        } else {
          setConnectionStatus('Failed to connect to bot')
        }
      } catch (error) {
        console.error('Initialization error:', error)
        setConnectionStatus('Connection failed. Please try again.')
      }
    }

    initializeBot()

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  // Start listening for bot responses
  const startListening = () => {
    try {
      // Close any existing connection first
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      eventSourceRef.current = botpressService.current.listenForResponses(
        (botMessage) => {
          console.log('Bot response received:', botMessage)
          
          // Handle different types of bot responses
          if (botMessage.payload && botMessage.payload.type === 'text') {
            setMessages(prev => [...prev, {
              id: `bot-${Date.now()}`,
              text: botMessage.payload.text,
              isUser: false,
              timestamp: new Date()
            }])
          }
          
          setIsLoading(false)
        },
        (error) => {
          console.error('Bot listening error:', error)
          // Don't set disconnected status immediately, as polling might work
          console.log('SSE failed, but polling fallback should handle responses')
        }
      )
    } catch (error) {
      console.error('Failed to start listening:', error)
    }
  }

  // Send a message to the bot
  const sendMessage = async () => {
    if (!inputText.trim() || !isConnected) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputText,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    try {
      await botpressService.current.sendMessage(inputText)
      console.log('Message sent successfully')
      
      // Give the bot a moment to process the message
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Failed to send message:', error)
      setIsLoading(false)
      
      // Add error message
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date()
      }])
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Reconnect to the bot
  const reconnect = async () => {
    setConnectionStatus('Reconnecting...')
    try {
      const success = await botpressService.current.initialize()
      if (success) {
        setIsConnected(true)
        setConnectionStatus('Reconnected! 🎉')
        startListening()
      } else {
        setConnectionStatus('Reconnection failed')
      }
    } catch (error) {
      setConnectionStatus('Reconnection failed')
    }
  }

  return (
    <div className="chat-interface">
      {/* Connection Status */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        <span className="status-indicator"></span>
        {connectionStatus}
        {!isConnected && (
          <button onClick={reconnect} className="reconnect-btn">
            Reconnect
          </button>
        )}
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-content">
              <div className="message-text">{message.text}</div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="message bot-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-area">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isConnected ? "Type your message here..." : "Connecting to bot..."}
          disabled={!isConnected}
          className="message-input"
        />
        <button
          onClick={sendMessage}
          disabled={!inputText.trim() || !isConnected || isLoading}
          className="send-button"
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatInterface
