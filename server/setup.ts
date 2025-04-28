
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
      fs.unlinkSync(repoLockPath);
    }
  } catch (err) {
    console.warn('Error cleaning up IPFS lock:', err);
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
  try {
    const server = ganache.server({
      wallet: {
        deterministic: true,
        totalAccounts: 10
      },
      logging: {
        quiet: false
      }
    });
    
    await server.listen(8545);
    console.log('Ganache blockchain started on port 8545');
    
    // Get default accounts
    const provider = new ethers.JsonRpcProvider('http://0.0.0.0:8545');
    const accounts = await provider.listAccounts();
    console.log('Available accounts:', accounts);
    
    return server;
  } catch (error) {
    console.error('Failed to start blockchain:', error);
    throw error;
  }
}

export async function initializeServices() {
  const ipfs = await startIPFSNode();
  const blockchain = await startBlockchain();
  return { ipfs, blockchain };
}
