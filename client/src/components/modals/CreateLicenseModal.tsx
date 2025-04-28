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
  FormDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileText, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

// Form schema
const licenseSchema = z.object({
  ipAssetId: z.string().min(1, "Please select an IP asset"),
  licenseeName: z.string().min(2, "Licensee name is required"),
  licenseeEmail: z.string().email("Valid email is required"),
  termsText: z.string().min(10, "License terms are required"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date().optional(),
});

type LicenseFormValues = z.infer<typeof licenseSchema>;

interface CreateLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateLicenseModal = ({ isOpen, onClose }: CreateLicenseModalProps) => {
  const { toast } = useToast();
  
  // Get user's IP assets
  const { data: assets, isLoading: assetsLoading } = useQuery<IPAsset[]>({
    queryKey: ["/api/ip-assets"],
    enabled: isOpen, // Only fetch when modal is open
  });
  
  // Form setup
  const form = useForm<LicenseFormValues>({
    resolver: zodResolver(licenseSchema),
    defaultValues: {
      ipAssetId: "",
      licenseeName: "",
      licenseeEmail: "",
      termsText: "",
      startDate: new Date(),
    }
  });

  // License creation mutation
  const licenseMutation = useMutation({
    mutationFn: async (data: LicenseFormValues) => {
      const payload = {
        ...data,
        ipAssetId: parseInt(data.ipAssetId),
        startDate: data.startDate.toISOString(),
        endDate: data.endDate ? data.endDate.toISOString() : undefined,
      };
      
      const response = await apiRequest("POST", "/api/licenses", payload);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "License created",
        description: "License agreement has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "License creation failed",
        description: error.message,
      });
    }
  });

  const onSubmit = (data: LicenseFormValues) => {
    licenseMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-accent" />
            Create License Agreement
          </DialogTitle>
          <DialogDescription>
            Create a license agreement for one of your IP assets
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="licenseeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Licensee Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter licensee's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="licenseeEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Licensee Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter licensee's email" 
                        type="email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="termsText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Terms</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter the terms of the license agreement" 
                      rows={5}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Specify usage rights, limitations, attribution requirements, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Set end date (optional)</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) => 
                            date < new Date() || 
                            date < form.getValues("startDate")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Leave empty for perpetual license
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
                className="bg-accent hover:bg-accent/90"
                disabled={licenseMutation.isPending || !assets?.length}
              >
                {licenseMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating License...
                  </>
                ) : (
                  "Create License"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLicenseModal;
