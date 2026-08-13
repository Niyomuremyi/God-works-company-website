"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  ShoppingBag,
  Sparkles,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

export function Header() {
  const router = useRouter();

  const totalItems = 3; // placeholder for cart items
  const isChatOpen = false; // placeholder for chat

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user, ready, isLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout?.();
    router.push("/login");
  };

  const name = user?.name || user?.email || "Account";

  const initial = (
    user?.name ||
    user?.email ||
    "?"
  )
    .charAt(0)
    .toUpperCase();

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
          {ready && isLoggedIn && (
            <Button asChild variant="ghost">
              <Link
                href="/customer"
                className="flex items-center gap-2"
              >
                <Package className="h-5 w-5" />
                <span className="hidden text-sm font-medium sm:inline">
                  My Orders
                </span>
              </Link>
            </Button>
          )}

          {/* AI Shopping Assistant */}
          {!isChatOpen && (
            <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200/50 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-300/50 dark:shadow-amber-900/30 dark:hover:shadow-amber-800/40">
              <Sparkles className="h-4 w-4" />

              <span className="hidden text-sm font-medium sm:inline">
                Send Message
              </span>
            </Button>
          )}

          {/* Cart Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
          >
            <ShoppingBag className="h-5 w-5" />

            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}

            <span className="sr-only">
              Open cart ({totalItems} items)
            </span>
          </Button>

          {/* User Menu */}
          {ready && (
            <div className="relative">

              {/* Logged in */}
              {isLoggedIn ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setUserMenuOpen((prev) => !prev)
                    }
                    className="flex items-center gap-2 rounded-lg p-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {/* User Initial */}
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                      {initial}
                    </span>

                    {/* User Name */}
                    <span className="hidden max-w-32 truncate sm:block">
                      {name}
                    </span>

                    <ChevronDown
                      className={cn(
                        "hidden h-4 w-4 shrink-0 transition-transform sm:block",
                        userMenuOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {userMenuOpen && (
                    <>
                      {/* Click outside overlay */}
                      <button
                        type="button"
                        aria-label="Close menu"
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() =>
                          setUserMenuOpen(false)
                        }
                      />

                      {/* Dropdown */}
                      <div className="absolute right-0 z-50 mt-2 w-52 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                        
                        <div className="border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
                          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {name}
                          </p>

                          {user?.email && user?.name && (
                            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                              {user.email}
                            </p>
                          )}
                        </div>

                        <Link
                          href="/customer"
                          onClick={() =>
                            setUserMenuOpen(false)
                          }
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          <Package className="h-4 w-4" />
                          My Orders
                        </Link>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                        >
                          <LogOut className="h-4 w-4" />
                          Log out
                        </button>

                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Guest */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setUserMenuOpen((prev) => !prev)
                    }
                  >
                    <User className="h-5 w-5" />

                    <span className="sr-only">
                      User menu
                    </span>
                  </Button>

                  {userMenuOpen && (
                    <>
                      <button
                        type="button"
                        aria-label="Close menu"
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() =>
                          setUserMenuOpen(false)
                        }
                      />

                      <div className="absolute right-0 z-50 mt-2 w-40 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                        <Link
                          href="/login"
                          className="block rounded-md px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          onClick={() =>
                            setUserMenuOpen(false)
                          }
                        >
                          Log in
                        </Link>

                        <Link
                          href="/register"
                          className="block rounded-md px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          onClick={() =>
                            setUserMenuOpen(false)
                          }
                        >
                          Register
                        </Link>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}