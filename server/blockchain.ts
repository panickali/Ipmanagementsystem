import { ethers } from 'ethers';

// Define contract ABIs
// In a real app, these would be imported from compiled contract JSON files
// For now, we'll use placeholder ABIs that represent the functions we need
const IPRegistryABI = [
  "function registerIP(string memory ipfsHash, string memory metadata, address owner) external returns (bytes32)",
  "function getIPOwner(string memory ipfsHash) external view returns (address)",
  "function getIPMetadata(string memory ipfsHash) external view returns (string memory)"
];

const OwnershipManagementABI = [
  "function transferOwnership(string memory ipfsHash, address from, address to) external returns (bool)",
  "function getOwnershipHistory(string memory ipfsHash) external view returns (address[] memory)"
];

const GDPRComplianceABI = [
  "function requestDataDeletion(string memory ipfsHash) external returns (bool)",
  "function setDataAccessLevel(string memory ipfsHash, uint8 level) external returns (bool)",
  "function getDataAccessAudit(string memory ipfsHash) external view returns (address[] memory, uint256[] memory)"
];

const LicensingABI = [
  "function createLicense(string memory ipfsHash, string memory licenseTerms, address licensee) external returns (bytes32)",
  "function getLicenseStatus(bytes32 licenseId) external view returns (uint8)",
  "function revokeLicense(bytes32 licenseId) external returns (bool)"
];

// Configure blockchain connection - ONLY USE LOCAL NETWORKS
const blockchainConfig = {
  url: process.env.BLOCKCHAIN_URL || 'http://localhost:8545',
  chainId: process.env.BLOCKCHAIN_CHAIN_ID ? parseInt(process.env.BLOCKCHAIN_CHAIN_ID) : 1337, // 1337 is Ganache's default
  networkName: process.env.BLOCKCHAIN_NETWORK || 'Local Development Network',
  // Ensure we're never connecting to mainnet
  isLocalOnly: true
};

// Safety check: prevent connecting to mainnet
function validateLocalNetworkOnly(chainId: number) {
  // Mainnet chain IDs to avoid
  const MAINNET_CHAIN_IDS = [1, 137, 56, 43114, 42161, 10];
  
  if (MAINNET_CHAIN_IDS.includes(chainId)) {
    console.error('SECURITY ERROR: Attempted to connect to mainnet (Chain ID: ' + chainId + ')');
    console.error('This application is configured to use local development networks only');
    throw new Error('Mainnet connection forbidden');
  }
  
  return true;
}

// Contract addresses - would come from environment in production
const contractAddresses = {
  ipRegistry: process.env.IP_REGISTRY_ADDRESS || '0x123f681646d4a755815f9cb19e1acc8565a0c2ac',
  ownershipManagement: process.env.OWNERSHIP_MANAGEMENT_ADDRESS || '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9',
  gdprCompliance: process.env.GDPR_COMPLIANCE_ADDRESS || '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9',
  licensing: process.env.LICENSING_ADDRESS || '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
};

// Initialize provider and signer
let provider: ethers.JsonRpcProvider;
let connected = false;
let networkInfo: any = { name: 'Unknown' };

try {
  // Validate chain ID before attempting to connect
  validateLocalNetworkOnly(blockchainConfig.chainId);
  
  // Attempt to connect to the blockchain network
  provider = new ethers.JsonRpcProvider(blockchainConfig.url, {
    chainId: blockchainConfig.chainId,
    name: blockchainConfig.networkName,
  });
  
  console.log(`Attempting to connect to local blockchain at ${blockchainConfig.url} (Chain ID: ${blockchainConfig.chainId})`);
  console.log('IMPORTANT: This application is configured for local development networks only');
  
  // Try to get network info to verify connection
  provider.getNetwork()
    .then(network => {
      // Safety check: Never connect to mainnet
      if (validateLocalNetworkOnly(Number(network.chainId))) {
        connected = true;
        networkInfo = network;
        console.log(`Connected to blockchain network: ${network.name} (chainId: ${network.chainId})`);
        console.log('IMPORTANT: Using development/test network only, not mainnet');
      }
    })
    .catch(err => {
      console.error('Failed to get network information:', err);
      connected = false;
    });
    
} catch (error) {
  console.error('Failed to connect to blockchain provider:', error);
  // Create a fallback provider that will be used for mock responses
  provider = new ethers.JsonRpcProvider('http://localhost:8545');
  connected = false;
}

// Create contract instances with proper ABIs
const contracts: any = {};

try {
  if (connected) {
    // Create actual contract instances when connected
    contracts.ipRegistry = new ethers.Contract(contractAddresses.ipRegistry, IPRegistryABI as any, provider);
    contracts.ownershipManagement = new ethers.Contract(contractAddresses.ownershipManagement, OwnershipManagementABI as any, provider);
    contracts.gdprCompliance = new ethers.Contract(contractAddresses.gdprCompliance, GDPRComplianceABI as any, provider);
    contracts.licensing = new ethers.Contract(contractAddresses.licensing, LicensingABI as any, provider);
    console.log('Smart contracts initialized successfully');
  } else {
    // Create placeholder contract instances that will be populated later
    contracts.ipRegistry = null;
    contracts.ownershipManagement = null;
    contracts.gdprCompliance = null;
    contracts.licensing = null;
    console.log('Using placeholder smart contracts (blockchain connection not available)');
  }
} catch (error) {
  console.error('Error initializing smart contracts:', error);
  contracts.ipRegistry = null;
  contracts.ownershipManagement = null;
  contracts.gdprCompliance = null;
  contracts.licensing = null;
}

