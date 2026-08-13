"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Image as ImageIcon, Package, ShoppingBag } from "lucide-react";
import { getMessages, sendMessage, markConversationRead, uploadChatImage, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/shared/Toast";
import { formatDate } from "@/lib/utils";

const POLL_INTERVAL_MS = 3500;

export function ChatWindow({ conversation, backHref }) {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const lastIdRef = useRef(null);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  const poll = useCallback(async () => {
    try {
      const newMessages = await getMessages(conversation.id, lastIdRef.current || undefined);
      if (newMessages.length > 0) {
        setMessages((current) => [...current, ...newMessages]);
        lastIdRef.current = newMessages[newMessages.length - 1].id;
        markConversationRead(conversation.id).catch(() => {});
      }
    } catch {
      // silent — a missed poll tick isn't worth surfacing to the user
    }
  }, [conversation.id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMessages(conversation.id)
      .then((data) => {
        if (cancelled) return;
        setMessages(data);
        if (data.length > 0) lastIdRef.current = data[data.length - 1].id;
        markConversationRead(conversation.id).catch(() => {});
      })
      .finally(() => !cancelled && setLoading(false));

    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [conversation.id, poll]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const message = await sendMessage(conversation.id, { body: text.trim() });
      setMessages((current) => [...current, message]);
      lastIdRef.current = message.id;
      setText("");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to send message", { type: "error" });
    } finally {
      setSending(false);
    }
  };

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadChatImage(file);
      const message = await sendMessage(conversation.id, { attachmentUrl: url });
      setMessages((current) => [...current, message]);
      lastIdRef.current = message.id;
    } catch (err) {
      toast(err.message || "Failed to send image", { type: "error" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:h-[calc(100vh-6rem)]">
      <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => router.push(backHref)}
          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 lg:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">{conversation.otherPartyName}</p>
          {conversation.productName && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Re: {conversation.productName}</p>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading ? (
          <p className="text-center text-sm text-zinc-400">Loading conversation...</p>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              isOwn={m.sender_id === user?.id}
              conversation={conversation}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleImagePick}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="shrink-0 rounded-md p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          aria-label="Attach image"
        >
          <ImageIcon className="h-5 w-5" />
        </button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={uploading ? "Uploading image..." : "Type a message..."}
          disabled={uploading}
          className="flex-1 rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="shrink-0 rounded-md bg-zinc-900 p-2 text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function MessageBubble({ message, isOwn, conversation }) {
  if (message.type === "product_ref" || message.type === "order_ref") {
    const Icon = message.type === "order_ref" ? ShoppingBag : Package;
    return (
      <div className="flex justify-center">
        <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          <Icon className="h-3.5 w-3.5" />
          {message.type === "order_ref"
            ? `Started chat about Order #${message.body}`
            : `Started chat about ${conversation.productName || `Product #${message.body}`}`}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
          isOwn
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
        }`}
      >
        {message.type === "image" && message.attachment_url && (
          <img src={message.attachment_url} alt="Attachment" className="mb-1 max-h-64 rounded-lg" />
        )}
        {message.body && <p>{message.body}</p>}
        <p className={`mt-1 text-[10px] ${isOwn ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-400"}`}>
          {formatDate(message.created_at, "datetime")}
        </p>
      </div>
    </div>
  );
}