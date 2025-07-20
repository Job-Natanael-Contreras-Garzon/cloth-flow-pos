import { useState } from "react"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  TrendingUp, 
  AlertTriangle,
  Settings,
  Tag
} from "lucide-react"
import { NavLink } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Punto de Venta", url: "/pos", icon: ShoppingCart },
  { title: "Inventario", url: "/inventory", icon: Package },
  { title: "Ventas", url: "/sales", icon: TrendingUp },
]

const managementItems = [
  { title: "Compras", url: "/purchases", icon: History },
  { title: "Categorías", url: "/categories", icon: Tag },
  { title: "Alertas", url: "/alerts", icon: AlertTriangle },
  { title: "Configuración", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const getNavClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth ${
      isActive 
        ? "bg-primary text-primary-foreground shadow-elegant font-medium" 
        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
    }`

  return (
    <Sidebar className={`${isCollapsed ? "w-16" : "w-64"} border-r border-border bg-card`}>
      <SidebarContent className="p-4">
        {/* Logo/Brand */}
        <div className="mb-6 px-2">
          {!isCollapsed ? (
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Fashion POS
            </h1>
          ) : (
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-0">
                    <NavLink to={item.url} end className={getNavClasses}>
                      <item.icon className={`h-5 w-5 ${isCollapsed ? "mx-auto" : ""}`} />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management Navigation */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Gestión
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-0">
                    <NavLink to={item.url} className={getNavClasses}>
                      <item.icon className={`h-5 w-5 ${isCollapsed ? "mx-auto" : ""}`} />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}