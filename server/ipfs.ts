import { create } from 'ipfs-http-client';
import * as fs from 'fs';
import * as path from 'path';

// Configure IPFS client
const ipfsConfig = {
  host: process.env.IPFS_HOST || 'localhost',
  port: process.env.IPFS_PORT ? parseInt(process.env.IPFS_PORT) : 5001,
  protocol: process.env.IPFS_PROTOCOL || 'http',
  timeout: process.env.IPFS_TIMEOUT ? parseInt(process.env.IPFS_TIMEOUT) : 10000,
};

// Configure local IPFS cache directory
const localIpfsCacheDir = process.env.LOCAL_IPFS_CACHE || path.join(process.cwd(), '.ipfs-cache');

// Create directory if it doesn't exist
if (!fs.existsSync(localIpfsCacheDir)) {
  fs.mkdirSync(localIpfsCacheDir, { recursive: true });
}

// Create IPFS client
let ipfs: any;
let ipfsConnected = false;
try {
  // Create the client
  ipfs = create({
    host: ipfsConfig.host,
    port: ipfsConfig.port,
    protocol: ipfsConfig.protocol,
    timeout: ipfsConfig.timeout
  });
  
  // Test connection
  console.log(`Attempting to connect to IPFS node at ${ipfsConfig.protocol}://${ipfsConfig.host}:${ipfsConfig.port}`);
  ipfs.id()
    .then((info: any) => {
      console.log(`Connected to IPFS node. ID: ${info.id}`);
      ipfsConnected = true;
    })
    .catch((err: any) => {
      console.error('Failed to connect to IPFS node:', err.message);
      ipfsConnected = false;
    });
} catch (error) {
  console.error('Error creating IPFS client:', error);
  // Create a placeholder client
  ipfs = {
    add: async () => { throw new Error('IPFS not connected'); },
    isOnline: async () => false
  };
  ipfsConnected = false;
}

/**
 * Upload file to IPFS with metadata for IP categorization
 * @param fileBuffer File buffer to upload
 * @param metadata Optional metadata to associate with the file
 * @returns IPFS hash of the uploaded file
 */
