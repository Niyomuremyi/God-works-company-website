"use client";

import { LayoutDashboard, Package, ShoppingCart, ExternalLink } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Inventory", href: "/admin/inventory", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
];

const footerLinks = [
  { label: "Open Studio", href: "/studio", icon: ExternalLink, external: true, primary: true },
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