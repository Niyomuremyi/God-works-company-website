"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminSearch } from "@/components/admin";
import { useAuth } from "@/lib/auth";
import { getSellerOrders, updateOrderItemStatus, ApiError } from "@/lib/api";

const ITEM_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const ITEM_STATUS_TABS = [{ value: "all", label: "All" }, ...ITEM_STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))];

function mapItemForTable(item) {
  return {
    id: item.id,
    orderId: item.order_id,
    product: item.product_name,
    quantity: item.quantity,
    subtotal: Number(item.subtotal),
    customer: item.customer_name,
    email: item.customer_email,
    status: item.item_status,
    date: item.order_created_at?.slice(0, 10),
  };
}

function statusBadgeClass(status) {
  switch (status) {
    case "delivered": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
    case "shipped": return "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
    case "confirmed": return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
    case "cancelled": return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400";
    default: return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  }
}

export default function SellerOrdersPage() {
  const router = useRouter();
  const { user, ready, isLoggedIn } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await getSellerOrders());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!isLoggedIn || user.role !== "seller") {
      router.push("/login?redirect=/admin/orders");
      return;
    }
    loadOrders();
  }, [ready, isLoggedIn, loadOrders]);

  const handleStatusChange = async (itemId, status) => {
    const previous = items;
    setItems((current) => current.map((i) => (i.id === itemId ? { ...i, item_status: status } : i)));
    try {
      await updateOrderItemStatus(itemId, status);
    } catch (err) {
      setItems(previous);
      alert(err instanceof ApiError ? err.message : "Failed to update item status");
    }
  };

  const filteredItems = items
    .map(mapItemForTable)
    .filter((item) => statusFilter === "all" || item.status === statusFilter)
    .filter((item) => {
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      return item.email?.toLowerCase().includes(q) || item.product?.toLowerCase().includes(q) || String(item.orderId).includes(q);
    });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
          Line items from customer orders that include your products
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <AdminSearch
          placeholder="Search by product, order #, or email..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full sm:max-w-xs"
        />
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="w-max">
              {ITEM_STATUS_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && filteredItems.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No orders found" description="Orders containing your products will appear here." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}>
                        <div className="h-4 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                      </TableCell>
                    </TableRow>
                  ))
                : filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs text-zinc-500">#{item.orderId}</TableCell>
                      <TableCell className="font-medium">{item.product}</TableCell>
                      <TableCell>
                        <div className="text-sm">{item.customer}</div>
                        <div className="text-xs text-zinc-500">{item.email}</div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.subtotal.toFixed(2)}</TableCell>
                      <TableCell className="text-sm text-zinc-500">{item.date}</TableCell>
                      <TableCell>
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className={`rounded-md border-0 px-2 py-1 text-xs font-medium ${statusBadgeClass(item.status)}`}
                        >
                          {ITEM_STATUSES.map((s) => (
                            <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}