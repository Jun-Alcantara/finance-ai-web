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

export function ChatSidebar() {
  const { setOpen } = useSidebar()

  return (
    <Sidebar side="right" collapsible="offcanvas" variant="sidebar" className="border-l border-border bg-white text-foreground">
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
        <div className="flex flex-col gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center opacity-50">
            <MessageCircle className="h-10 w-10" />
            <p>Start a new conversation</p>
          </div>
          {/* Messages would go here */}
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t p-4 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            // Handle send
          }}
          className="flex gap-2"
        >
          <Input placeholder="Type a message..." className="flex-1 bg-white" />
          <Button type="submit" size="icon" variant="default">
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
