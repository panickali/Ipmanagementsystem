import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { IPAsset } from "@shared/schema";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SquareSplitHorizontal, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Form schema
const transferSchema = z.object({
  ipAssetId: z.string().min(1, "Please select an IP asset"),
  toUserId: z.string().min(1, "Please enter recipient user ID"),
});

type TransferFormValues = z.infer<typeof transferSchema>;

interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TransferOwnershipModal = ({ isOpen, onClose }: TransferOwnershipModalProps) => {
  const { toast } = useToast();
  
  // Get user's IP assets
  const { data: assets, isLoading: assetsLoading } = useQuery<IPAsset[]>({
    queryKey: ["/api/ip-assets"],
    enabled: isOpen, // Only fetch when modal is open
  });
  
  // Form setup
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      ipAssetId: "",
      toUserId: "",
    }
  });

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: async (data: TransferFormValues) => {
      const response = await apiRequest("POST", "/api/transfers", {
        ipAssetId: parseInt(data.ipAssetId),
        toUserId: parseInt(data.toUserId),
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Transfer initiated",
        description: "Ownership transfer has been initiated and is pending recipient approval",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Transfer failed",
        description: error.message,
      });
    }
  });

  const onSubmit = (data: TransferFormValues) => {
    transferMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <SquareSplitHorizontal className="mr-2 h-5 w-5 text-secondary" />
            Transfer IP Ownership
          </DialogTitle>
          <DialogDescription>
            Transfer ownership of your IP asset to another user
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                This will permanently transfer all ownership rights to the recipient.
                The transfer must be accepted by the recipient to complete.
              </AlertDescription>
            </Alert>
            
            <FormField
              control={form.control}
              name="ipAssetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select IP Asset</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={assetsLoading || !assets?.length}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an IP asset" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assetsLoading ? (
                        <SelectItem value="loading" disabled>Loading assets...</SelectItem>
                      ) : assets && assets.length > 0 ? (
                        assets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id.toString()}>
                            {asset.name} ({asset.type})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No assets available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="toUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient User ID</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter the recipient's user ID" 
                      {...field} 
                      type="number"
                      min="1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  form.reset();
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-secondary hover:bg-secondary-dark"
                disabled={transferMutation.isPending || !assets?.length}
              >
                {transferMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initiating Transfer...
                  </>
                ) : (
                  "Initiate Transfer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TransferOwnershipModal;
