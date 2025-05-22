import { useEffect, useState } from "react";
import { useShop } from "@/app/shop/context/ShopContext";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye, Link as LinkIcon, DollarSign, TrendingUp } from "lucide-react";
import { Shop } from "@prisma/client";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface AnalyticsData {
  totalViews: number;
  totalLinkClicks: number;
  totalPaidLinkClicks: number;
  totalRevenue: number;
  viewsByType: {
    [key: string]: {
      total: number;
      byDate: Array<{
        date: string;
        count: number;
      }>;
    };
  };
  links: Array<{
    id: string;
    url: string;
    paid: boolean;
    price: number;
    clicks: number;
    paidClicks: number;
    revenue: number;
  }>;
}

const Analytics = ({ shop }: { shop: Shop }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("7d");

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!shop) return;

      try {
        setLoading(true);
        const startDate = new Date();
        startDate.setDate(
          startDate.getDate() -
            (dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90)
        );

        const response = await fetch(
          `/api/v1/views?shopId=${shop.id}&startDate=${startDate.toISOString()}`
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Erreur lors de la récupération des statistiques"
          );
        }

        setData(result.data);
        console.log(result.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [shop, dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fr-FR").format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const chartData = data.viewsByType["page_view"]?.byDate.map((item) => ({
    date: format(new Date(item.date), "dd MMM", { locale: fr }),
    vues: item.count,
    clics:
      data.viewsByType["link_click"]?.byDate.find(
        (d) =>
          format(new Date(d.date), "yyyy-MM-dd") ===
          format(new Date(item.date), "yyyy-MM-dd")
      )?.count || 0,
  }));

  const chartConfig = {
    vues: {
      label: "Vues",
      theme: {
        light: "#3b82f6",
        dark: "#60a5fa",
      },
    },
    clics: {
      label: "Clics",
      theme: {
        light: "#22c55e",
        dark: "#4ade80",
      },
    },
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Statistiques</h2>
        <Tabs
          value={dateRange}
          onValueChange={(v) => setDateRange(v as "7d" | "30d" | "90d")}
        >
          <TabsList>
            <TabsTrigger value="7d">7 jours</TabsTrigger>
            <TabsTrigger value="30d">30 jours</TabsTrigger>
            <TabsTrigger value="90d">90 jours</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-blue-500" />
            <h3 className="text-sm font-medium text-gray-500">Vues totales</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {formatNumber(data.totalViews)}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <LinkIcon className="h-5 w-5 text-green-500" />
            <h3 className="text-sm font-medium text-gray-500">
              Clics sur les liens
            </h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {formatNumber(data.totalLinkClicks)}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-yellow-500" />
            <h3 className="text-sm font-medium text-gray-500">Clics payants</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {formatNumber(data.totalPaidLinkClicks)}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <h3 className="text-sm font-medium text-gray-500">Revenus</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(data.totalRevenue)}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Évolution des vues et clics
        </h3>
        <div className="h-full">
          <ChartContainer config={chartConfig}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      try {
                        return format(new Date(value), "dd MMMM yyyy", {
                          locale: fr,
                        });
                      } catch (err) {
                        return "";
                      }
                    }}
                  />
                }
              />
              <Bar dataKey="vues" fill="var(--color-vues)" name="vues" />
              <Bar dataKey="clics" fill="var(--color-clics)" name="clics" />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Performance des liens</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">URL</th>
                <th className="text-center py-3 px-4">Clics</th>
                <th className="text-center py-3 px-4">Clics payants</th>
                <th className="text-center py-3 px-4">Revenus</th>
              </tr>
            </thead>
            <tbody>
              {data.links.map((link) => (
                <tr key={link.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="truncate max-w-[300px]">{link.url}</span>
                      {link.paid && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Payant
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    {formatNumber(link.clicks)}
                  </td>
                  <td className="text-center py-3 px-4">
                    {formatNumber(link.paidClicks)}
                  </td>
                  <td className="text-center py-3 px-4">
                    {formatCurrency(link.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
