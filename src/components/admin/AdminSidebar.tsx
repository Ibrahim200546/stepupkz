import { LayoutDashboard, Package, ShoppingCart, Users, Settings, BarChart3, TrendingUp, MessageSquare, Store, AlertTriangle } from "lucide-react";
import { NavLink } from "react-router-dom";
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
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Analysis", url: "/admin/analysis", icon: TrendingUp },
  { title: "Заказы", url: "/admin/orders", icon: ShoppingCart },
  { title: "Товары", url: "/admin/products", icon: Package },
  { title: "Пользователи", url: "/admin/users", icon: Users },
  { title: "Продавцы", url: "/admin/vendors", icon: Store },
  { title: "Чаты", url: "/admin/chats", icon: MessageSquare },
  { title: "Жалобы", url: "/admin/reports", icon: AlertTriangle },
  { title: "Настройки", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <div className="p-4">
          <h2 className={`font-bold text-lg transition-opacity ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            StepUp Admin
          </h2>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>
            Навигация
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
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
  );
}
