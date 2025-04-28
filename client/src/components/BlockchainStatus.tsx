import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";
import SmartContractPanel from "./SmartContractPanel";

interface BlockchainStatusData {
  blockchain: {
    connected: boolean;
    network: string;
    nodeUrl: string;
  };
  ipfs: {
    online: boolean;
    gateway: string;
    api: string;
  };
  contracts: {
    ipRegistry: string;
    ownershipManagement: string;
    gdprCompliance: string;
    licensing: string;
  };
}

type TransactionType = "registration" | "transfer" | "license";

interface TransactionStat {
  type: TransactionType;
  count: number;
}

const BlockchainStatus = () => {
  const [contractPanelOpen, setContractPanelOpen] = useState(false);
  
  // Mock transaction data for UI display
  const transactionStats: TransactionStat[] = [
    { type: "registration", count: 2 },
    { type: "transfer", count: 1 },
    { type: "license", count: 3 }
  ];

  const { data, isLoading, error } = useQuery<BlockchainStatusData>({
    queryKey: ["/api/system/status"],
  });

  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-medium text-neutral-900">Blockchain Status</h2>
        </div>
        <CardContent className="p-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-neutral-100 rounded-lg p-4 mb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center mb-3 md:mb-0">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="ml-4 space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-medium text-neutral-900">Blockchain Status</h2>
        </div>
        <CardContent className="p-4">
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            Error loading blockchain status: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default values if data is undefined or incomplete
  const blockchain = data?.blockchain || { connected: false, network: 'Unknown', nodeUrl: 'Not available' };
  const ipfs = data?.ipfs || { online: false, gateway: 'Not available', api: 'Not available' };
  
  return (
    <>
      <Card className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-medium text-neutral-900">Blockchain Status</h2>
        </div>
        
        <CardContent className="p-4">
          <div className="bg-neutral-100 rounded-lg p-4 mb-4 flex items-start md:items-center flex-col md:flex-row md:justify-between">
            <div className="flex items-center mb-3 md:mb-0">
              <div className={`flex-shrink-0 h-10 w-10 rounded-full ${blockchain.connected ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center text-white`}>
                <CheckCircle2 />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-neutral-900">Local Blockchain Network</div>
                <div className={`text-sm ${blockchain.connected ? 'text-green-500' : 'text-red-500'}`}>
                  {blockchain.connected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-neutral-700 font-mono">
                <span className="block"><span className="font-medium">Network:</span> {blockchain.network}</span>
                <span className="block"><span className="font-medium">Node:</span> {blockchain.nodeUrl}</span>
              </div>
              <Button 
                variant="outline"
                className="px-3 py-1 text-neutral-700 border-gray-300 hover:bg-neutral-100"
                onClick={() => setContractPanelOpen(true)}
              >
                Details
              </Button>
            </div>
          </div>
          
          <div className="bg-neutral-100 rounded-lg p-4 mb-4 flex items-start md:items-center flex-col md:flex-row md:justify-between">
            <div className="flex items-center mb-3 md:mb-0">
              <div className={`flex-shrink-0 h-10 w-10 rounded-full ${ipfs.online ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center text-white`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-neutral-900">IPFS Node</div>
                <div className={`text-sm ${ipfs.online ? 'text-green-500' : 'text-red-500'}`}>
                  {ipfs.online ? 'Connected' : 'Disconnected'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-neutral-700 font-mono">
                <span className="block"><span className="font-medium">Gateway:</span> {ipfs.gateway}</span>
                <span className="block"><span className="font-medium">API:</span> {ipfs.api}</span>
              </div>
              <Button 
                variant="outline"
                className="px-3 py-1 text-neutral-700 border-gray-300 hover:bg-neutral-100"
              >
                Details
              </Button>
            </div>
          </div>
          
          <div className="bg-neutral-100 rounded-lg p-4 flex items-start md:items-center flex-col md:flex-row md:justify-between">
            <div className="flex items-center mb-3 md:mb-0">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-neutral-900">Recent Transactions</div>
                <div className="text-sm text-neutral-700">Last 24 hours</div>
              </div>
            </div>
            <div className="w-full md:w-auto md:flex-1 md:ml-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-md p-3 border border-gray-200">
                <div className="text-xs text-neutral-500">IP Registration</div>
                <div className="text-lg font-medium text-green-500">{transactionStats[0].count}</div>
              </div>
              <div className="bg-white rounded-md p-3 border border-gray-200">
                <div className="text-xs text-neutral-500">Ownership Transfer</div>
                <div className="text-lg font-medium text-amber-500">{transactionStats[1].count}</div>
              </div>
              <div className="bg-white rounded-md p-3 border border-gray-200">
                <div className="text-xs text-neutral-500">License Creation</div>
                <div className="text-lg font-medium text-primary">{transactionStats[2].count}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <SmartContractPanel 
        isOpen={contractPanelOpen}
        onClose={() => setContractPanelOpen(false)}
        contracts={data?.contracts}
      />
    </>
  );
};

export default BlockchainStatus;
