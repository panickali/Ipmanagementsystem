import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PlusCircle, Upload, Loader2 } from "lucide-react";

// Form schema
const registerIPSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["copyright", "patent", "trademark", "design"]),
  ownerConfirmation: z.boolean().refine(val => val, "You must confirm ownership"),
  gdprConsent: z.boolean().refine(val => val, "You must consent to GDPR terms")
});

type RegisterIPFormValues = z.infer<typeof registerIPSchema>;

interface RegisterIPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterIPModal = ({ isOpen, onClose }: RegisterIPModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Form setup
  const form = useForm<RegisterIPFormValues>({
    resolver: zodResolver(registerIPSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "copyright",
      ownerConfirmation: false,
      gdprConsent: false
    }
  });

  // Register IP asset mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterIPFormValues) => {
      if (!file) {
        throw new Error("Please upload a file");
      }
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("type", data.type);

      const response = await fetch("/api/ip-assets", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to register IP asset");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "IP asset registered successfully",
        description: "Your intellectual property has been registered on the blockchain",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ip-assets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      resetForm();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message,
      });
    }
  });

  const onSubmit = (data: RegisterIPFormValues) => {
    registerMutation.mutate(data);
  };

  const resetForm = () => {
    form.reset();
    setFile(null);
  };

  // File handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  // Drag and drop handling
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Check file size
      if (droppedFile.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
        });
        return;
      }
      
      setFile(droppedFile);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <PlusCircle className="mr-2 h-5 w-5 text-primary" />
            Register New IP Asset
          </DialogTitle>
          <DialogDescription>
            Register your intellectual property asset securely on the blockchain
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name of your IP asset" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IP Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="copyright">Copyright</SelectItem>
                      <SelectItem value="patent">Patent</SelectItem>
                      <SelectItem value="trademark">Trademark</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your IP asset" 
                      rows={3} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* File upload */}
            <div>
              <FormLabel>File Upload</FormLabel>
              <div 
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${dragActive ? 'border-primary' : 'border-gray-300'} border-dashed rounded-md`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                  <div className="flex text-sm text-neutral-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark">
                      <span>Upload a file</span>
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-neutral-500">
                    PDF, PNG, JPG, ZIP up to 10MB
                  </p>
                  {file && (
                    <div className="mt-2 text-sm text-green-600 flex items-center justify-center">
                      <CheckCircleIcon className="h-5 w-5 mr-1" />
                      {file.name} ({formatFileSize(file.size)})
                    </div>
                  )}
                </div>
              </div>
              {!file && form.formState.isSubmitted && (
                <p className="mt-1 text-sm text-red-500">Please upload a file</p>
              )}
            </div>
            
            <FormField
              control={form.control}
              name="ownerConfirmation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange} 
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I confirm I am the creator or legal owner of this IP</FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="gdprConsent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange} 
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I consent to storing minimal personal data on the blockchain</FormLabel>
                    <FormDescription className="text-neutral-500">
                      In accordance with GDPR principles
                    </FormDescription>
                    <FormMessage />
                  </div>
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
                className="bg-primary hover:bg-primary-dark"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register on Blockchain"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        
      </DialogContent>
    </Dialog>
  );
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

// CheckCircle icon component
const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default RegisterIPModal;
