import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

const SalesChart = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('created_at, total')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const groupedData: Record<string, { revenue: number; orders: number }> = {};
      
      data?.forEach((order) => {
        const date = new Date(order.created_at).toLocaleDateString('ru-RU');
        if (!groupedData[date]) {
          groupedData[date] = { revenue: 0, orders: 0 };
        }
        groupedData[date].revenue += Number(order.total);
        groupedData[date].orders += 1;
      });

      const chartData = Object.entries(groupedData).map(([date, values]) => ({
        date,
        revenue: Math.round(values.revenue),
        orders: values.orders,
      }));

      setSalesData(chartData);
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Статистика продаж</h2>
      
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList>
          <TabsTrigger value="revenue">Выручка</TabsTrigger>
          <TabsTrigger value="orders">Заказы</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" name="Выручка (₸)" />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>
        
        <TabsContent value="orders">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="hsl(var(--secondary))" name="Количество заказов" />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default SalesChart;
