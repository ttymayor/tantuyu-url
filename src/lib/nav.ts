"use client";

import { LucideIcon, LayoutDashboard, CircleGauge } from "lucide-react";

const SidebarMenuList: {
  navMain: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
} = {
  navMain: [
    {
      title: "Overview",
      url: "/overview",
      icon: LayoutDashboard,
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: CircleGauge,
    },
  ],
};

export default SidebarMenuList;
