import { ethers } from 'ethers';

// Initialize provider - in a real app, would connect to a local node or infura
let provider: ethers.BrowserProvider | null = null;

// Function to connect to blockchain
export async function connectToBlockchain(): Promise<boolean> {
  try {
    // Check if window.ethereum exists (Metamask or other wallet injected)
    if (window.ethereum) {
      provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      return true;
    } else {
      // Fallback to local provider
      provider = new ethers.JsonRpcProvider('http://localhost:8545');
      return true;
    }
  } catch (error) {
    console.error('Failed to connect to blockchain:', error);
    return false;
  }
}

// Get blockchain connection status
export async function getBlockchainStatus(): Promise<{ 
  connected: boolean;
  network: string;
  nodeUrl: string;
}> {
  try {
    if (!provider) {
      await connectToBlockchain();
    }
    
    if (provider) {
      const network = await provider.getNetwork();
      return {
        connected: true,
        network: network.name === 'unknown' ? 'Development' : network.name,
        nodeUrl: 'http://localhost:8545' // Placeholder, would be dynamic in real implementation
      };
    }
    
    return {
      connected: false,
      network: 'Unknown',
      nodeUrl: 'http://localhost:8545'
    };
  } catch (error) {
    console.error('Error getting blockchain status:', error);
    return {
      connected: false,
      network: 'Unknown',
      nodeUrl: 'http://localhost:8545'
    };
  }
}

// Get transaction details
export async function getTransactionDetails(txHash: string): Promise<any> {
  try {
    if (!provider) {
      await connectToBlockchain();
    }
    
    if (provider) {
      const tx = await provider.getTransaction(txHash);
      if (tx) {
        return {
          hash: tx.hash,
          blockNumber: tx.blockNumber,
          from: tx.from,
          to: tx.to,
          value: tx.value.toString(),
          timestamp: Date.now() // Would get actual block timestamp in real implementation
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting transaction details:', error);
    return null;
  }
}

// Get contract addresses
export function getContractAddresses(): {
  ipRegistry: string;
  ownershipManagement: string;
  gdprCompliance: string;
  licensing: string;
} {
  // These would be fetched from an API in a real implementation
  return {
    ipRegistry: '0x123f681646d4a755815f9cb19e1acc8565a0c2ac',
    ownershipManagement: '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9',
    gdprCompliance: '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9',
    licensing: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
  };
}

export default {
  connectToBlockchain,
  getBlockchainStatus,
  getTransactionDetails,
  getContractAddresses
};
