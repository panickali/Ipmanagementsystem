import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Eye, Edit, Trash2, Copy, Search } from "lucide-react";
import { IPAsset } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";

// Helper types
type IPAssetType = "copyright" | "patent" | "trademark" | "design";
type AssetStatus = "pending" | "verified" | "rejected";

const IPAssetsList = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: assets, isLoading, error } = useQuery<IPAsset[]>({
    queryKey: ["/api/ip-assets"],
  });

  // Copy IPFS hash to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          description: "IPFS hash copied to clipboard",
        });
      },
      (err) => {
        toast({
          variant: "destructive",
          description: "Failed to copy IPFS hash",
        });
      }
    );
  };

  // Filter assets based on search query and type
  const filteredAssets = assets
    ? assets.filter((asset) => {
        const matchesSearch =
          asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesType = 
          selectedType === "all" || 
          asset.type === selectedType;
        
        return matchesSearch && matchesType;
      })
    : [];

  // Pagination logic
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssets = filteredAssets.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Asset type icon mapping
  const getAssetTypeIcon = (type: IPAssetType) => {
    switch (type) {
      case "copyright":
        return <div className="h-10 w-10 rounded bg-primary-light flex items-center justify-center text-white">
                <span className="material-icons">description</span>
              </div>;
      case "patent":
        return <div className="h-10 w-10 rounded bg-secondary-light flex items-center justify-center text-white">
                <span className="material-icons">engineering</span>
              </div>;
      case "trademark":
        return <div className="h-10 w-10 rounded bg-accent flex items-center justify-center text-white">
                <span className="material-icons">branding_watermark</span>
              </div>;
      case "design":
        return <div className="h-10 w-10 rounded bg-green-500 flex items-center justify-center text-white">
                <span className="material-icons">palette</span>
              </div>;
      default:
        return <div className="h-10 w-10 rounded bg-gray-400 flex items-center justify-center text-white">
                <span className="material-icons">help_outline</span>
              </div>;
    }
  };

  // Status badge mapping
  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case "verified":
        return (
          <div className="flex items-center">
            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            <span className="text-sm text-neutral-700">Verified</span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center">
            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
            <span className="text-sm text-neutral-700">Pending</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center">
            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-red-500 mr-2"></span>
            <span className="text-sm text-neutral-700">Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-gray-400 mr-2"></span>
            <span className="text-sm text-neutral-700">Unknown</span>
          </div>
        );
    }
  };

  // Type badge mapping
  const getTypeBadge = (type: IPAssetType) => {
    const badgeClasses = {
      copyright: "bg-primary-light bg-opacity-20 text-primary",
      patent: "bg-secondary-light bg-opacity-20 text-secondary",
      trademark: "bg-accent bg-opacity-20 text-accent",
      design: "bg-green-100 text-green-600",
    };

    return (
      <Badge 
        variant="outline" 
        className={`px-2 font-semibold rounded-full ${badgeClasses[type]}`}
      >
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-white mb-6">
        <CardContent className="p-4">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <h2 className="text-lg font-medium">My IP Assets</h2>
          </div>
          <div className="py-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 mb-4">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white mb-6">
        <CardContent className="p-4">
          <div className="p-4 text-red-600 bg-red-50 rounded-md">
            Error loading IP assets: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow mb-6">
      <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between">
          <h2 className="text-lg font-medium text-neutral-900">My IP Assets</h2>
          
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <div className="relative rounded-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-neutral-400" />
              </div>
              <Input
                type="text"
                placeholder="Search IP assets"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select 
              value={selectedType} 
              onValueChange={setSelectedType}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="copyright">Copyright</SelectItem>
                <SelectItem value="patent">Patent</SelectItem>
                <SelectItem value="trademark">Trademark</SelectItem>
                <SelectItem value="design">Design</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-neutral-100">
            <TableRow>
              <TableHead className="w-[300px]">IP Asset</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead>Blockchain Status</TableHead>
              <TableHead>IPFS Hash</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAssets.length > 0 ? (
              paginatedAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>
                    <div className="flex items-center">
                      {getAssetTypeIcon(asset.type as IPAssetType)}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-900">{asset.name}</div>
                        <div className="text-sm text-neutral-500">ID: IP-{asset.id.toString().padStart(7, '0')}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getTypeBadge(asset.type as IPAssetType)}
                  </TableCell>
                  <TableCell className="text-sm text-neutral-700">
                    {new Date(asset.registrationDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(asset.status as AssetStatus)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="font-mono text-xs text-neutral-700 truncate max-w-[150px]">
                        {asset.ipfsHash}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 text-neutral-400 hover:text-neutral-700"
                        onClick={() => copyToClipboard(asset.ipfsHash)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/ip/${asset.id}`}>
                          <Eye className="h-4 w-4 text-primary hover:text-primary-dark" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/ip/${asset.id}/edit`}>
                          <Edit className="h-4 w-4 text-secondary hover:text-secondary-dark" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          toast({
                            title: "Feature not implemented",
                            description: "Delete functionality would be implemented in a production system."
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
                  No IP assets found. Use the "Register New IP" button to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {filteredAssets.length > 0 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-neutral-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, filteredAssets.length)}
                </span>{" "}
                of <span className="font-medium">{filteredAssets.length}</span> results
              </p>
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </Card>
  );
};

export default IPAssetsList;
