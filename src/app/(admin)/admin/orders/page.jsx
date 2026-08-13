"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Pencil, Download } from "lucide-react";

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
import { StatusUpdateModal } from "@/components/shared/StatusUpdateModal";
import { useAuth } from "@/lib/auth";
import { getSellerOrders, updateOrderItemStatus, ApiError } from "@/lib/api";
import { useToast } from "@/components/shared/Toast";
import { downloadCsv } from "@/lib/csv";
import { Button } from "@/components/ui/button";

const ITEM_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const ITEM_STATUS_TABS = [{ value: "all", label: "All" }, ...ITEM_STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))];

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
  const [editingItem, setEditingItem] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const toast = useToast();

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await getSellerOrders());
    } catch (err) {
  setItems(previous);
  toast(err instanceof ApiError ? err.message : "Failed to update item status", { type: "error" });
}finally {
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

  const handleStatusChange = async (itemId, status, note, estimatedDelivery, cancellationReason) => {
    const previous = items;
    setItems((current) =>
      current.map((i) =>
        i.id === itemId ? { ...i, item_status: status, carrier_note: note, estimated_delivery: estimatedDelivery } : i
      )
    );
    try {
      await updateOrderItemStatus(itemId, { status, note, estimatedDelivery, cancellationReason });
      toast("Order status updated", { type: "success" });
    } catch (err) {
      setItems(previous);
      alert(err instanceof ApiError ? err.message : "Failed to update item status");
    }
  };

  const filteredItems = items.filter((item) => {
    if (statusFilter !== "all" && item.item_status !== statusFilter) return false;

    const itemDate = item.order_created_at?.slice(0, 10);
    if (dateFrom && itemDate < dateFrom) return false;
    if (dateTo && itemDate > dateTo) return false;
  
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      item.customer_email?.toLowerCase().includes(q) ||
      item.product_name?.toLowerCase().includes(q) ||
      String(item.order_id).includes(q)
    );
  });
const handleExport = () => {
  downloadCsv(`orders-${new Date().toISOString().slice(0, 10)}.csv`, filteredItems, [
    { label: "Order #", value: (i) => i.order_id },
    { label: "Product", value: (i) => i.product_name },
    { label: "Customer", value: (i) => i.customer_name },
    { label: "Email", value: (i) => i.customer_email },
    { label: "Quantity", value: (i) => i.quantity },
    { label: "Subtotal", value: (i) => Number(i.subtotal).toFixed(2) },
    { label: "Status", value: (i) => i.item_status },
    { label: "Date", value: (i) => i.order_created_at?.slice(0, 10) },
  ]);
};
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">Orders</h1>
    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
      Line items from customer orders that include your products. Click a row to view full order details.
    </p>
  </div>
  <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredItems.length === 0}>
    <Download className="mr-2 h-4 w-4" />
    Export CSV
  </Button>
</div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <AdminSearch
          placeholder="Search by product, order #, or email..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full sm:max-w-xs"
        />
        <div className="flex items-center gap-2 text-sm">
    <input
      type="date"
      value={dateFrom}
      onChange={(e) => setDateFrom(e.target.value)}
      className="rounded-md border border-zinc-200 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
    />
    <span className="text-zinc-400">to</span>
    <input
      type="date"
      value={dateTo}
      onChange={(e) => setDateTo(e.target.value)}
      className="rounded-md border border-zinc-200 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
    />
    {(dateFrom || dateTo) && (
      <button
        type="button"
        onClick={() => { setDateFrom(""); setDateTo(""); }}
        className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        Clear
      </button>
    )}
  </div>
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
                    <TableRow
                      key={item.id}
                      onClick={() => router.push(`/admin/orders/${item.order_id}`)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-mono text-xs text-zinc-500">#{item.order_id}</TableCell>
                      <TableCell className="font-medium">{item.product_name}</TableCell>
                      <TableCell>
                        <div className="text-sm">{item.customer_name}</div>
                        <div className="text-xs text-zinc-500">{item.customer_email}</div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${Number(item.subtotal).toFixed(2)}</TableCell>
                      <TableCell className="text-sm text-zinc-500">{item.order_created_at?.slice(0, 10)}</TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem(item);
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-80 ${statusBadgeClass(item.item_status)}`}
                        >
                          <Pencil className="h-3 w-3" />
                          {item.item_status[0].toUpperCase() + item.item_status.slice(1)}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      )}

      {editingItem && (
        <StatusUpdateModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={handleStatusChange}
        />
      )}
    </div>
  );
}