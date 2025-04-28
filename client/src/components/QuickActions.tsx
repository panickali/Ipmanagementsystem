import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  SquareSplitHorizontal, 
  FileText, 
  CheckSquare 
} from "lucide-react";
import RegisterIPModal from "./modals/RegisterIPModal";
import TransferOwnershipModal from "./modals/TransferOwnershipModal";
import CreateLicenseModal from "./modals/CreateLicenseModal";
import VerifyOwnershipModal from "./modals/VerifyOwnershipModal";

const QuickActions = () => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  return (
    <>
      <Card className="bg-white mb-6">
        <CardContent className="p-4">
          <h2 className="text-lg font-medium mb-3">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            <Button 
              className="bg-primary hover:bg-primary-dark text-white"
              onClick={() => setRegisterModalOpen(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Register New IP
            </Button>
            <Button 
              className="bg-secondary hover:bg-secondary-dark text-white"
              onClick={() => setTransferModalOpen(true)}
            >
              <SquareSplitHorizontal className="h-4 w-4 mr-2" />
              Transfer Ownership
            </Button>
            <Button 
              className="bg-accent hover:bg-accent/90 text-white"
              onClick={() => setLicenseModalOpen(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Create License
            </Button>
            <Button 
              variant="outline"
              className="text-neutral-700 border-gray-300 hover:bg-neutral-100"
              onClick={() => setVerifyModalOpen(true)}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Verify Ownership
            </Button>
          </div>
        </CardContent>
      </Card>

      <RegisterIPModal 
        isOpen={registerModalOpen} 
        onClose={() => setRegisterModalOpen(false)} 
      />
      
      <TransferOwnershipModal 
        isOpen={transferModalOpen} 
        onClose={() => setTransferModalOpen(false)} 
      />
      
      <CreateLicenseModal 
        isOpen={licenseModalOpen} 
        onClose={() => setLicenseModalOpen(false)} 
      />
      
      <VerifyOwnershipModal 
        isOpen={verifyModalOpen} 
        onClose={() => setVerifyModalOpen(false)} 
      />
    </>
  );
};

export default QuickActions;
