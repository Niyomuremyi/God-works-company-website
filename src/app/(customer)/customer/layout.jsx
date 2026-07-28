"use client";

import { LayoutDashboard, ShoppingCart, User, MapPin } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";

const navItems = [
  { label: "Dashboard", href: "/customer", icon: LayoutDashboard },
  { label: "Orders", href: "/customer/orders", icon: ShoppingCart },
  { label: "Profile", href: "/customer/profile", icon: User },
  { label: "Addresses", href: "/customer/addresses", icon: MapPin },
];

const footerLinks = [{ label: "← Back to Store", href: "/" }];

export default function CustomerLayout({ children }) {
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