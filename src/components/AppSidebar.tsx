"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav/NavUser";
import { NavMain } from "@/components/nav/NavMain";
import { Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard">
                <LinkIcon className="size-5" />
                <span className="text-lg font-semibold">tantuyu 的短網址</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        {session?.user && (
            <NavUser
            user={{ 
                name: session.user.name || "User", 
                email: session.user.email || "", 
                avatar: session.user.image || "" 
            }}
            />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
