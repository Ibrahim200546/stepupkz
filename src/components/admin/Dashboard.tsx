import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import SalesChart from "./SalesChart";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  revenueChange: number;
  ordersChange: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenueChange: 0,
    ordersChange: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get total orders and revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total, created_at');
      
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

      // Calculate changes (compare last 30 days vs previous 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const recentOrders = orders?.filter(o => new Date(o.created_at) > thirtyDaysAgo) || [];
      const previousOrders = orders?.filter(o => {
        const date = new Date(o.created_at);
        return date > sixtyDaysAgo && date <= thirtyDaysAgo;
      }) || [];

      const recentRevenue = recentOrders.reduce((sum, o) => sum + Number(o.total), 0);
      const previousRevenue = previousOrders.reduce((sum, o) => sum + Number(o.total), 0);

      const revenueChange = previousRevenue > 0 
        ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 
        : 0;
      
      const ordersChange = previousOrders.length > 0
        ? ((recentOrders.length - previousOrders.length) / previousOrders.length) * 100
        : 0;

      // Get products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Get users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalOrders: orders?.length || 0,
        totalRevenue,
        totalProducts: productsCount || 0,
        totalUsers: usersCount || 0,
        revenueChange: Math.round(revenueChange),
        ordersChange: Math.round(ordersChange),
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Общая выручка",
      value: `${Math.round(stats.totalRevenue).toLocaleString('ru-KZ')} ₸`,
      change: stats.revenueChange,
      icon: DollarSign,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Заказы",
      value: stats.totalOrders.toString(),
      change: stats.ordersChange,
      icon: ShoppingBag,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Товары",
      value: stats.totalProducts.toString(),
      icon: Package,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "Пользователи",
      value: stats.totalUsers.toString(),
      icon: Users,
      color: "text-chart-5",
      bgColor: "bg-chart-5/10",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Обзор вашего магазина</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.change !== undefined && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  {card.change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={card.change >= 0 ? "text-green-500" : "text-red-500"}>
                    {card.change >= 0 ? "+" : ""}{card.change}%
                  </span>
                  <span className="text-muted-foreground">за последние 30 дней</span>
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales Chart */}
      <SalesChart />
    </div>
  );
};

export default Dashboard;
