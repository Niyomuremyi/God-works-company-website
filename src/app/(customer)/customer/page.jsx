"use client";

import { useEffect, useState } from "react";
import { Package, DollarSign, Heart } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CustomerStatCard } from "@/components/customer";
import { CustomerOrderRow, CustomerOrderRowSkeleton, CustomerOrderTableHeader } from "@/components/customer";
import { Table, TableBody } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { ShoppingCart } from "lucide-react";
import { getCustomerDashboard } from "@/lib/api";

function mapOrderForTable(order) {
  return {
    id: order.id,
    items: order.items?.length ?? 0,
    total: Number(order.total_amount),
    status: order.status,
    date: order.created_at?.slice(0, 10),
  };
}

export default function CustomerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomerDashboard("email@gmai.com")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const recentOrders = (data?.recentOrders ?? []).map(mapOrderForTable);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="My Account" subtitle="Welcome back — here's what's new." />

      <div className="grid gap-4 sm:grid-cols-3">
        <CustomerStatCard
          title="Total Orders"
          icon={Package}
          value={loading ? "—" : data?.totalOrders ?? 0}
          href="/customer/orders"
        />
        <CustomerStatCard
          title="Total Spent"
          icon={DollarSign}
          value={loading ? "—" : `$${(data?.totalSpent ?? 0).toFixed(2)}`}
        />
        <CustomerStatCard
          title="Wishlist Items"
          icon={Heart}
          value={loading ? "—" : data?.wishlistCount ?? 0}
          href="/customer/wishlist"
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:px-6 sm:py-4">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Recent Orders</h2>
        </div>

        {!loading && recentOrders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No orders yet"
            description="When you place an order, it'll show up here."
          />
        ) : (
          <Table>
            <CustomerOrderTableHeader />
            <TableBody>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <CustomerOrderRowSkeleton key={i} />)
                : recentOrders.map((order) => <CustomerOrderRow key={order.id} order={order} />)}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}