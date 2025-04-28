import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  UserX,
  Download,
  AlertCircle
} from "lucide-react";

const GDPRCompliance = () => {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Export user data mutation
  const exportDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/gdpr/export");
      return await response.json();
    },
    onSuccess: (data) => {
      // Create a blob from the JSON data
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `ip-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Data exported successfully",
        description: "Your data has been exported to a JSON file",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: error.message || "Failed to export your data",
      });
    },
  });
  
  // Delete personal data mutation
  const deleteDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/gdpr/personal-data");
      return await response.json();
    },
    onSuccess: () => {
      setDeleteDialogOpen(false);
      toast({
        title: "Deletion request submitted",
        description: "Your personal data deletion request has been submitted",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Deletion request failed",
        description: error.message || "Failed to process your deletion request",
      });
    },
  });
  
  const complianceItems = [
    {
      title: "Personal Data Protection",
      description: "Your personal information is protected in accordance with GDPR regulations. Only essential data is stored on the blockchain.",
      icon: <ShieldCheck className="text-primary" />,
      status: "Compliant",
      action: {
        label: "Data Policy",
        handler: () => {
          toast({
            title: "Data Policy",
            description: "The data policy would be displayed here in a production environment.",
          });
        }
      }
    },
    {
      title: "Right to be Forgotten",
      description: "You can request the removal of your personal data while maintaining the integrity of your IP records on the blockchain.",
      icon: <UserX className="text-primary" />,
      status: "Implemented",
      action: {
        label: "Request Deletion",
        handler: () => setDeleteDialogOpen(true)
      }
    },
    {
      title: "Data Portability",
      description: "Export your IP asset data in a machine-readable format for use with other services or platforms.",
      icon: <Download className="text-primary" />,
      status: "Available",
      action: {
        label: "Export Data",
        handler: () => exportDataMutation.mutate()
      }
    }
  ];

  return (
    <>
      <Card className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-medium text-neutral-900">GDPR Compliance</h2>
        </div>
        
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {complianceItems.map((item, index) => (
              <div key={index} className="flex-1 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  {item.icon}
                  <h3 className="font-medium ml-2">{item.title}</h3>
                </div>
                <p className="text-sm text-neutral-700 mb-3">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">{item.status}</span>
                  <Button 
                    variant="link" 
                    className="text-primary text-sm p-0 h-auto"
                    onClick={item.action.handler}
                    disabled={
                      (item.action.label === "Export Data" && exportDataMutation.isPending) ||
                      (item.action.label === "Request Deletion" && deleteDataMutation.isPending)
                    }
                  >
                    {item.action.label}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Deletion confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
              Confirm Personal Data Deletion
            </DialogTitle>
            <DialogDescription>
              This action will anonymize your personal information while preserving your IP assets on the blockchain.
              Your IP registration hashes and ownership records will remain intact.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 p-4 rounded-md text-amber-800 text-sm">
            <p className="font-medium">Important Note:</p>
            <p>While your name and contact information will be removed, ownership records linked to your account will be preserved for legal purposes.</p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => deleteDataMutation.mutate()}
              disabled={deleteDataMutation.isPending}
            >
              {deleteDataMutation.isPending ? "Processing..." : "Confirm Deletion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GDPRCompliance;
