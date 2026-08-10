"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResolveReturnModal({ returnRequest, decision, onClose, onSubmit }) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const isApproving = decision === "approved";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(returnRequest.id, decision, note.trim() || null);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {isApproving ? "Approve Return" : "Reject Return"}
          </h2>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-1 text-sm text-zinc-500 dark:text-zinc-400">{returnRequest.product_name}</p>
        <p className="mb-4 text-sm text-zinc-700 dark:text-zinc-300">
          <span className="font-medium">Customer's reason:</span> {returnRequest.reason}
        </p>

        {isApproving && (
          <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            Approving will restock this item and mark it as returned.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Note to customer <span className="font-normal text-zinc-400">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder={isApproving ? "e.g. Refund processed via cash" : "e.g. Item shows signs of use, past return window"}
              className="w-full resize-none rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving} variant={isApproving ? "default" : "destructive"}>
              {saving ? "Saving..." : isApproving ? "Approve Return" : "Reject Return"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}