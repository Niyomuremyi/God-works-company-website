"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMyConversations, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ChatWindow } from "@/components/shared/ChatWindow";

export default function CustomerConversationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { ready, isLoggedIn } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ready) return;
    if (!isLoggedIn) {
      router.push(`/login?redirect=/customer/messages/${id}`);
      return;
    }
    getMyConversations()
      .then((list) => {
        const found = list.find((c) => String(c.id) === String(id));
        if (!found) {
          setError("Conversation not found");
        } else {
          setConversation(found);
        }
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load conversation"))
      .finally(() => setLoading(false));
  }, [ready, isLoggedIn, id]);

  if (loading) return <p className="text-sm text-zinc-500">Loading...</p>;
  if (error || !conversation) return <p className="text-sm text-zinc-500">{error ?? "Conversation not found"}</p>;

  return <ChatWindow conversation={conversation} backHref="/customer/messages" />;
}