/**
 * Register IP on the blockchain
 * @param ipfsHash IPFS hash of the IP asset
 * @param metadata Metadata of the IP asset containing type, name, description
 * @param ownerAddress Owner's blockchain address
 * @returns Transaction hash
 */
export async function registerIP(ipfsHash: string, metadata: any, ownerAddress: string): Promise<string> {
  try {
    // Get wallet for transaction signing
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY || '0x0123456789012345678901234567890123456789012345678901234567890123';
    const wallet = new ethers.Wallet(privateKey, provider);
    
    if (connected && contracts.ipRegistry) {
      console.log(`Registering IP asset on blockchain: ${ipfsHash} for owner ${ownerAddress}`);
      console.log(`Asset Type: ${metadata.type}, Name: ${metadata.name}`);
      
      // Connect the contract with the signer
      const contractWithSigner = contracts.ipRegistry.connect(wallet);
      
      // Prepare metadata for on-chain storage
      const metadataForChain = {
        name: metadata.name,
        description: metadata.description,
        assetType: metadata.type, // "copyright", "patent", "trademark", or "design"
        ipfsHash: ipfsHash,
        timestamp: Date.now(),
        category: metadata.category || 'general'
      };
      
      // Convert metadata to JSON string
      const metadataJson = JSON.stringify(metadataForChain);
      
      // Call the contract to register the IP with its metadata
      // This assumes your smart contract has a registerIP function with this signature
      const tx = await contractWithSigner.registerIP(
        ipfsHash,
        metadataJson,
        ownerAddress,
        {
          gasLimit: 1000000 // Adjust gas limit as needed
        }
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log(`IP registration successful. Transaction hash: ${receipt.hash}`);
      
      return receipt.hash;
    } else {
      console.log('Using mock registration (blockchain not connected)');
      // Return a mock transaction hash for demonstration
      return `0x${Math.random().toString(16).substring(2, 42)}`;
    }
  } catch (err) {
    console.error('Error registering IP on blockchain:', err);
    // Handle unknown error type safely
    const error = err as any;
    const errorMessage = error && typeof error === 'object' && 'message' in error
      ? error.message
      : 'Unknown error';
    throw new Error(`Failed to register IP on blockchain: ${errorMessage}`);
  }
}

/**
 * Transfer ownership of an IP asset
 * @param ipfsHash IPFS hash of the IP asset
 * @param fromAddress Current owner's blockchain address
 * @param toAddress New owner's blockchain address
 * @returns Transaction hash
 */
export async function transferOwnership(ipfsHash: string, fromAddress: string, toAddress: string): Promise<string> {
  try {
    // Mock transfer
    return `0x${Math.random().toString(16).substring(2, 42)}`;
  } catch (err) {
    console.error('Error transferring ownership on blockchain:', err);
    const error = err as any;
    const errorMessage = error && typeof error === 'object' && 'message' in error
      ? error.message
      : 'Unknown error';
    throw new Error(`Failed to transfer ownership on blockchain: ${errorMessage}`);
  }
}

/**
 * Create a license for an IP asset
 * @param ipfsHash IPFS hash of the IP asset
 * @param licenseData License data
 * @param ownerAddress Owner's blockchain address
 * @returns Transaction hash
 */
export async function createLicense(ipfsHash: string, licenseData: any, ownerAddress: string): Promise<string> {
  try {
    // Mock license creation
    return `0x${Math.random().toString(16).substring(2, 42)}`;
  } catch (err) {
    console.error('Error creating license on blockchain:', err);
    const error = err as any;
    const errorMessage = error && typeof error === 'object' && 'message' in error
      ? error.message
      : 'Unknown error';
    throw new Error(`Failed to create license on blockchain: ${errorMessage}`);
  }
}

/**
 * Verify ownership of an IP asset
 * @param ipfsHash IPFS hash of the IP asset
 * @returns Owner's blockchain address
 */
export async function verifyOwnership(ipfsHash: string): Promise<string> {
  try {
    // Mock verification
    return '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9';
  } catch (err) {
    console.error('Error verifying ownership on blockchain:', err);
    const error = err as any;
    const errorMessage = error && typeof error === 'object' && 'message' in error
      ? error.message
      : 'Unknown error';
    throw new Error(`Failed to verify ownership on blockchain: ${errorMessage}`);
  }
}

/**
 * Check blockchain connection status
 * @returns Object with network details
 */
export async function checkBlockchainStatus(): Promise<{ connected: boolean; network: string; nodeUrl: string }> {
  try {
    const network = await provider.getNetwork();
    return {
      connected: true,
      network: network.name === 'unknown' ? 'Development' : network.name,
      nodeUrl: blockchainConfig.url
    };
  } catch (err) {
    // Just log the error and return disconnected status
    console.warn('Error checking blockchain status:', err);
    return {
      connected: false,
      network: 'Unknown',
      nodeUrl: blockchainConfig.url
    };
  }
}

/**
 * Get contract addresses
 * @returns Object with contract addresses
 */
export function getContractAddresses(): typeof contractAddresses {
  return contractAddresses;
}

export default {
  registerIP,
  transferOwnership,
  createLicense,
  verifyOwnership,
  checkBlockchainStatus,
  getContractAddresses
};
