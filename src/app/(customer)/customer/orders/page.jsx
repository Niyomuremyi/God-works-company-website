"use client";

import { useEffect, useState, useCallback } from "react";
import { ShoppingCart } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { CustomerOrderRow, CustomerOrderRowSkeleton, CustomerOrderTableHeader } from "@/components/customer";
import { ORDER_STATUS_TABS } from "@/lib/constants/orderStatus";
import { getCustomerOrders, ApiError } from "@/lib/api";

function mapOrderForTable(order) {
  return {
    id: order.id,
    items: order.items?.length ?? 0,
    total: Number(order.total_amount),
    status: order.status,
    date: order.created_at?.slice(0, 10),
  };
}

export default function CustomerOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomerOrders("email@gmai.com");
      setOrders(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = orders.map(mapOrderForTable).filter((order) => {
    const query = searchQuery.toLowerCase();
    return !query || String(order.id).includes(query);
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="My Orders" subtitle="Track and review your past purchases" />

      <div className="flex flex-col gap-4">
        <SearchInput
          placeholder="Search by order #..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full sm:max-w-xs"
        />

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="w-max">
              {ORDER_STATUS_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && filteredOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No orders found"
          description="Your orders will appear here once you make a purchase."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <Table>
            <CustomerOrderTableHeader />
            <TableBody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <CustomerOrderRowSkeleton key={i} />)
                : filteredOrders.map((order) => <CustomerOrderRow key={order.id} order={order} />)}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}