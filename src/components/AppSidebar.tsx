import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  TrendingUp, 
  AlertTriangle,
  Settings,
  Tag,
  BarChart3
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
  { title: "Reportes", url: "/reports", icon: BarChart3 },
  { title: "Alertas", url: "/alerts", icon: AlertTriangle },
  { title: "Configuración", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const getNavClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition-transform duration-200 transform ${isActive
      ? "bg-primary text-primary-foreground shadow-elegant font-medium scale-105"
      : "text-slate-700 hover:text-slate-900 hover:scale-110"
    }`

  return (
    <Sidebar className={`${isCollapsed ? "w-16" : "w-64"} transition-all duration-300 ease-in-out border-r border-border bg-card`}>
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
                  
                    <NavLink to={item.url} end className={getNavClasses}>
                      <item.icon className={`h-5 w-5 ${isCollapsed ? "mx-auto" : ""}`} />
                      <span className={`${isCollapsed ? 'sr-only' : ''}`}>{item.title}</span>
                    </NavLink>
                  
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
                  
                    <NavLink to={item.url} className={getNavClasses}>
                      <item.icon className={`h-5 w-5 ${isCollapsed ? "mx-auto" : ""}`} />
                      <span className={`${isCollapsed ? 'sr-only' : ''}`}>{item.title}</span>
                    </NavLink>
                  
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}