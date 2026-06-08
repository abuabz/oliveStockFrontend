"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, AlertTriangle, ArrowRightLeft, Boxes, CheckCircle2, TrendingUp, CalendarDays } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { Badge } from "@/components/ui/badge";

interface DashboardMetrics {
  totalProducts: number;
  totalStock: number;
  availableStock: number;
  allocatedStock: number;
  lowStockAlerts: number;
}

const COLORS = ['oklch(0.42 0.16 16)', 'oklch(0.76 0 0)', 'oklch(0.205 0 0)', 'oklch(0.87 0 0)', 'oklch(0.556 0 0)'];
const STOCK_COLORS = ['#10b981', '#3b82f6']; // Emerald, Blue

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, lowStockRes, productsRes, allocationsRes] = await Promise.all([
          api.get("/dashboard/metrics"),
          api.get("/dashboard/low-stock"),
          api.get("/products"),
          api.get("/allocations")
        ]);
        
        setMetrics(metricsRes.data);
        setLowStock(lowStockRes.data.slice(0, 5)); // top 5 low stock
        
        // Process Category Data for Bar Chart
        const products = productsRes.data;
        const catMap: Record<string, number> = {};
        products.forEach((p: any) => {
          const catName = p.category?.name || "Uncategorized";
          catMap[catName] = (catMap[catName] || 0) + p.availableQuantity;
        });
        const catChartData = Object.keys(catMap).map(k => ({ name: k, stock: catMap[k] }));
        setCategoriesData(catChartData);

        // Process Allocation Activity for Area Chart (last 7 days)
        const allocs = allocationsRes.data;
        const daysMap: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          daysMap[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0;
        }
        
        allocs.forEach((a: any) => {
          const d = new Date(a.allocationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (daysMap[d] !== undefined) {
            daysMap[d] += a.quantityIssued;
          }
        });
        
        const activityData = Object.keys(daysMap).map(k => ({ date: k, items: daysMap[k] }));
        setAllocations(activityData);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pieData = metrics ? [
    { name: 'Available', value: metrics.availableStock },
    { name: 'Allocated', value: metrics.allocatedStock },
  ] : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Welcome back! Here is an overview of your inventory system.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Total Products"
          value={metrics?.totalProducts}
          loading={loading}
          icon={<Package className="h-5 w-5 text-primary" />}
        />
        <MetricCard
          title="Total Stock"
          value={metrics?.totalStock}
          loading={loading}
          icon={<Boxes className="h-5 w-5 text-blue-500" />}
        />
        <MetricCard
          title="Available Stock"
          value={metrics?.availableStock}
          loading={loading}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
        />
        <MetricCard
          title="Allocated Stock"
          value={metrics?.allocatedStock}
          loading={loading}
          icon={<ArrowRightLeft className="h-5 w-5 text-indigo-500" />}
        />
        <MetricCard
          title="Low Stock Alerts"
          value={metrics?.lowStockAlerts}
          loading={loading}
          icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
          alert={!!(metrics?.lowStockAlerts && metrics.lowStockAlerts > 0)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Allocation Activity Area Chart */}
        <Card className="col-span-1 lg:col-span-2 shadow-md border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Allocation Activity
            </CardTitle>
            <CardDescription>Items issued across all estates over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full rounded-xl" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={allocations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorItems" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.42 0.16 16)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="oklch(0.42 0.16 16)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                      itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <Area type="monotone" dataKey="items" stroke="oklch(0.42 0.16 16)" strokeWidth={3} fillOpacity={1} fill="url(#colorItems)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Distribution Pie Chart */}
        <Card className="col-span-1 shadow-md border-border/50">
          <CardHeader>
            <CardTitle className="text-xl">Stock Distribution</CardTitle>
            <CardDescription>Available vs Allocated Ratio</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            {loading ? (
              <Skeleton className="h-[250px] w-[250px] rounded-full" />
            ) : (
              <div className="h-[250px] w-full flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STOCK_COLORS[index % STOCK_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="flex justify-center gap-6 mt-4 w-full">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm font-medium">Allocated</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution Bar Chart */}
        <Card className="col-span-1 lg:col-span-2 shadow-md border-border/50">
          <CardHeader>
            <CardTitle className="text-xl">Stock by Category</CardTitle>
            <CardDescription>Available inventory grouped by product categories</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full rounded-xl" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} width={120} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                      cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                    />
                    <Bar dataKey="stock" fill="oklch(0.42 0.16 16)" radius={[0, 4, 4, 0]}>
                      {categoriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts Widget */}
        <Card className="col-span-1 shadow-md border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Critical Stock Alerts
            </CardTitle>
            <CardDescription>Items needing immediate restock</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : lowStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-emerald-600 dark:text-emerald-400 font-medium">All stock levels are healthy!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lowStock.map(item => (
                  <div key={item._id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-destructive/20 hover:border-destructive/40 transition-colors">
                    <div>
                      <p className="font-semibold text-sm leading-none mb-1.5">{item.name}</p>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-destructive/30 text-destructive">{item.productCode}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-destructive">{item.availableQuantity} <span className="text-xs font-normal opacity-70">{item.unit}</span></p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Min: {item.minimumStock}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  loading,
  alert = false
}: {
  title: string;
  value?: number;
  icon: React.ReactNode;
  loading: boolean;
  alert?: boolean;
}) {
  return (
    <Card className={`shadow-sm border-border/50 hover:shadow-md transition-shadow ${alert ? 'border-destructive/50 bg-destructive/5' : 'bg-card'}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${alert ? 'bg-destructive/20' : 'bg-muted/50'}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-[100px]" />
        ) : (
          <div className={`text-3xl font-extrabold ${alert ? 'text-destructive' : 'text-foreground'}`}>
            {value ?? 0}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
