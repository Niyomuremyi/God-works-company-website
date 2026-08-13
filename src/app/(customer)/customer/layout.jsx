"use client";

import { LayoutDashboard, ShoppingCart, User, MapPin, MessageCircle } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useUnreadMessages } from "@/lib/hooks/useUnreadMessages";

const footerLinks = [{ label: "← Back to Store", href: "/" }];

export default function CustomerLayout({ children }) {
  const unreadCount = useUnreadMessages();

  const navItems = [
    { label: "Dashboard", href: "/customer", icon: LayoutDashboard },
    { label: "Orders", href: "/customer/orders", icon: ShoppingCart },
    { label: "Messages", href: "/customer/messages", icon: MessageCircle, badgeCount: unreadCount },
    { label: "Profile", href: "/customer/profile", icon: User },
    { label: "Addresses", href: "/customer/addresses", icon: MapPin },
  ];

  return (
    <DashboardShell
      brandLabel="My Account"
      brandInitial="C"
      brandHref="/customer"
      navItems={navItems}
      footerLinks={footerLinks}
    >
      {children}
    </DashboardShell>
  );
}