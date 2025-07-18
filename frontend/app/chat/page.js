'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'আসসালামু আলাইকুম! আমি MediLens চ্যাটবট। আপনার স্বাস্থ্য, প্রেসক্রিপশন বা টেস্ট রিপোর্ট নিয়ে যেকোনো প্রশ্ন করুন। আমি বাংলায় উত্তর দিতে পারি।',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const { currentUser } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: getBotResponse(inputMessage),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('fever') || lowerMessage.includes('জ্বর')) {
      return 'জ্বরের জন্য প্যারাসিটামল খেতে পারেন। প্রাপ্তবয়স্কদের জন্য ৫০০ মিগ্রা করে দিনে ৩ বার। প্রচুর পানি পান করুন এবং বিশ্রাম নিন। জ্বর ৩ দিনের বেশি থাকলে ডাক্তার দেখান।'
    }
    
    if (lowerMessage.includes('pressure') || lowerMessage.includes('রক্তচাপ')) {
      return 'উচ্চ রক্তচাপের জন্য নিয়মিত ওষুধ খান, লবণ কম খান, নিয়মিত ব্যায়াম করুন। স্বাভাবিক রক্তচাপ ১২০/৮০ এর কাছাকাছি। নিয়মিত পরীক্ষা করান।'
    }
    
    if (lowerMessage.includes('diabetes') || lowerMessage.includes('ডায়াবেটিস')) {
      return 'ডায়াবেটিস নিয়ন্ত্রণে রাখতে সময়মত ওষুধ খান, মিষ্টি কম খান, নিয়মিত হাঁটাহাঁটি করুন। খালি পেটে চিনির পরিমাণ ৭ এর নিচে রাখার চেষ্টা করুন।'
    }
    
    if (lowerMessage.includes('headache') || lowerMessage.includes('মাথাব্যথা')) {
      return 'মাথাব্যথার জন্য প্যারাসিটামল খেতে পারেন। পর্যাপ্ত পানি পান করুন, বিশ্রাম নিন। চোখের সমস্যা বা চশমার পাওয়ার পরিবর্তন হলে চোখের ডাক্তার দেখান।'
    }
    
    return 'আপনার প্রশ্নটি আমি বুঝতে পারছি। আরো নির্দিষ্ট তথ্য দিলে আমি আরো ভালো সাহায্য করতে পারব। প্রয়োজনে কাছের ডাক্তারের পরামর্শ নিন।'
  }

  const quickQuestions = [
    'জ্বর হলে কি করব?',
    'রক্তচাপ বেশি হলে কি খাব?',
    'ডায়াবেটিস কন্ট্রোল করার উপায়?',
    'মাথাব্যথার ওষুধ কি?',
    'পেট ব্যথার কারণ কি?'
  ]

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to chat</h1>
          <a href="/auth/login" className="btn btn-primary">Login</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto max-w-4xl h-screen flex flex-col">
        {/* Header */}
        <motion.div 
          className="bg-primary text-primary-content p-4 rounded-t-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold">💬 MediLens Chatbot</h1>
          <p className="text-primary-content/80">Ask about your health in Bangla</p>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-base-200">
          <div className="space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                className={`chat ${message.type === 'user' ? 'chat-end' : 'chat-start'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    {message.type === 'user' ? (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-content">
                        {currentUser.displayName?.[0] || 'U'}
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-content">
                        🤖
                      </div>
                    )}
                  </div>
                </div>
                <div className="chat-header">
                  {message.type === 'user' ? 'You' : 'MediLens Bot'}
                  <time className="text-xs opacity-50 ml-2">
                    {message.timestamp.toLocaleTimeString()}
                  </time>
                </div>
                <div className={`chat-bubble ${message.type === 'user' ? 'chat-bubble-primary' : 'chat-bubble-secondary'}`}>
                  {message.content}
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                className="chat chat-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-content">
                    🤖
                  </div>
                </div>
                <div className="chat-bubble chat-bubble-secondary">
                  <span className="loading loading-dots loading-sm"></span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Questions */}
        <div className="p-4 bg-base-200 border-t">
          <p className="text-sm text-base-content/70 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                className="btn btn-sm btn-outline"
                onClick={() => setInputMessage(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 bg-base-200 rounded-b-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="আপনার প্রশ্ন লিখুন... (Type your question in Bangla or English)"
              className="input input-bordered flex-1"
              disabled={isTyping}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!inputMessage.trim() || isTyping}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
