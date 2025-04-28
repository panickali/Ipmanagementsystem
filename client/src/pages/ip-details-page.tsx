import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { IPAsset } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Link as LinkIcon, 
  Edit, 
  Download, 
  Clock, 
  ExternalLink,
  Tag
} from "lucide-react";

const IPDetailsPage = () => {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const assetId = parseInt(id);

  const { data: asset, isLoading, error } = useQuery<IPAsset>({
    queryKey: [`/api/ip-assets/${assetId}`],
    enabled: !isNaN(assetId),
  });

  useEffect(() => {
    if (asset) {
      document.title = `${asset.name} | IP Chain`;
    } else {
      document.title = "IP Asset Details | IP Chain";
    }
  }, [asset]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          description: `${label} copied to clipboard`,
        });
      },
      () => {
        toast({
          variant: "destructive",
          description: `Failed to copy ${label}`,
        });
      }
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      verified: (
        <Badge variant="outline" className="bg-green-100 text-green-600 hover:bg-green-100">
          Verified
        </Badge>
      ),
      pending: (
        <Badge variant="outline" className="bg-amber-100 text-amber-600 hover:bg-amber-100">
          Pending
        </Badge>
      ),
      rejected: (
        <Badge variant="outline" className="bg-red-100 text-red-600 hover:bg-red-100">
          Rejected
        </Badge>
      ),
    };
    return variants[status as keyof typeof variants] || null;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      copyright: (
        <div className="h-12 w-12 rounded bg-primary-light flex items-center justify-center text-white">
          <FileText />
        </div>
      ),
      patent: (
        <div className="h-12 w-12 rounded bg-secondary-light flex items-center justify-center text-white">
          <Tag />
        </div>
      ),
      trademark: (
        <div className="h-12 w-12 rounded bg-accent flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
      ),
      design: (
        <div className="h-12 w-12 rounded bg-green-500 flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
        </div>
      ),
    };
    return icons[type as keyof typeof icons] || icons.copyright;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-100">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 py-6">
          <div className="mb-6 flex items-center">
            <Button
              variant="ghost"
              className="mr-2"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center mb-4">
                  <Skeleton className="h-12 w-12 rounded mr-4" />
                  <div>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-24 mt-2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-100">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 py-6">
          <div className="mb-6 flex items-center">
            <Button
              variant="ghost"
              className="mr-2"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="bg-red-100 text-red-600 p-4 rounded-lg inline-flex items-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Error: {error?.message || "IP asset not found"}</span>
                </div>
                <p className="text-neutral-600">
                  Unable to load the requested IP asset. It may not exist or you may not have permission to view it.
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => setLocation("/")}
                >
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-center justify-between">
                <div className="flex items-center mb-4 mr-4">
                  {getTypeIcon(asset.type)}
                  <div className="ml-4">
                    <CardTitle className="text-2xl">{asset.name}</CardTitle>
                    <CardDescription>
                      ID: IP-{asset.id.toString().padStart(7, '0')}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" asChild>
                    <a href={`http://localhost:8080/ipfs/${asset.ipfsHash}`} target="_blank" rel="noopener noreferrer">
                      View on IPFS
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                  <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Asset
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList className="mb-6">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="blockchain">Blockchain Info</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <p className="text-neutral-700">{asset.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Asset Information</h3>
                      <dl className="divide-y divide-gray-200">
                        <div className="py-2 grid grid-cols-2">
                          <dt className="font-medium text-neutral-500">Type</dt>
                          <dd>{asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}</dd>
                        </div>
                        <div className="py-2 grid grid-cols-2">
                          <dt className="font-medium text-neutral-500">Status</dt>
                          <dd className="flex items-center">
                            {getStatusBadge(asset.status)}
                          </dd>
                        </div>
                        <div className="py-2 grid grid-cols-2">
                          <dt className="font-medium text-neutral-500">Registration Date</dt>
                          <dd className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-neutral-500" />
                            {new Date(asset.registrationDate).toLocaleDateString()}
                          </dd>
                        </div>
                        <div className="py-2 grid grid-cols-2">
                          <dt className="font-medium text-neutral-500">Last Updated</dt>
                          <dd className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-neutral-500" />
                            {new Date(asset.lastUpdated).toLocaleDateString()}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Storage Information</h3>
                      <dl className="divide-y divide-gray-200">
                        <div className="py-2">
                          <dt className="font-medium text-neutral-500 mb-1">IPFS Hash</dt>
                          <dd className="flex items-center">
                            <code className="bg-neutral-100 p-2 rounded text-xs font-mono block w-full overflow-x-auto">
                              {asset.ipfsHash}
                            </code>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="ml-2 shrink-0"
                              onClick={() => copyToClipboard(asset.ipfsHash, "IPFS hash")}
                            >
                              <LinkIcon className="h-4 w-4" />
                            </Button>
                          </dd>
                        </div>
                        <div className="py-2">
                          <dt className="font-medium text-neutral-500 mb-1">IPFS Gateway Link</dt>
                          <dd className="flex items-center">
                            <a 
                              href={`http://localhost:8080/ipfs/${asset.ipfsHash}`} 
                              target="_blank"
                              rel="noopener noreferrer" 
                              className="text-primary hover:underline break-all"
                            >
                              http://localhost:8080/ipfs/{asset.ipfsHash}
                            </a>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="ml-2 shrink-0"
                              onClick={() => copyToClipboard(`http://localhost:8080/ipfs/${asset.ipfsHash}`, "IPFS gateway link")}
                            >
                              <LinkIcon className="h-4 w-4" />
                            </Button>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="blockchain" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Blockchain Information</h3>
                    <dl className="divide-y divide-gray-200">
                      <div className="py-2">
                        <dt className="font-medium text-neutral-500 mb-1">Transaction Hash</dt>
                        <dd className="flex items-center">
                          <code className="bg-neutral-100 p-2 rounded text-xs font-mono block w-full overflow-x-auto">
                            {asset.blockchainTxHash || "Not yet registered on blockchain"}
                          </code>
                          {asset.blockchainTxHash && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="ml-2 shrink-0"
                              onClick={() => copyToClipboard(asset.blockchainTxHash || "", "Transaction hash")}
                            >
                              <LinkIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </dd>
                      </div>
                      <div className="py-2">
                        <dt className="font-medium text-neutral-500 mb-1">Blockchain Status</dt>
                        <dd className="flex items-center">
                          {getStatusBadge(asset.status)}
                          <span className="ml-2">
                            {asset.status === "verified" 
                              ? "Asset has been verified on the blockchain" 
                              : asset.status === "pending" 
                              ? "Verification is pending" 
                              : "Asset has been rejected"}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div className="bg-neutral-100 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Smart Contract Details</h3>
                    <p className="text-neutral-700 mb-4">
                      This asset is registered using the following smart contracts:
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Registry Contract:</span>
                        <span className="font-mono text-xs">0x123f681646d4a755815f9cb19e1acc8565a0c2ac</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Ownership Contract:</span>
                        <span className="font-mono text-xs">0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="history" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Change History</h3>
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-200"></div>
                      <ul className="space-y-4">
                        <HistoryItem 
                          date={new Date(asset.registrationDate)}
                          title="Asset Registered"
                          description="Initial registration of the IP asset"
                          txHash={asset.blockchainTxHash}
                        />
                        <HistoryItem 
                          date={new Date(asset.lastUpdated)}
                          title="Blockchain Verification"
                          description="Asset verified on the blockchain network"
                          txHash={asset.blockchainTxHash}
                        />
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Certificate
              </Button>
              <Button variant="destructive">
                Request Deletion
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

interface HistoryItemProps {
  date: Date;
  title: string;
  description: string;
  txHash?: string;
}

const HistoryItem = ({ date, title, description, txHash }: HistoryItemProps) => (
  <li className="pl-8 relative">
    <span className="absolute left-0 top-1.5 h-8 w-8 rounded-full bg-primary flex items-center justify-center -ml-1.5">
      <Clock className="h-4 w-4 text-white" />
    </span>
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">{title}</h4>
        <span className="text-sm text-neutral-500">
          {date.toLocaleString()}
        </span>
      </div>
      <p className="text-neutral-700 mb-2">{description}</p>
      {txHash && (
        <div className="bg-neutral-50 p-2 rounded text-xs font-mono overflow-x-auto">
          TX: {txHash}
        </div>
      )}
    </div>
  </li>
);

export default IPDetailsPage;
