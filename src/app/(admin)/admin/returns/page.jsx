"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Check, X } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { getSellerReturns, resolveReturnRequest, ApiError } from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";
import { useToast } from "@/components/shared/Toast";

const STATUS_STYLES = {
  requested: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  approved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  rejected: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

export default function SellerReturnsPage() {
  const router = useRouter();
  const { user, ready, isLoggedIn } = useAuth();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
const toast = useToast();

const [resolveTarget, setResolveTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReturns(await getSellerReturns());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load returns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!isLoggedIn || user.role !== "seller") {
      router.push("/login?redirect=/admin/returns");
      return;
    }
    load();
  }, [ready, isLoggedIn, load]);

  const handleResolve = async (returnId, decision, note) => {
  try {
    await resolveReturnRequest(returnId, decision, note);
    setReturns((current) =>
      current.map((r) => (r.id === returnId ? { ...r, status: decision, resolution_note: note } : r))
    );
    toast(`Return ${decision}`, { type: "success" });
  } catch (err) {
    toast(err instanceof ApiError ? err.message : "Failed to resolve return request", { type: "error" });
  }
};

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Return Requests" subtitle="Review and resolve customer return requests" />

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : returns.length === 0 ? (
        <EmptyState icon={RotateCcw} title="No return requests" description="Return requests from customers will appear here." />
      ) : (
        <div className="space-y-3">
          {returns.map((r) => (
            <div key={r.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{r.product_name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {r.customer_name} · Qty {r.quantity} · {formatPrice(Number(r.subtotal))}
                  </p>
                  <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="font-medium">Reason:</span> {r.reason}
                  </p>
                  {r.resolution_note && (
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      <span className="font-medium">Your note:</span> {r.resolution_note}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-zinc-400">Requested {formatDate(r.created_at, "datetime")}</p>
                </div>

                {r.status === "requested" && (
  <div className="flex gap-2">
    <button
      type="button"
      onClick={() => setResolveTarget({ returnRequest: r, decision: "approved" })}
      className="flex items-center gap-1 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400"
    >
      <Check className="h-3.5 w-3.5" />
      Approve
    </button>
    <button
      type="button"
      onClick={() => setResolveTarget({ returnRequest: r, decision: "rejected" })}
      className="flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400"
    >
      <X className="h-3.5 w-3.5" />
      Reject
    </button>
  </div>
)}
              </div>
            </div>
          ))}
        </div>
      )}
      {resolveTarget && (
  <ResolveReturnModal
    returnRequest={resolveTarget.returnRequest}
    decision={resolveTarget.decision}
    onClose={() => setResolveTarget(null)}
    onSubmit={handleResolve}
  />
)}
    </div>
  );
}