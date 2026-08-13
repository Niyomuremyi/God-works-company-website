import { request } from "./client";

export const getMyConversations = () => request("/api/chat/conversations");

export const startConversation = ({ productId, orderId, itemId }) =>
  request("/api/chat/conversations", {
    method: "POST",
    body: JSON.stringify({ productId, orderId, itemId }),
  });

export const getMessages = (conversationId, afterId) =>
  request(`/api/chat/conversations/${conversationId}/messages${afterId ? `?after=${afterId}` : ""}`);

export const sendMessage = (conversationId, { body, attachmentUrl }) =>
  request(`/api/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ body, attachmentUrl }),
  });

export const markConversationRead = (conversationId) =>
  request(`/api/chat/conversations/${conversationId}/read`, { method: "POST" });