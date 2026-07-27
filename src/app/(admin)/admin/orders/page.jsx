"use client";

import { useEffect, useState, useCallback } from "react";
import { ShoppingCart } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";

import {
  OrderRow,
  OrderRowSkeleton,
  AdminSearch,
  OrderTableHeader,
} from "@/components/admin";

import { ORDER_STATUS_TABS } from "@/lib/constants/orderStatus";
import { getAllOrders, updateOrderStatus, ApiError } from "@/lib/api";

function mapOrderForTable(order) {
  return {
    id: order.id,
    customer: order.customer_name,
    email: order.customer_email,
    items: order.items?.length ?? 0,
    total: Number(order.total_amount),
    status: order.status,
    date: order.created_at?.slice(0, 10),
  };
}

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAllOrders(
        statusFilter === "all" ? undefined : statusFilter
      );

      setOrders(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (id, status) => {
    const previousOrders = orders;

    setOrders((current) =>
      current.map((order) =>
        order.id === id
          ? { ...order, status }
          : order
      )
    );

    try {
      await updateOrderStatus(id, status);
    } catch (err) {
      setOrders(previousOrders);

      alert(
        err instanceof ApiError
          ? err.message
          : "Failed to update order status"
      );
    }
  };

  const filteredOrders = orders
    .map(mapOrderForTable)
    .filter((order) => {
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        !query ||
        order.email.toLowerCase().includes(query) ||
        String(order.id).includes(query);

      return matchesSearch;
    });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Orders
        </h1>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
          Manage and track customer orders
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <AdminSearch
          placeholder="Search by order # or email..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full sm:max-w-xs"
        />

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <Tabs
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <TabsList className="w-max">
              {ORDER_STATUS_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs sm:text-sm"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

      {!loading && filteredOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No orders found"
          description="Orders will appear here when customers make purchases."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <Table>
            <OrderTableHeader />

            <TableBody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <OrderRowSkeleton key={i} />
                  ))
                : filteredOrders.map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      onStatusChange={(status) =>
                        handleStatusChange(order.id, status)
                      }
                    />
                  ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}