export async function uploadToIPFS(fileBuffer: Buffer, metadata?: any): Promise<string> {
  try {
    let ipfsHash = '';
    
    if (ipfsConnected) {
      console.log('Uploading file to IPFS node...');
      
      // Create a unique filename based on timestamp and random value
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      
      // Add metadata if provided
      let ipfsOptions: any = {};
      if (metadata) {
        // Prepare IPFS file upload options with metadata
        ipfsOptions = {
          cidVersion: 1,
          pin: true, // Pin the file on the IPFS node
          hashAlg: 'sha2-256',
          wrapWithDirectory: true, // Wrap in directory to store metadata
          progress: (prog: number) => console.log(`Upload progress: ${prog}`)
        };
        
        // Add metadata as JSON
        await ipfs.add({
          path: `${uniqueId}/metadata.json`,
          content: Buffer.from(JSON.stringify({
            name: metadata.name || 'Unnamed Asset',
            description: metadata.description || '',
            assetType: metadata.type || 'copyright',
            category: metadata.category || 'general',
            createdAt: new Date().toISOString(),
            tags: metadata.tags || [],
            ...metadata
          }))
        }, ipfsOptions);
        
        console.log('Metadata uploaded to IPFS');
      }
      
      // Upload the actual file
      const result = await ipfs.add({
        path: metadata ? `${uniqueId}/asset` : uniqueId,
        content: fileBuffer
      }, ipfsOptions);
      
      if (metadata && result.cid) {
        // The CID we want is the directory CID (one level up)
        // For directory wrapping, we need the parent CID
        const dirResult = await ipfs.ls(result.cid);
        if (dirResult && dirResult.length > 0) {
          ipfsHash = dirResult[0].cid.toString();
        } else {
          ipfsHash = result.cid.toString();
        }
      } else {
        ipfsHash = result.cid.toString();
      }
      
      console.log(`File uploaded to IPFS with hash: ${ipfsHash}`);
      
      // Store a local cache of the file for redundancy
      const localFilePath = path.join(localIpfsCacheDir, ipfsHash);
      fs.writeFileSync(localFilePath, fileBuffer);
      console.log(`File cached locally at: ${localFilePath}`);
      
      // If metadata exists, store it alongside the file
      if (metadata) {
        fs.writeFileSync(
          `${localFilePath}.json`, 
          JSON.stringify(metadata, null, 2)
        );
      }
      
      return ipfsHash;
    } else {
      console.log('IPFS node not connected. Using local storage only.');
      
      // Generate a hash for local identification 
      // (in a real system, you would use a proper hashing algorithm)
      const mockCid = `local-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      // Store file locally for later sync to IPFS
      const localFilePath = path.join(localIpfsCacheDir, mockCid);
      fs.writeFileSync(localFilePath, fileBuffer);
      console.log(`File stored locally at: ${localFilePath}`);
      
      // If metadata exists, store it alongside the file
      if (metadata) {
        fs.writeFileSync(
          `${localFilePath}.json`, 
          JSON.stringify({
            name: metadata.name || 'Unnamed Asset',
            description: metadata.description || '',
            assetType: metadata.type || 'copyright',
            category: metadata.category || 'general',
            createdAt: new Date().toISOString(),
            tags: metadata.tags || [],
            ...metadata,
            _localOnly: true
          }, null, 2)
        );
      }
      
      return mockCid;
    }
  } catch (error: any) {
    console.error('Error uploading to IPFS:', error);
    
    // Fallback to local storage in case of IPFS upload failure
    try {
      const fallbackId = `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const localFilePath = path.join(localIpfsCacheDir, fallbackId);
      fs.writeFileSync(localFilePath, fileBuffer);
      console.log(`IPFS upload failed. File stored locally at: ${localFilePath}`);
      
      // Store error details for troubleshooting
      fs.writeFileSync(
        `${localFilePath}.error.json`,
        JSON.stringify({ 
          error: error.message, 
          timestamp: new Date().toISOString() 
        }, null, 2)
      );
      
      return fallbackId;
    } catch (localError) {
      console.error('Failed to store file locally:', localError);
      throw new Error(`Failed to upload file to IPFS and local storage failed: ${error.message}`);
    }
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

/**
 * Retrieve IP asset metadata from IPFS
 * @param ipfsHash IPFS hash of the asset
 * @returns Metadata object or null if not found/error
 */
export async function getIPFSMetadata(ipfsHash: string): Promise<any | null> {
  try {
    // First check if we have a local cache
    const localJsonPath = path.join(localIpfsCacheDir, `${ipfsHash}.json`);
    
    if (fs.existsSync(localJsonPath)) {
      console.log(`Found local metadata cache for ${ipfsHash}`);
      const localData = fs.readFileSync(localJsonPath, 'utf8');
      return JSON.parse(localData);
    }
    
    // If we don't have local cache and IPFS is connected, try to fetch from IPFS
    if (ipfsConnected) {
      console.log(`Fetching metadata from IPFS for ${ipfsHash}`);
      
      try {
        // Try to fetch metadata.json from the IPFS directory
        const metadataBuffer = await ipfs.cat(`${ipfsHash}/metadata.json`);
        if (metadataBuffer) {
          const metadataJson = Buffer.from(metadataBuffer).toString('utf8');
          const metadata = JSON.parse(metadataJson);
          
          // Cache it locally for future use
          fs.writeFileSync(localJsonPath, metadataJson);
          
          return metadata;
        }
      } catch (err) {
        console.log(`No metadata.json found for ${ipfsHash}, might be a direct file`);
      }
    }
    
    // If we reach here, we couldn't get the metadata
    return null;
  } catch (error) {
    console.error(`Error fetching metadata for ${ipfsHash}:`, error);
    return null;
  }
}

/**
 * Categorize an IP asset based on its metadata and content
 * @param ipfsHash IPFS hash of the asset
 * @param fileBuffer Optional file buffer if available
 * @returns Categorization information
 */
export async function categorizeIPAsset(ipfsHash: string, fileBuffer?: Buffer): Promise<any> {
  // Get metadata if available
  const metadata = await getIPFSMetadata(ipfsHash);
  
  // Default categorization
  const categorization: {
    assetType: string,
    category: string,
    tags: string[],
    confidence: number
  } = {
    assetType: 'unknown',
    category: 'general',
    tags: [],
    confidence: 0
  };
  
  if (metadata) {
    // Use metadata for categorization
    categorization.assetType = metadata.assetType || metadata.type || 'unknown';
    categorization.category = metadata.category || 'general';
    categorization.tags = metadata.tags || [];
    categorization.confidence = 0.9; // High confidence when metadata is available
  } else if (fileBuffer) {
    // Basic file type detection based on buffer signature
    // In a real system, you'd use ML/AI for more sophisticated categorization
    const fileSignature = fileBuffer.slice(0, 4).toString('hex');
    
    if (fileSignature.startsWith('89504e47')) {
      // PNG image
      categorization.assetType = 'copyright';
      categorization.category = 'image';
      categorization.tags = [];
      categorization.tags.push('image');
      categorization.tags.push('png');
      categorization.confidence = 0.7;
    } else if (fileSignature.startsWith('ffd8ffe')) {
      // JPEG image
      categorization.assetType = 'copyright';
      categorization.category = 'image';
      categorization.tags = [];
      categorization.tags.push('image');
      categorization.tags.push('jpeg');
      categorization.confidence = 0.7;
    } else if (fileSignature.startsWith('504446')) {
      // PDF document
      categorization.assetType = 'copyright';
      categorization.category = 'document';
      categorization.tags = [];
      categorization.tags.push('document');
      categorization.tags.push('pdf');
      categorization.confidence = 0.6;
    } else {
      // Unknown file type
      categorization.confidence = 0.3;
    }
  }
  
  return categorization;
}

export default { 
  uploadToIPFS, 
  checkIPFSStatus, 
  getIPFSGatewayUrl,
  getIPFSMetadata,
  categorizeIPAsset
};
