"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, TrendingUp, Clock, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/admin";
import { useAuth } from "@/lib/auth";
import { getSellerEarnings, ApiError } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export default function SellerEarningsPage() {
  const router = useRouter();
  const { user, ready, isLoggedIn } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ready) return;
    if (!isLoggedIn || user.role !== "seller") {
      router.push("/login?redirect=/admin/earnings");
      return;
    }
    getSellerEarnings()
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load earnings"))
      .finally(() => setLoading(false));
  }, [ready, isLoggedIn]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Earnings" subtitle="Revenue collected from cash-on-delivery orders" />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Collected"
          icon={Wallet}
          value={loading ? "—" : formatPrice(data?.totalCollected ?? 0)}
        />
        <StatCard
          title="This Month"
          icon={TrendingUp}
          value={loading ? "—" : formatPrice(data?.collectedThisMonth ?? 0)}
        />
        <StatCard
          title="Pending Delivery"
          icon={Clock}
          value={loading ? "—" : formatPrice(data?.pendingDelivery ?? 0)}
        />
        <StatCard
          title="Returned"
          icon={RotateCcw}
          value={loading ? "—" : formatPrice(data?.totalReturned ?? 0)}
        />
      </div>

      <p className="text-xs text-zinc-400">
        Figures reflect cash-on-delivery amounts recorded in the system, not a real payout transfer.
      </p>
    </div>
  );
}