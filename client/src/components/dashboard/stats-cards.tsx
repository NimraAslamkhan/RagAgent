import { useQuery } from "@tanstack/react-query";
import { FileText, Search, MoveVertical, Clock } from "lucide-react";

interface AnalyticsData {
  documentCount: number;
  queryCount: number;
  embeddingCount: number;
  avgResponseTime: number;
}

export function StatsCards() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  const stats = [
    {
      title: "Documents Processed",
      value: analytics?.documentCount || 0,
      change: "+12%",
      changeType: "positive",
      icon: FileText,
      iconBg: "bg-blue-100",
      iconColor: "text-primary",
    },
    {
      title: "Total Queries",
      value: analytics?.queryCount || 0,
      change: "+8%",
      changeType: "positive",
      icon: Search,
      iconBg: "bg-green-100",
      iconColor: "text-secondary",
    },
    {
      title: "MoveVertical Embeddings",
      value: `${(analytics?.embeddingCount || 0) / 1000}K`,
      change: "+15%",
      changeType: "positive",
      icon: MoveVertical,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Avg Response Time",
      value: `${analytics?.avgResponseTime?.toFixed(1) || 0}s`,
      change: "-5%",
      changeType: "negative",
      icon: Clock,
      iconBg: "bg-orange-100",
      iconColor: "text-accent",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900">
                {isLoading ? "-" : stat.value}
              </p>
            </div>
            <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`${stat.iconColor} text-xl`} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-secondary' : 'text-red-500'}`}>
              {stat.change}
            </span>
            <span className="text-gray-500 text-sm ml-1">from last month</span>
          </div>
        </div>
      ))}
    </div>
  );
}
