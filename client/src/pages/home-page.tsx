import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import DashboardStats from "@/components/DashboardStats";
import QuickActions from "@/components/QuickActions";
import IPAssetsList from "@/components/IPAssetsList";
import BlockchainStatus from "@/components/BlockchainStatus";
import GDPRCompliance from "@/components/GDPRCompliance";

const HomePage = () => {
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Dashboard | IP Chain";
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <AppHeader />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6">
          {/* Dashboard Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-neutral-900">IP Asset Management Dashboard</h1>
            <p className="text-neutral-700">Manage your intellectual property with blockchain verification</p>
            
            {/* Stats Overview */}
            <DashboardStats />
          </div>
          
          {/* Quick Actions */}
          <QuickActions />
          
          {/* IP Assets List */}
          <IPAssetsList />
          
          {/* Blockchain Status */}
          <BlockchainStatus />
          
          {/* GDPR Compliance */}
          <GDPRCompliance />
        </div>
      </main>
      
      <AppFooter />
    </div>
  );
};

export default HomePage;
