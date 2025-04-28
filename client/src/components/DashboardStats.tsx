import { useQuery } from "@tanstack/react-query";
import { CopyIcon, CheckCircle2Icon, ArrowLeftRight, FileTextIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsData {
  totalAssets: number;
  verifiedAssets: number;
  pendingTransfers: number;
  activeLicenses: number;
}

const DashboardStats = () => {
  const { data: stats, isLoading, error } = useQuery<StatsData>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Skeleton className="h-12 w-12 rounded-full mr-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg">
        Error loading dashboard statistics: {error.message}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Assets",
      value: stats?.totalAssets || 0,
      icon: <CopyIcon />,
      bg: "bg-primary-light",
      iconColor: "text-primary",
    },
    {
      title: "Verified on Chain",
      value: stats?.verifiedAssets || 0,
      icon: <CheckCircle2Icon />,
      bg: "bg-secondary-light",
      iconColor: "text-secondary",
    },
    {
      title: "Pending Transfers",
      value: stats?.pendingTransfers || 0,
      icon: <ArrowLeftRight />,
      bg: "bg-amber-100",
      iconColor: "text-amber-500",
    },
    {
      title: "Active Licenses",
      value: stats?.activeLicenses || 0,
      icon: <FileTextIcon />,
      bg: "bg-blue-100",
      iconColor: "text-blue-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
      {statCards.map((card, index) => (
        <Card key={index} className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className={`rounded-full ${card.bg} bg-opacity-20 p-3 mr-4`}>
                <span className={`${card.iconColor}`}>{card.icon}</span>
              </div>
              <div>
                <p className="text-sm text-neutral-700">{card.title}</p>
                <p className="text-xl font-semibold">{card.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
