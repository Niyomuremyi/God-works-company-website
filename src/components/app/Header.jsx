"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, ShoppingBag, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const totalItems = 3; // placeholder for cart items
  const isChatOpen = false; // placeholder for chat
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            God Works LTD
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* My Orders */}
          <Button asChild>
            <Link href="/customer" className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <span className="text-sm font-medium">My Orders</span>
            </Link>
          </Button>

          {/* AI Shopping Assistant */}
          {!isChatOpen && (
            <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200/50 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-300/50 dark:shadow-amber-900/30 dark:hover:shadow-amber-800/40">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Send Message</span>
            </Button>
          )}

          {/* Cart Button */}
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
            <span className="sr-only">Open cart ({totalItems} items)</span>
          </Button>

          {/* User Icon */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setUserMenuOpen((prev) => !prev)}
              >
                <User className="h-5 w-5" />
                <span className="sr-only">User</span>
              </Button>

              {userMenuOpen && (
                <div className="absolute right-0 top-12 w-40 rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                  <Link
                    href="/login"
                    className="block px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="block px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
        </div>
      </div>
    </header>
  );
}