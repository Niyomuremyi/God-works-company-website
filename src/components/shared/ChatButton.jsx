"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startConversation, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/shared/Toast";

export function ChatButton({ productId, orderId, itemId, label = "Chat with Seller", variant = "outline" }) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }
    setLoading(true);
    try {
      const { id } = await startConversation({ productId, orderId, itemId });
      router.push(`/customer/messages/${id}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to start conversation", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" variant={variant} onClick={handleClick} disabled={loading}>
      <MessageCircle className="mr-2 h-4 w-4" />
      {loading ? "Starting chat..." : label}
    </Button>
  );
}