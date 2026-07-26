"use client";

import { useState } from "react";
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

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fake orders data
  const [orders] = useState([
    {
      id: 1,
      customer: "John Doe",
      email: "john@example.com",
      items: 3,
      total: 240,
      status: "pending",
      date: "2026-04-09",
    },
    {
      id: 2,
      customer: "Sarah Smith",
      email: "sarah@example.com",
      items: 1,
      total: 90,
      status: "completed",
      date: "2026-04-08",
    },
    {
      id: 3,
      customer: "Mike Lee",
      email: "mike@example.com",
      items: 2,
      total: 180,
      status: "cancelled",
      date: "2026-04-07",
    },
  ]);

  // Search filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
    //   order.id.includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (filteredOrders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="No orders found"
        description="Orders will appear here when customers make purchases."
      />
    );
  }
  console.log(filteredOrders)

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Orders
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
          Manage and track customer orders
        </p>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col gap-4">

        <AdminSearch
          placeholder="Search by order # or email..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full sm:max-w-xs"
        />

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
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

      {/* Orders Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <Table>
          <OrderTableHeader />
          <TableBody>
            {filteredOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}