"use client"

import * as React from "react"
import {
  SquareTerminal,
  Bot,
  Settings2,
  LifeBuoy,
  Send,
  PieChart,
  Wallet,
  Receipt,
  Landmark,
  BookOpen,
  LayoutDashboard,
  Tags,
  ChevronRight,
  Briefcase,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// Menu items.
interface MenuItem {
  title: string
  url: string
  icon: any
  items?: {
    title: string
    url: string
  }[]
}

const items: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Categories",
    url: "/categories",
    icon: Tags,
  },
  {
    title: "Source of Income",
    url: "/source-of-incomes",
    icon: Briefcase,
  },
  {
    title: "Incomes",
    url: "/incomes",
    icon: Wallet,
  },
  {
    title: "Expenses",
    url: "/expenses",
    icon: Receipt,
  },
  {
    title: "Bank Accounts",
    url: "/bank-accounts",
    icon: Landmark,
  },
  {
    title: "Ledger",
    url: "/ledger",
    icon: BookOpen,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <PieChart className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Finance AI</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                    {item.items ? (
                        <Collapsible
                        key={item.title}
                        defaultOpen={false} // Closed by default
                        className="group/collapsible"
                        >
                            <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={item.title}>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                            <SidebarMenuSub>
                                {item.items?.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton asChild>
                                    <a href={subItem.url}>
                                        <span>{subItem.title}</span>
                                    </a>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                            </CollapsibleContent>
                        </Collapsible>
                    ) : (
                        <SidebarMenuButton asChild tooltip={item.title}>
                        <a href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                        </a>
                        </SidebarMenuButton>
                    )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
