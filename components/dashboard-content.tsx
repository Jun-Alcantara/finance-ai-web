"use client"

import * as React from "react"
import { PanelLeft } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { ChatSidebar, ChatTrigger } from "@/components/chat-window"
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export function DashboardContent({ children }: { children: React.ReactNode }) {
  // Access the Outer (Left) Sidebar Context
  const { toggleSidebar } = useSidebar()

  // Create a trigger that uses the Outer Sidebar context
  const customTrigger = (
    <Button 
      onClick={toggleSidebar} 
      variant="ghost" 
      size="icon" 
      className="-ml-1 h-7 w-7"
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )

  return (
    <SidebarProvider 
      defaultOpen={false} 
      style={{ "--sidebar-width": "400px" } as React.CSSProperties}
      className="flex h-full w-full flex-1 overflow-hidden"
    >
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        {/* Pass the custom keyed trigger to SiteHeader */}
        <SiteHeader trigger={customTrigger} />
        <div className="flex flex-1 flex-col gap-4 overflow-auto p-4 pt-0">
          {children}
        </div>
        <ChatTrigger />
      </div>
      <ChatSidebar />
    </SidebarProvider>
  )
}
