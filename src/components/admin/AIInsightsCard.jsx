"use client";

import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Package,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Lightbulb,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* Fake insights data */
const insightsData = {
  generatedAt: new Date().toISOString(),
  rawMetrics: {
    currentRevenue: 12450,
    revenueChange: 8.2,
    orderCount: 56,
    avgOrderValue: "222.30",
    unfulfilledCount: 4,
  },
  insights: {
    salesTrends: {
      trend: "up",
      summary: "Sales increased compared to last week.",
      highlights: [
        "Weekend sales were 20% higher than average",
        "Electronics category performed best",
        "Mobile traffic converted better than desktop",
      ],
    },
    inventory: {
      summary: "Most inventory levels are healthy.",
      alerts: ["3 products are running low on stock"],
      recommendations: [
        "Restock wireless mouse inventory",
        "Increase order quantity for best-selling keyboard",
      ],
    },
    actionItems: {
      urgent: ["Restock Mechanical Keyboard (0 left)"],
      recommended: [
        "Promote top-selling products",
        "Review shipping delays",
      ],
      opportunities: [
        "Bundle mouse + keyboard offer",
        "Run weekend discount campaign",
      ],
    },
  },
};

function TrendIcon({ trend }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-zinc-400" />;
}

export function AIInsightsCard() {
  const { insights, rawMetrics, generatedAt } = insightsData;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 p-6 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>

          <div>
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              AI Insights
            </h2>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Updated{" "}
              {new Date(generatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-px border-b border-zinc-200 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 sm:grid-cols-4">
        
        <div className="bg-white p-4 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Revenue (7d)</p>
          <p className="mt-1 text-lg font-bold">
            Rwf{rawMetrics.currentRevenue.toLocaleString()}
          </p>
          <p
            className={cn(
              "text-xs",
              rawMetrics.revenueChange > 0
                ? "text-emerald-600"
                : "text-red-600"
            )}
          >
            +{rawMetrics.revenueChange}% vs last week
          </p>
        </div>

        <div className="bg-white p-4 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Orders (7d)</p>
          <p className="mt-1 text-lg font-bold">{rawMetrics.orderCount}</p>
        </div>

        <div className="bg-white p-4 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Avg Order</p>
          <p className="mt-1 text-lg font-bold">Rwf{rawMetrics.avgOrderValue}</p>
        </div>

        <div className="bg-white p-4 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Pending</p>
          <p
            className={cn(
              "mt-1 text-lg font-bold",
              rawMetrics.unfulfilledCount > 0
                ? "text-amber-600"
                : "text-emerald-600"
            )}
          >
            {rawMetrics.unfulfilledCount}
          </p>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid gap-6 p-6 md:grid-cols-3">

        {/* Sales */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendIcon trend={insights.salesTrends.trend} />
            <h3 className="font-medium">Sales Trends</h3>
          </div>

          <p className="text-sm text-zinc-600">
            {insights.salesTrends.summary}
          </p>

          <ul className="space-y-2">
            {insights.salesTrends.highlights.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Inventory */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-500" />
            <h3 className="font-medium">Inventory</h3>
          </div>

          <p className="text-sm text-zinc-600">
            {insights.inventory.summary}
          </p>

          {insights.inventory.alerts.map((alert, i) => (
            <div
              key={i}
              className="flex gap-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-800"
            >
              <AlertTriangle className="h-4 w-4" />
              {alert}
            </div>
          ))}

          {insights.inventory.recommendations.map((rec, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              {rec}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-violet-500" />
            <h3 className="font-medium">Action Items</h3>
          </div>

          {insights.actionItems.urgent.map((item, i) => (
            <div
              key={i}
              className="flex gap-2 rounded-lg bg-red-50 p-2 text-sm text-red-800"
            >
              <AlertTriangle className="h-4 w-4" />
              {item}
            </div>
          ))}

          {insights.actionItems.recommended.map((item, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              {item}
            </div>
          ))}

          {insights.actionItems.opportunities.map((item, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              {item}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}