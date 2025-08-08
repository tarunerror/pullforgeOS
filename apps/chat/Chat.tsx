'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Code, Palette, FileText, Wrench, Sparkles } from 'lucide-react'

interface ChatProps {
  windowId: string
  data?: any
}

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  agent?: string
}

const agents = [
  {
    id: 'coding',
    name: 'Coding Assistant',
    icon: Code,
    description: 'Help with programming, debugging, and code review',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/20',
  },
  {
    id: 'design',
    name: 'Design Assistant',
    icon: Palette,
    description: 'UI/UX design, layouts, and visual guidance',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/20',
  },
  {
    id: 'writing',
    name: 'Writing Assistant',
    icon: FileText,
    description: 'Documentation, content creation, and editing',
    color: 'text-green-400',
    bgColor: 'bg-green-400/20',
  },
  {
    id: 'devops',
    name: 'DevOps Assistant',
    icon: Wrench,
    description: 'Deployment, CI/CD, and infrastructure help',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/20',
  },
  {
    id: 'general',
    name: 'General Assistant',
    icon: Sparkles,
    description: 'General questions and task automation',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/20',
  },
]

export default function Chat({ windowId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '👋 Welcome to AI OS Chat! I\'m your AI assistant. Choose an agent from the sidebar or ask me anything directly. I can help you with coding, design, writing, DevOps, and more!',
      timestamp: new Date(),
      agent: 'general',
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedAgent, setSelectedAgent] = useState(agents[0])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Simulate AI response (in real implementation, this would call OpenRouter API)
    setTimeout(() => {
      const responses = {
        coding: [
          "I'd be happy to help you with your coding question! Could you share more details about what you're working on?",
          "Let me analyze your code. Here are some suggestions for improvement...",
          "This looks like a common pattern. Here's how I would approach it:",
        ],
        design: [
          "Great design question! Let's think about the user experience here...",
          "For this UI component, I'd recommend considering these design principles:",
          "Here's a modern approach to this design challenge:",
        ],
        writing: [
          "I can help you improve this content. Here are my suggestions:",
          "Let's work on making this more engaging and clear:",
          "For better documentation, consider structuring it this way:",
        ],
        devops: [
          "For your deployment needs, here's what I recommend:",
          "Let's set up a robust CI/CD pipeline for this project:",
          "Here's how to optimize your infrastructure setup:",
        ],
        general: [
          "That's an interesting question! Let me help you with that:",
          "I can assist you with this task. Here's my approach:",
          "Based on your request, here's what I suggest:",
        ],
      }

      const agentResponses = responses[selectedAgent.id as keyof typeof responses] || responses.general
      const randomResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)]

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: randomResponse,
        timestamp: new Date(),
        agent: selectedAgent.id,
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000 + Math.random() * 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="h-full flex bg-os-bg">
      {/* Agent Sidebar */}
      <div className="w-64 bg-os-surface border-r border-os-border flex flex-col">
        <div className="p-3 border-b border-os-border">
          <h3 className="text-sm font-semibold text-os-text flex items-center">
            <Bot size={16} className="mr-2" />
            AI Agents
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {agents.map((agent) => {
            const IconComponent = agent.icon
            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                  selectedAgent.id === agent.id 
                    ? `${agent.bgColor} border border-current ${agent.color}` 
                    : 'hover:bg-os-border/50 text-os-text'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${agent.bgColor}`}>
                    <IconComponent size={16} className={agent.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{agent.name}</div>
                    <div className="text-xs text-os-text-muted mt-1 leading-tight">
                      {agent.description}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="p-3 border-t border-os-border">
          <div className="text-xs text-os-text-muted">
            <div className="flex items-center justify-between mb-1">
              <span>Active Agent:</span>
              <span className={`font-medium ${selectedAgent.color}`}>
                {selectedAgent.name}
              </span>
            </div>
            <div className="text-center mt-2 p-2 bg-os-bg rounded">
              💡 Switch agents anytime for specialized help
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-12 bg-os-surface border-b border-os-border flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${selectedAgent.bgColor}`}>
              <selectedAgent.icon size={16} className={selectedAgent.color} />
            </div>
            <div>
              <div className="text-sm font-medium text-os-text">{selectedAgent.name}</div>
              <div className="text-xs text-os-text-muted">{selectedAgent.description}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-os-text-muted">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.type === 'user'
                      ? 'bg-os-accent text-white'
                      : 'bg-os-surface border border-os-border text-os-text'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                </div>
                <div className={`text-xs text-os-text-muted mt-1 ${
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {message.type === 'assistant' && message.agent && (
                    <span className="mr-2">
                      {agents.find(a => a.id === message.agent)?.name}
                    </span>
                  )}
                  {formatTime(message.timestamp)}
                </div>
              </div>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ml-2 mr-2 ${
                message.type === 'user' 
                  ? 'bg-os-accent/20 order-1' 
                  : `${selectedAgent.bgColor} order-2`
              }`}>
                {message.type === 'user' ? (
                  <User size={16} className="text-os-accent" />
                ) : (
                  <selectedAgent.icon size={16} className={selectedAgent.color} />
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%]">
                <div className="bg-os-surface border border-os-border rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-os-text-muted rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-os-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-os-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-os-text-muted">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-os-border p-4">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask ${selectedAgent.name} anything...`}
              className="flex-1 px-4 py-2 bg-os-surface border border-os-border rounded-lg focus:outline-none focus:border-os-accent text-os-text placeholder-os-text-muted"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-os-accent text-white rounded-lg hover:bg-os-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-os-text-muted">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>Powered by OpenRouter API</span>
          </div>
        </div>
      </div>
    </div>
  )
}
