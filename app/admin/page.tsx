import React from "react";
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Activity,
  ArrowUpRight,
  Package,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import StatCard from "@/components/admin/StatCard";
import { createClient } from "@supabase/supabase-js";
import { getGlobalSettings } from "@/lib/admin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getDashboardData() {
  // Parallel fetching for performance
  const [
    { data: orders },
    { data: products },
    { data: customerEmails },
    settings
  ] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("products").select("*"),
    supabase.from("orders").select("customer_email"),
    getGlobalSettings()
  ]);

  const uniqueCustomers = new Set(customerEmails?.map(o => o.customer_email)).size;

  const totalRevenue = orders?.reduce((acc, order) => acc + (order.total_amount || 0), 0) || 0;
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(o => o.status === "pending").length || 0;

  // Calculate low stock products
  const lowStockCount = products?.filter(p => p.stock_quantity <= 10).length || 0;

  // Calculate Top Regions (Top 3 cities)
  const regionMap: Record<string, number> = {};
  orders?.forEach(order => {
    const city = order.city || "Other";
    regionMap[city] = (regionMap[city] || 0) + 1;
  });

  const colors = ["bg-orange-500", "bg-yellow-500", "bg-zinc-700", "bg-zinc-500"];
  const topRegions = Object.entries(regionMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count], index) => ({
      name,
      value: `${Math.round((count / (totalOrders || 1)) * 100)}%`,
      color: colors[index] || "bg-zinc-700"
    }));

  return {
    totalRevenue,
    totalOrders,
    pendingOrders,
    customerCount: uniqueCustomers,
    activeProducts: products?.length || 0,
    recentOrders: orders?.slice(0, 5) || [],
    lowStockCount,
    harvestYear: settings.harvest_year,
    topRegions: topRegions.length > 0 ? topRegions : [
      { name: "No Data", value: "0%", color: "bg-zinc-700" }
    ],
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardData();

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Overview</h1>
          <p className="text-zinc-500 font-medium">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-zinc-900 border border-white/5 px-4 py-2 rounded-xl flex items-center gap-2 text-sm text-zinc-400">
            <Calendar size={16} />
            <span>Harvest Season {stats.harvestYear}</span>
          </div>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20 active:scale-95">
            Download Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString()}`} 
          icon={TrendingUp} 
          trend="+12.5%" 
          trendColor="green"
          color="orange"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon={ShoppingBag} 
          trend="+8%" 
          trendColor="green"
          color="green"
        />
        <StatCard 
          title="Pending Shipments" 
          value={stats.pendingOrders} 
          icon={Package} 
          trend="Action Required" 
          trendColor="red"
          color="blue"
        />
        <StatCard 
          title="Unique Customers" 
          value={stats.customerCount} 
          icon={Users} 
          trend="+14" 
          trendColor="green"
          color="purple"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="text-orange-500" size={20} />
              Recent Activity
            </h2>
            <button className="text-zinc-500 hover:text-white text-sm font-semibold transition-colors flex items-center gap-1">
              View All <ArrowUpRight size={16} />
            </button>
          </div>
          
          <div className="space-y-6">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                      <ShoppingBag size={18} className="text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Order from {order.customer_name}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        {new Date(order.created_at).toLocaleDateString()} • ₹{order.total_amount?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    order.status === "paid" ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500"
                  )}>
                    {order.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-zinc-500 text-sm">No orders yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Business Health / Insights */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-orange-500/10">
            <h3 className="text-lg font-bold mb-2">Inventory Alert</h3>
            <p className="text-orange-100 text-sm mb-6 leading-relaxed">
              {stats.lowStockCount > 0 
                ? `${stats.lowStockCount} products are running low on stock. Restock soon to avoid missing pre-orders.`
                : "All products are well-stocked for the current batch."}
            </p>
            <button className="bg-white text-orange-600 px-6 py-3 rounded-2xl font-bold text-sm w-full transition-transform active:scale-95 shadow-xl">
              {stats.lowStockCount > 0 ? "Restock Now" : "Manage Inventory"}
            </button>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8">
            <h3 className="text-white font-bold mb-4">Top Regions</h3>
            <div className="space-y-4">
              {stats.topRegions.map((region) => (
                <div key={region.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-zinc-500 px-1">
                    <span>{region.name}</span>
                    <span>{region.value}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", region.color)} style={{ width: region.value }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
