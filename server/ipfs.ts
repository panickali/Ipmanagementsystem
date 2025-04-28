import { create } from 'ipfs-http-client';

// Configure IPFS client
const ipfsConfig = {
  host: process.env.IPFS_HOST || 'localhost',
  port: process.env.IPFS_PORT ? parseInt(process.env.IPFS_PORT) : 5001,
  protocol: process.env.IPFS_PROTOCOL || 'http'
};

// Create IPFS client
const ipfs = create(ipfsConfig);

/**
 * Upload file to IPFS
 * @param fileBuffer File buffer to upload
 * @returns IPFS hash of the uploaded file
 */
export async function uploadToIPFS(fileBuffer: Buffer): Promise<string> {
  try {
    const result = await ipfs.add(fileBuffer);
    return result.cid.toString();
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload file to IPFS');
  }
}

/**
 * Check if IPFS node is online
 * @returns Object with online status and gateway URL
 */
export async function checkIPFSStatus(): Promise<{ online: boolean; gateway: string; api: string }> {
  try {
    const status = await ipfs.isOnline();
    return {
      online: status,
      gateway: `${ipfsConfig.protocol}://${ipfsConfig.host}:8080`,
      api: `${ipfsConfig.protocol}://${ipfsConfig.host}:${ipfsConfig.port}`
    };
  } catch (error) {
    return {
      online: false,
      gateway: `${ipfsConfig.protocol}://${ipfsConfig.host}:8080`,
      api: `${ipfsConfig.protocol}://${ipfsConfig.host}:${ipfsConfig.port}`
    };
  }
}

/**
 * Get gateway URL for an IPFS hash
 * @param ipfsHash IPFS hash
 * @returns URL to access the content through the gateway
 */
export function getIPFSGatewayUrl(ipfsHash: string): string {
  return `${ipfsConfig.protocol}://${ipfsConfig.host}:8080/ipfs/${ipfsHash}`;
}

export default { uploadToIPFS, checkIPFSStatus, getIPFSGatewayUrl };
