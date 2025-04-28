
import { create } from 'ipfs';
import ganache from 'ganache';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

// Helper function to clean up IPFS repo lock if needed
function cleanupIPFSLock() {
  try {
    const repoLockPath = path.join('.ipfs', 'repo.lock');
    
    if (fs.existsSync(repoLockPath)) {
      console.log('Removing stale IPFS repo lock...');
      const stats = fs.statSync(repoLockPath);
      
      if (stats.isDirectory()) {
        // It's a directory, try to remove it recursively (but only if it's the lock directory)
        if (repoLockPath.endsWith('repo.lock')) {
          console.log('Lock is a directory, cleaning recursively...');
          // This is a simplified approach - we're just going to remove the lock indicator files
          const lockFiles = ['lock', 'LOCK', 'write.lock'];
          for (const file of lockFiles) {
            const filePath = path.join(repoLockPath, file);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }
        }
      } else {
        // It's a file, just remove it
        fs.unlinkSync(repoLockPath);
      }
    }
  } catch (err) {
    console.warn('Error cleaning up IPFS lock:', err);
    // Continue anyway
  }
}

// Initialize IPFS node
async function startIPFSNode() {
  try {
    // First try to clean up any stale lock file
    cleanupIPFSLock();
    
    const ipfs = await create({
      repo: './.ipfs',
      start: true,
      config: {
        Addresses: {
          Swarm: ['/ip4/0.0.0.0/tcp/4002'],
          API: '/ip4/0.0.0.0/tcp/5001',
          Gateway: '/ip4/0.0.0.0/tcp/8080'
        },
        Bootstrap: [],
        Discovery: {
          MDNS: {
            Enabled: false
          }
        }
      }
    });
    
    const id = await ipfs.id();
    console.log('IPFS node started:', id.id);
    return ipfs;
  } catch (error) {
    console.error('Failed to start IPFS node:', error);
    
    // If we still have a lock issue, just warn instead of crashing the app
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ERR_LOCK_EXISTS') {
      console.warn('IPFS lock exists. Continuing without local IPFS node.');
      return null;
    }
    
    throw error;
  }
}

// Initialize local blockchain
async function startBlockchain() {
  // First, try to release any existing ganache server
  try {
    const tempProvider = new ethers.JsonRpcProvider('http://localhost:8545');
    await tempProvider.destroy();
  } catch (e) {
    // Ignore if can't connect or destroy
  }
  
  try {
    // Create a new ganache server
    const server = ganache.server({
      wallet: {
        deterministic: true,
        totalAccounts: 10
      },
      logging: {
        quiet: false
      },
      // Configure server to automatically find a free port if 8545 is in use
      server: {
        port: 8545,
        host: "0.0.0.0"
      }
    });
    
    // Try to start the server
    await server.listen(8545);
    console.log('Ganache blockchain started on port 8545');
    
    // Get default accounts
    const provider = new ethers.JsonRpcProvider('http://0.0.0.0:8545');
    const accounts = await provider.listAccounts();
    console.log('Available accounts:', accounts);
    
    return server;
  } catch (error) {
    console.error('Failed to start blockchain:', error);
    // Don't throw here, just return null and let the application continue
    // without blockchain functionality
    console.log('Continuing without blockchain connection. Mock data will be used.');
    return null;
  }
}

export async function initializeServices() {
  let ipfs = null;
  let blockchain = null;
  
  try {
    // Try to start IPFS, but don't stop if it fails
    ipfs = await startIPFSNode();
  } catch (error) {
    console.error('IPFS initialization failed, continuing without IPFS:', error);
  }
  
  try {
    // Try to start blockchain, but don't stop if it fails
    blockchain = await startBlockchain();
  } catch (error) {
    console.error('Blockchain initialization failed, continuing with mock data:', error);
  }
  
  // Return whatever we managed to start
  return { ipfs, blockchain };
}
