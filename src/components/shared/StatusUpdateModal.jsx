"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ITEM_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export function StatusUpdateModal({ item, onClose, onSubmit }) {
  const [status, setStatus] = useState(item.item_status);
  const [note, setNote] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [saving, setSaving] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(item.id, status, note || null, estimatedDelivery || null, cancellationReason || null);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Update Status</h2>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">{item.product_name}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            >
              {ITEM_STATUSES.map((s) => (
                <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
{status === "cancelled" && (
  <div>
    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
      Cancellation reason
    </label>
    <textarea
      value={cancellationReason}
      onChange={(e) => setCancellationReason(e.target.value)}
      rows={2}
      placeholder="e.g. Out of stock, customer requested"
      className="w-full resize-none rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
    />
  </div>
)}

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Estimated delivery <span className="font-normal text-zinc-400">(optional)</span>
            </label>
            <input
              type="date"
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Note <span className="font-normal text-zinc-400">(optional — e.g. carrier info, handoff details)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="e.g. Carried by Jean, expected in Kigali by 3pm"
              className="w-full resize-none rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Update"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}