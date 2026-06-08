"use client"

import { Home, MapPin, Building, Tags, Package, ArrowRightLeft, FileSpreadsheet, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
import { logout } from "@/app/actions/auth"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

const overviewItems = [
  { title: "Dashboard", subtitle: "Overview and metrics", url: "/", icon: Home },
  { title: "Reports", subtitle: "Export and analytics", url: "/reports", icon: FileSpreadsheet },
]

const managementItems = [
  { title: "Locations", subtitle: "Manage regions", url: "/locations", icon: MapPin },
  { title: "Estates", subtitle: "Manage properties", url: "/estates", icon: Building },
]

const inventoryItems = [
  { title: "Categories", subtitle: "Product groupings", url: "/categories", icon: Tags },
  { title: "Products", subtitle: "Inventory database", url: "/products", icon: Package },
  { title: "Allocations", subtitle: "Stock assignments", url: "/allocations", icon: ArrowRightLeft },
]

export function AppSidebar() {
  const pathname = usePathname()

  const checkActive = (url: string) => {
    if (url === "/") {
      return pathname === "/"
    }
    return pathname?.startsWith(url)
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="font-bold text-lg text-primary">OliveEstate</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {overviewItems.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-1">
                  <SidebarMenuButton
                    render={<a href={item.url} />}
                    className={`h-auto py-2.5 px-3 mx-2 w-[calc(100%-1rem)] rounded-xl transition-all duration-200 ${checkActive(item.url)
                      ? '!bg-primary !text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                      }`}
                  >
                    <item.icon className={`h-5 w-5 shrink-0 ${checkActive(item.url) ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    <div className="flex flex-col items-start text-left ml-2.5">
                      <span className={`font-bold text-[15px] leading-tight ${checkActive(item.url) ? 'text-primary-foreground' : ''}`}>{item.title}</span>
                      {!checkActive(item.url) && (
                        <span className="text-[12px] font-medium opacity-70 mt-0.5">{item.subtitle}</span>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-1">
                  <SidebarMenuButton
                    render={<a href={item.url} />}
                    className={`h-auto py-2.5 px-3 mx-2 w-[calc(100%-1rem)] rounded-xl transition-all duration-200 ${checkActive(item.url)
                      ? '!bg-primary !text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                      }`}
                  >
                    <item.icon className={`h-5 w-5 shrink-0 ${checkActive(item.url) ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    <div className="flex flex-col items-start text-left ml-2.5">
                      <span className={`font-bold text-[15px] leading-tight ${checkActive(item.url) ? 'text-primary-foreground' : ''}`}>{item.title}</span>
                      {!checkActive(item.url) && (
                        <span className="text-[12px] font-medium opacity-70 mt-0.5">{item.subtitle}</span>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Inventory</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {inventoryItems.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-1">
                  <SidebarMenuButton
                    render={<a href={item.url} />}
                    className={`h-auto py-2.5 px-3 mx-2 w-[calc(100%-1rem)] rounded-xl transition-all duration-200 ${checkActive(item.url)
                      ? '!bg-primary !text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                      }`}
                  >
                    <item.icon className={`h-5 w-5 shrink-0 ${checkActive(item.url) ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    <div className="flex flex-col items-start text-left ml-2.5">
                      <span className={`font-bold text-[15px] leading-tight ${checkActive(item.url) ? 'text-primary-foreground' : ''}`}>{item.title}</span>
                      {!checkActive(item.url) && (
                        <span className="text-[12px] font-medium opacity-70 mt-0.5">{item.subtitle}</span>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="p-4 mt-auto border-t">
        <form action={logout}>
          <button type="submit" className="flex items-center justify-center w-full gap-2 py-2.5 px-4 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-medium">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </Sidebar>
  )
}
