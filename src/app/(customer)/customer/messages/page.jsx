"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyConversations, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export default function CustomerMessagesPage() {
  const router = useRouter();
  const { ready, isLoggedIn } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ready) return;
    if (!isLoggedIn) {
      router.push("/login?redirect=/customer/messages");
      return;
    }
    getMyConversations()
      .then(setConversations)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load messages"))
      .finally(() => setLoading(false));
  }, [ready, isLoggedIn]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Messages" subtitle="Conversations with sellers" />

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : conversations.length === 0 ? (
        <EmptyState icon={MessageCircle} title="No conversations yet" description="Chats you start with sellers will appear here." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/customer/messages/${c.id}`}
              className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3 last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{c.otherPartyName}</p>
                  {c.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
                      {c.unreadCount > 9 ? "9+" : c.unreadCount}
                    </span>
                  )}
                </div>
                {c.productName && <p className="text-xs text-zinc-500 dark:text-zinc-400">Re: {c.productName}</p>}
                <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">{c.lastMessage || "No messages yet"}</p>
              </div>
              {c.lastMessageAt && (
                <p className="shrink-0 text-xs text-zinc-400">{formatDate(c.lastMessageAt, "short")}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}