"use client";

import { useEffect, useState } from "react";
import { getMyConversations } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const POLL_INTERVAL_MS = 15000;

export function useUnreadMessages() {
  const { ready, isLoggedIn } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!ready || !isLoggedIn) return;

    let cancelled = false;
    const check = async () => {
      try {
        const conversations = await getMyConversations();
        if (!cancelled) {
          setUnreadCount(conversations.reduce((sum, c) => sum + c.unreadCount, 0));
        }
      } catch {
        // silent — badge just won't update this tick
      }
    };

    check();
    const interval = setInterval(check, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [ready, isLoggedIn]);

  return unreadCount;
}