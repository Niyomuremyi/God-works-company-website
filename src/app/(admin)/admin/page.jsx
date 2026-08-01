"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, ShoppingCart, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard, LowStockAlert, RecentOrders, AIInsightsCard } from "@/components/admin";
import { useAuth } from "@/lib/auth";
import { getSellerDashboard } from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, ready, isLoggedIn } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (!isLoggedIn || user.role !== "seller") {
      router.push("/login?redirect=/admin");
      return;
    }
    getSellerDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, [ready, isLoggedIn]);

  const handleCreateProduct = () => router.push("/admin/inventory");

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">Overview of your store</p>
        </div>
        <Button onClick={handleCreateProduct} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          New Product
        </Button>
      </div>

      <AIInsightsCard />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Products" icon={Package} value={loading ? "—" : data?.totalProducts ?? 0} href="/admin/inventory" />
        <StatCard title="Total Orders" icon={ShoppingCart} value={loading ? "—" : data?.totalOrders ?? 0} href="/admin/orders" />
        <StatCard title="Low Stock Items" icon={TrendingUp} value={loading ? "—" : data?.lowStockCount ?? 0} href="/admin/inventory" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LowStockAlert items={data?.lowStockItems ?? []} loading={loading} />
        <RecentOrders orders={data?.recentOrders ?? []} loading={loading} />
      </div>
    </div>
  );
}