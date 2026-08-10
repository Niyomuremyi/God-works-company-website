"use client";

import { LayoutDashboard, Package, ShoppingCart, ExternalLink, RotateCcw, Wallet } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Inventory", href: "/admin/inventory", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Returns", href: "/admin/returns", icon: RotateCcw },
  { label: "Earnings", href: "/admin/earnings", icon: Wallet },
];

const footerLinks = [
  { label: "Open Studio", href: "/studio", external: true, icon: ExternalLink, primary: true },
  { label: "← Back to Store", href: "/" },
];

export default function AdminLayout({ children }) {
  return (
    <DashboardShell
      brandLabel="Admin"
      brandInitial="A"
      brandHref="/admin"
      navItems={navItems}
      footerLinks={footerLinks}
    >
      {children}
    </DashboardShell>
  );
}