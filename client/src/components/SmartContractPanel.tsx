import { useEffect, useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SmartContractPanelProps {
  isOpen: boolean;
  onClose: () => void;
  contracts?: {
    ipRegistry: string;
    ownershipManagement: string;
    gdprCompliance: string;
    licensing: string;
  };
}

interface Transaction {
  type: string;
  timestamp: string;
  hash: string;
  status: "Confirmed" | "Pending";
}

const SmartContractPanel = ({ isOpen, onClose, contracts }: SmartContractPanelProps) => {
  // Default contract addresses if not provided
  const defaultAddresses = {
    ipRegistry: "Contract not available",
    ownershipManagement: "Contract not available",
    gdprCompliance: "Contract not available",
    licensing: "Contract not available"
  };
  
  // Use provided contracts or defaults
  const contractAddresses = contracts || defaultAddresses;
  // Sample transactions for UI display
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      type: "IP Registration",
      timestamp: "1 hour ago",
      hash: "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be...",
      status: "Confirmed"
    },
    {
      type: "Ownership Transfer",
      timestamp: "3 hours ago",
      hash: "0x28c6c06298d514db089934071355e5743bf21d60...",
      status: "Confirmed"
    },
    {
      type: "License Creation",
      timestamp: "Yesterday",
      hash: "0x6cc5f688a315f3dc28a7781717a9a798a59fda7b...",
      status: "Confirmed"
    }
  ]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const panel = document.getElementById("smart-contract-panel");
      if (panel && !panel.contains(event.target as Node) && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div 
      id="smart-contract-panel"
      className={`fixed right-0 top-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-10 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="bg-primary px-4 py-3 flex items-center justify-between">
          <h3 className="text-white font-medium">Smart Contract Details</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:text-neutral-200" 
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-grow overflow-y-auto p-4">
          <div className="mb-6">
            <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">Contract Information</h4>
            
            <div className="bg-neutral-100 rounded-md p-3 mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-neutral-700">Registry Contract</span>
                <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">Active</span>
              </div>
              <div className="font-mono text-xs text-neutral-600 break-all">
                {contractAddresses.ipRegistry}
              </div>
            </div>
            
            <div className="bg-neutral-100 rounded-md p-3 mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-neutral-700">Ownership Contract</span>
                <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">Active</span>
              </div>
              <div className="font-mono text-xs text-neutral-600 break-all">
                {contractAddresses.ownershipManagement}
              </div>
            </div>
            
            <div className="bg-neutral-100 rounded-md p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-neutral-700">Licensing Contract</span>
                <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">Active</span>
              </div>
              <div className="font-mono text-xs text-neutral-600 break-all">
                {contractAddresses.licensing}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">GDPR Compliance</h4>
            <div className="space-y-3">
              {[
                {title: "Data Minimization", desc: "Only hash fingerprints stored on-chain"},
                {title: "Logical Deletion", desc: "Implemented with access revocation"},
                {title: "Key Rotation", desc: "Regular key updates supported"},
                {title: "Data Portability", desc: "Export functionality available"}
              ].map((item, i) => (
                <div key={i} className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div className="ml-3 text-sm">
                    <p className="font-medium text-neutral-700">{item.title}</p>
                    <p className="text-neutral-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">Recent Transactions</h4>
            <div className="space-y-3">
              {transactions.map((tx, i) => (
                <div key={i} className="bg-neutral-100 rounded-md p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-neutral-700">{tx.type}</span>
                    <span className="text-xs text-neutral-500">{tx.timestamp}</span>
                  </div>
                  <div className="font-mono text-xs text-neutral-600 break-all mb-1">{tx.hash}</div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">{tx.status}</span>
                    <Button 
                      variant="link" 
                      className="text-primary text-xs p-0 h-auto" 
                      onClick={() => {
                        // In a real app, this would open a transaction viewer
                        window.open(`https://etherscan.io/tx/${tx.hash.slice(0, 66)}`, "_blank");
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 p-4">
          <Button 
            className="w-full bg-primary hover:bg-primary-dark text-white"
            onClick={() => {
              // In a real app, this would navigate to a contract explorer
              window.open("https://etherscan.io", "_blank");
            }}
          >
            View All Smart Contracts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SmartContractPanel;
