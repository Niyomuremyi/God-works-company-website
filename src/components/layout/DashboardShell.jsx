"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

/**
 * Generic sidebar shell used by both the admin and customer areas.
 * All area-specific bits (nav items, branding, footer links) are passed in as props.
 */
export function DashboardShell({
  brandLabel,
  brandInitial,
  brandHref,
  navItems,
  footerLinks = [],
  children,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, ready, isLoggedIn, logout } = useAuth();

  const isItemActive = (href) =>
    href === brandHref ? pathname === href : pathname.startsWith(href);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout?.();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900 lg:hidden">
        <Link href={brandHref} className="flex items-center gap-2">
          <BrandMark initial={brandInitial} />
          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {brandLabel}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {ready && isLoggedIn && (
            <UserBadge
              user={user}
              open={userMenuOpen}
              onToggle={() => setUserMenuOpen((v) => !v)}
              onLogout={handleLogout}
              compact
            />
          )}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — logo only, no badge here */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-zinc-200 bg-white transition-transform dark:border-zinc-800 dark:bg-zinc-900",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
            <Link
              href={brandHref}
              className="flex items-center gap-2"
              onClick={() => setSidebarOpen(false)}
            >
              <BrandMark initial={brandInitial} />
              <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {brandLabel}
              </span>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive = isItemActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {footerLinks.length > 0 && (
            <div className="space-y-3 border-t border-zinc-200 px-3 py-4 dark:border-zinc-800">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    link.primary
                      ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                      : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  )}
                >
                  {link.label}
                  {link.icon && <link.icon className="h-4 w-4" />}
                </Link>
              ))}
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 pt-14 lg:ml-64 lg:pt-0">
        {/* Desktop top bar — badge pinned to the far right of the page, opposite the sidebar */}
        <div className="hidden h-16 items-center justify-end border-b border-zinc-200 px-8 dark:border-zinc-800 lg:flex">
          {ready && isLoggedIn && (
            <UserBadge
              user={user}
              open={userMenuOpen}
              onToggle={() => setUserMenuOpen((v) => !v)}
              onLogout={handleLogout}
              compact
            />
          )}
        </div>

        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

function UserBadge({ user, open, onToggle, onLogout, compact = false }) {
  const name = user?.name || user?.email || "Account";
  const initial = (user?.name || user?.email || "?").charAt(0).toUpperCase();

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex items-center gap-2 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
          compact ? "p-1.5" : "w-full px-2 py-2"
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
          {initial}
        </span>
        {!compact && (
          <>
            <span className="flex-1 truncate text-left">{name}</span>
            <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} />
          </>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40"
            onClick={onToggle}
          />
          <div
            className={cn(
              "absolute right-0 z-50 mt-1 w-48 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900",
              compact ? "top-full" : "left-0 right-0"
            )}
          >
            <div className="truncate px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
              {name}
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function BrandMark({ initial }) {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
      <span className="text-sm font-bold text-white dark:text-zinc-900">{initial}</span>
    </div>
  );
}