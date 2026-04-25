import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendColor?: "green" | "red" | "neutral";
  color?: string;
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendColor = "neutral",
  color = "orange"
}: StatCardProps) {
  const colorClasses: Record<string, string> = {
    orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };

  const trendTextClasses: Record<string, string> = {
    green: "text-green-500",
    red: "text-red-500",
    neutral: "text-zinc-500",
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] hover:border-white/10 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110",
          colorClasses[color] || colorClasses.orange
        )}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={cn("text-xs font-bold px-2 py-1 rounded-lg bg-white/5", trendTextClasses[trendColor])}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-zinc-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      </div>
    </div>
  );
}
