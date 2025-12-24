"use client"

import * as React from "react"
import { MessageCircle, X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"

import { echo } from "@/lib/echo"
import axios from "axios"

interface Message {
  id: number
  content: string
  role: "user" | "assistant"
  metadata?: any
  created_at?: string
  pending?: boolean
}

// Remove static SESSION_ID
// const SESSION_ID = "default" 

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ChatSidebar() {
  const { setOpen } = useSidebar()
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const [user, setUser] = React.useState<{ id: number, name: string } | null>(null)
  
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const typingTimeoutRef = React.useRef<NodeJS.Timeout>(null)
  
  const sessionId = user ? `user-${user.id}` : null

  // Fetch User on mount
  React.useEffect(() => {
      const fetchUser = async () => {
          try {
              const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
                  headers: {
                      Authorization: `Bearer ${localStorage.getItem('auth_token')}`
                  }
              })
              setUser(res.data)
          } catch (e) {
              console.error("Failed to fetch user for chat", e)
          }
      }
      fetchUser()
  }, [])

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Initial load
  React.useEffect(() => {
    if (!sessionId) return

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/chat/${sessionId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
        })
        setMessages(response.data.data)
      } catch (error) {
        console.error("Failed to load messages", error)
      }
    }
    fetchMessages()
  }, [sessionId])

  // Real-time connection
  React.useEffect(() => {
    if (!echo || !sessionId || !user) return

    // User-specific private channel
    const channel = echo.private(`chat.user.${user.id}`)

    channel
      .listen(".MessageSent", (e: { message: Message }) => {
        setMessages((prev) => {
           // Helper to identify if we already have this message (deduplication by DB ID)
           if (prev.some(m => m.id === e.message.id)) return prev
           
           // Optimistic update reconciliation:
           // Find a pending message from 'user' that matches the client_generated_id
           if (e.message.role === 'user' && e.message.metadata?.client_generated_id) {
               const pendingIndex = prev.findIndex(m => m.pending && m.id === e.message.metadata.client_generated_id)
               if (pendingIndex !== -1) {
                   const newMessages = [...prev]
                   newMessages[pendingIndex] = e.message
                   return newMessages
               }
           }
           
           return [...prev, e.message]
        })

        if (e.message.metadata) {
            console.log("UI Trigger:", e.message.metadata)
        }
      })
      .listen(".typing", () => {
        setIsTyping(true)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000)
      })

    return () => {
      echo.leave(`chat.user.${user.id}`)
    }
  }, [sessionId, user])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !sessionId) return

    const newMessageContent = input
    setInput("")

    // 1. Optimistic Update
    const tempId = Date.now()
    const optimisticMsg: Message = {
        id: tempId,
        content: newMessageContent,
        role: "user",
        pending: true
    }
    setMessages((prev) => [...prev, optimisticMsg])
    scrollToBottom()

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chat/send`, {
        // session_id is ignored by backend now, but good to keep structure or remove if unused
        // But backend enforces it from auth, so we don't technically need to send it if backend ignores it.
        // However, let's just send 'default' or the sessionId, backend overrides it anyway.
        session_id: sessionId, 
        content: newMessageContent,
        role: "user",
        metadata: {
            client_generated_id: tempId
        }
      }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      })
    } catch (error) {
      console.error("Failed to send message", error)
      // Optional: Remove the optimistic message or show error state
      setMessages((prev) => prev.filter(m => m.id !== tempId))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    
    // Throttle typing events
    if (!typingTimeoutRef.current && sessionId) {
        axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chat/typing`, {
            session_id: sessionId
        }, {
             headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
        }).catch(err => console.error(err))
        
        // Prevent spamming
        typingTimeoutRef.current = setTimeout(() => {
            typingTimeoutRef.current = null
        }, 2000)
    }
  }

  return (
    <Sidebar side="right" collapsible="offcanvas" variant="sidebar" className="border-l border-border bg-white text-foreground w-[400px]">
      <SidebarHeader className="flex h-16 flex-row items-center justify-between border-b px-4 py-0 bg-white">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
          Chat
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(false)}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close Chat</span>
        </Button>
      </SidebarHeader>

      <SidebarContent className="p-4 bg-[#f3f3f3]">
        <div className="flex flex-col gap-6 text-sm">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center opacity-50 text-muted-foreground">
              <MessageCircle className="h-10 w-10" />
              <p>Start a new conversation</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex w-full gap-2",
                  msg.role === "user" ? "justify-end" : "justify-start",
                  msg.pending ? "opacity-70" : "opacity-100"
                )}
              >
                {msg.role === "assistant" && (
                   <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src="/bot-avatar.png" alt="AI" />
                      <AvatarFallback>AI</AvatarFallback>
                   </Avatar>
                )}
                
                <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3 prose prose-sm dark:prose-invert break-words",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-white border border-border text-foreground shadow-sm"
                    )}
                >
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                            // Override creating extra p tags to keep bubbles tight
                            p: ({children}) => <span className="block mb-2 last:mb-0">{children}</span>,
                            table: ({children}) => <div className="overflow-x-auto my-2"><table className="border-collapse w-full">{children}</table></div>,
                            th: ({children}) => <th className="border border-border p-1 bg-muted font-bold text-left">{children}</th>,
                            td: ({children}) => <td className="border border-border p-1">{children}</td>,
                        }}
                    >
                        {msg.content}
                    </ReactMarkdown>
                </div>

                {msg.role === "user" && (
                   <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src="/user-avatar.png" alt="User" />
                      <AvatarFallback>ME</AvatarFallback>
                   </Avatar>
                )}
              </div>
            ))
          )}
          
          {isTyping && (
             <div className="flex items-center gap-2 text-xs text-muted-foreground ml-2">
                <Avatar className="h-6 w-6">
                    <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="animate-pulse">Thinking...</div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t p-4 bg-white">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input 
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..." 
            className="flex-1 bg-white" 
          />
          <Button type="submit" size="icon" variant="default" disabled={!input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  )
}

export function ChatTrigger() {
  const { open, setOpen } = useSidebar()

  return (
    <Button
      onClick={() => setOpen(true)}
      className={cn(
        "fixed bottom-8 right-8 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300",
        open ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
      )}
      size="icon"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="sr-only">Open Chat</span>
    </Button>
  )
}
