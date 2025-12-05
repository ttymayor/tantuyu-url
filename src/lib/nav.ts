"use client";

import { LucideIcon, LayoutDashboard } from "lucide-react";

const SidebarMenuList: {
  navMain: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
} = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
  ],
};

export default SidebarMenuList;
