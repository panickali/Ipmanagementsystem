
import { create } from 'ipfs';
import ganache from 'ganache';
import { ethers } from 'ethers';

// Initialize IPFS node
async function startIPFSNode() {
  try {
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
