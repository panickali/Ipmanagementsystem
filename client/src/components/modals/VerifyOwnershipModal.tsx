import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckSquare, Loader2, CheckCircle, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Form schema
const verifySchema = z.object({
  ipfsHash: z.string().min(10, "Valid IPFS hash required"),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

interface VerifyOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VerificationResult {
  verified: boolean;
  ownerAddress?: string;
  assetName?: string;
  assetType?: string;
  registrationDate?: string;
}

const VerifyOwnershipModal = ({ isOpen, onClose }: VerifyOwnershipModalProps) => {
  const { toast } = useToast();
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  
  // Form setup
  const form = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      ipfsHash: "",
    }
  });

  // Verification mutation
  const verifyMutation = useMutation({
    mutationFn: async (data: VerifyFormValues) => {
      const response = await apiRequest("GET", `/api/verify?ipfsHash=${encodeURIComponent(data.ipfsHash)}`);
      return await response.json();
    },
    onSuccess: (data) => {
      // In a real app, this would verify actual blockchain data
      // For demo, we're simulating a response
      setVerificationResult({
        verified: true,
        ownerAddress: "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9",
        assetName: "Sample Asset",
        assetType: "Copyright",
        registrationDate: new Date().toISOString(),
      });
    },
    onError: (error: Error) => {
      setVerificationResult({
        verified: false,
      });
      
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: "The provided IPFS hash could not be verified on the blockchain",
      });
    }
  });

  const onSubmit = (data: VerifyFormValues) => {
    setVerificationResult(null);
    verifyMutation.mutate(data);
  };

  const resetForm = () => {
    form.reset();
    setVerificationResult(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CheckSquare className="mr-2 h-5 w-5 text-neutral-700" />
            Verify IP Ownership
          </DialogTitle>
          <DialogDescription>
            Verify the ownership of an IP asset using its IPFS hash
          </DialogDescription>
        </DialogHeader>
        
        {!verificationResult ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="ipfsHash"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IPFS Hash</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter the IPFS hash to verify" 
                        {...field} 
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
                    resetForm();
                    onClose();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={verifyMutation.isPending}
                >
                  {verifyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Ownership"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="py-4">
            <Card className={verificationResult.verified ? "border-green-500" : "border-red-500"}>
              <CardHeader className={`${verificationResult.verified ? "bg-green-50" : "bg-red-50"} py-3`}>
                <CardTitle className="flex items-center text-base">
                  {verificationResult.verified ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-600">Verified on Blockchain</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600 mr-2" />
                      <span className="text-red-600">Not Verified</span>
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {verificationResult.verified 
                    ? "This IP asset has been verified on the blockchain" 
                    : "No records found for this IPFS hash"
                  }
                </CardDescription>
              </CardHeader>
              
              {verificationResult.verified && (
                <CardContent className="py-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium">Asset Name:</div>
                    <div className="text-sm">{verificationResult.assetName}</div>
                    
                    <div className="text-sm font-medium">Asset Type:</div>
                    <div className="text-sm">{verificationResult.assetType}</div>
                    
                    <div className="text-sm font-medium">Owner Address:</div>
                    <div className="text-sm font-mono text-xs truncate">
                      {verificationResult.ownerAddress}
                    </div>
                    
                    <div className="text-sm font-medium">Registration Date:</div>
                    <div className="text-sm">
                      {new Date(verificationResult.registrationDate!).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              )}
              
              <CardFooter className="flex justify-end pt-2">
                <DialogClose asChild>
                  <Button onClick={() => resetForm()}>Close</Button>
                </DialogClose>
              </CardFooter>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VerifyOwnershipModal;
