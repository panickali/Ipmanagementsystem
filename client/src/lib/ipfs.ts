// Initialize IPFS configuration
const ipfsConfig = {
  gateway: 'http://localhost:8080',
  api: 'http://localhost:5001'
};

// Function to get IPFS status
export async function getIPFSStatus(): Promise<{
  online: boolean;
  gateway: string;
  api: string;
}> {
  try {
    // In a real implementation, we would check the actual status
    // Here we'll just fetch from the API
    const response = await fetch('/api/system/status');
    if (response.ok) {
      const data = await response.json();
      return data.ipfs;
    }
    
    return {
      online: false,
      gateway: ipfsConfig.gateway,
      api: ipfsConfig.api
    };
  } catch (error) {
    console.error('Error getting IPFS status:', error);
    return {
      online: false,
      gateway: ipfsConfig.gateway,
      api: ipfsConfig.api
    };
  }
}

// Function to get IPFS gateway URL for a hash
export function getIPFSGatewayUrl(ipfsHash: string): string {
  return `${ipfsConfig.gateway}/ipfs/${ipfsHash}`;
}

// Function to upload file to IPFS
export async function uploadToIPFS(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // In a real implementation, we would use the IPFS HTTP client
    // Here we'll rely on the backend API
    const response = await fetch('/api/ipfs/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload to IPFS');
    }
    
    const data = await response.json();
    return data.ipfsHash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
}

export default {
  getIPFSStatus,
  getIPFSGatewayUrl,
  uploadToIPFS
};
