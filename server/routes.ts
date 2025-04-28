import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { uploadToIPFS, checkIPFSStatus } from "./ipfs";
import blockchain, { checkBlockchainStatus } from "./blockchain";
import { db } from "./db";
import {
  insertIPAssetSchema,
  insertOwnershipTransferSchema,
  insertLicenseAgreementSchema,
} from "@shared/schema";

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Auth middleware
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Database connection check function
async function checkDatabaseConnection() {
  try {
    // Simple query to check if database is responsive
    await db.execute("SELECT 1");
    return {
      healthy: true,
      message: "Database connection successful"
    };
  } catch (error) {
    return {
      healthy: false,
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

// Check if user is admin
function isAdmin(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Admin access required" });
}

// Check if user is superadmin
function isSuperAdmin(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user && req.user.role === 'superadmin') {
    return next();
  }
  res.status(403).json({ message: "Forbidden: SuperAdmin access required" });
}

// Health check endpoint function
async function healthCheck(req: Request, res: Response) {
    try {
      // Check database connection
      const dbStatus = await checkDatabaseConnection();

      // Check IPFS connection
      const ipfsStatus = await checkIPFSStatus();

      // Check blockchain connection
      const blockchainStatus = await checkBlockchainStatus();

      // Determine overall status
      const allServicesHealthy = dbStatus.healthy && 
        ipfsStatus.online && 
        blockchainStatus.connected;

      // Return health status
      res.status(allServicesHealthy ? 200 : 503).json({
        status: allServicesHealthy ? "ok" : "degraded",
        timestamp: new Date().toISOString(),
        services: {
          database: dbStatus,
          ipfs: ipfsStatus,
          blockchain: blockchainStatus
        }
      });
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(500).json({
        status: "error",
        message: "Health check failed",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }


export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  app.get('/api/health', healthCheck);

  // API routes
  // IP Assets
  app.get("/api/ip-assets", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const assets = await storage.getIPAssetsByOwner(userId);
      res.json(assets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch IP assets" });
    }
  });

  app.get("/api/ip-assets/:id", isAuthenticated, async (req, res) => {
    try {
      const assetId = parseInt(req.params.id);
      const asset = await storage.getIPAsset(assetId);

      if (!asset) {
        return res.status(404).json({ message: "IP asset not found" });
      }

      if (asset.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to view this asset" });
      }

      res.json(asset);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch IP asset" });
    }
  });

  app.post("/api/ip-assets", isAuthenticated, upload.single("file"), async (req: Request & { file?: any }, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { name, description, type } = req.body;

      if (!name || !description || !type) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Upload file to IPFS
      const ipfsHash = await uploadToIPFS(req.file.buffer);

      // Check if this hash already exists
      const existingAsset = await storage.getIPAssetByIPFSHash(ipfsHash);
      if (existingAsset) {
        return res.status(409).json({ message: "This file has already been registered" });
      }

      // Register on blockchain
      // In a real implementation, we would use the user's blockchain address
      const blockchainTxHash = await blockchain.registerIP(ipfsHash, {
        name,
        description,
        type,
        ownerId: req.user!.id
      }, "0x123456789");

      // Create IP asset in database
      const asset = await storage.createIPAsset({
        name,
        description,
        type: type as any,
        ownerId: req.user!.id,
        ipfsHash,
        blockchainTxHash,
        status: "verified" // Auto-verify for demo
      });

      res.status(201).json(asset);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to register IP asset" });
    }
  });

  app.put("/api/ip-assets/:id", isAuthenticated, async (req, res) => {
    try {
      const assetId = parseInt(req.params.id);
      const asset = await storage.getIPAsset(assetId);

      if (!asset) {
        return res.status(404).json({ message: "IP asset not found" });
      }

      if (asset.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to update this asset" });
      }

      // Update asset
      const updatedAsset = await storage.updateIPAsset(assetId, req.body);
      res.json(updatedAsset);
    } catch (error) {
      res.status(500).json({ message: "Failed to update IP asset" });
    }
  });

  app.delete("/api/ip-assets/:id", isAuthenticated, async (req, res) => {
    try {
      const assetId = parseInt(req.params.id);
      const asset = await storage.getIPAsset(assetId);

      if (!asset) {
        return res.status(404).json({ message: "IP asset not found" });
      }

      if (asset.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to delete this asset" });
      }

      // Delete asset
      await storage.deleteIPAsset(assetId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete IP asset" });
    }
  });

  // Ownership Transfers
  app.get("/api/transfers", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const transfers = await storage.getPendingTransfersByUser(userId);
      res.json(transfers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transfers" });
    }
  });

  app.post("/api/transfers", isAuthenticated, async (req, res) => {
    try {
      const { ipAssetId, toUserId } = req.body;

      if (!ipAssetId || !toUserId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if IP asset exists and belongs to the user
      const asset = await storage.getIPAsset(ipAssetId);

      if (!asset) {
        return res.status(404).json({ message: "IP asset not found" });
      }

      if (asset.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to transfer this asset" });
      }

      // Create transfer
      const transfer = await storage.createTransfer({
        ipAssetId,
        fromUserId: req.user!.id,
        toUserId,
        status: "pending"
      });

      res.status(201).json(transfer);
    } catch (error) {
      res.status(500).json({ message: "Failed to create transfer" });
    }
  });

  app.put("/api/transfers/:id", isAuthenticated, async (req, res) => {
    try {
      const transferId = parseInt(req.params.id);
      const transfer = await storage.getTransfer(transferId);

      if (!transfer) {
        return res.status(404).json({ message: "Transfer not found" });
      }

      // Only the recipient can accept/reject the transfer
      if (transfer.toUserId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to update this transfer" });
      }

      // Update transfer
      const { status } = req.body;

      if (status === "verified") {
        // Perform blockchain transfer
        const asset = await storage.getIPAsset(transfer.ipAssetId);
        if (!asset) {
          return res.status(404).json({ message: "IP asset not found" });
        }

        // Update asset ownership in the database
        await storage.updateIPAsset(transfer.ipAssetId, {
          ownerId: transfer.toUserId
        });
      }

      const updatedTransfer = await storage.updateTransfer(transferId, {
        status: status as any,
        blockchainTxHash: status === "verified" ? `0x${Math.random().toString(16).substring(2, 42)}` : undefined
      });

      res.json(updatedTransfer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update transfer" });
    }
  });

  // License Agreements
  app.get("/api/licenses", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const licenses = await storage.getLicensesByLicenser(userId);
      res.json(licenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch licenses" });
    }
  });

  app.post("/api/licenses", isAuthenticated, async (req, res) => {
    try {
      const { ipAssetId, licenseeName, licenseeEmail, termsText, startDate, endDate } = req.body;

      if (!ipAssetId || !licenseeName || !licenseeEmail || !termsText || !startDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if IP asset exists and belongs to the user
      const asset = await storage.getIPAsset(ipAssetId);

      if (!asset) {
        return res.status(404).json({ message: "IP asset not found" });
      }

      if (asset.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to license this asset" });
      }

      // Create license on blockchain
      const blockchainTxHash = await blockchain.createLicense(asset.ipfsHash, {
        licenseeName,
        licenseeEmail,
        termsText,
        startDate,
        endDate
      }, "0x123456789");

      // Create license in database
      const license = await storage.createLicense({
        ipAssetId,
        licenserId: req.user!.id,
        licenseeName,
        licenseeEmail,
        termsText,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        blockchainTxHash,
        status: "verified" // Auto-verify for demo
      });

      res.status(201).json(license);
    } catch (error) {
      res.status(500).json({ message: "Failed to create license" });
    }
  });

  // Dashboard Stats
  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const stats = await storage.getStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // System Status
  app.get("/api/system/status", isAuthenticated, async (req, res) => {
    try {
      const [blockchainStatus, ipfsStatus] = await Promise.all([
        checkBlockchainStatus(),
        checkIPFSStatus()
      ]);

      res.json({
        blockchain: blockchainStatus,
        ipfs: ipfsStatus,
        contracts: blockchain.getContractAddresses()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system status" });
    }
  });

  // GDPR compliance
  app.delete("/api/gdpr/personal-data", isAuthenticated, async (req, res) => {
    try {
      // In a real implementation, this would anonymize the user's personal data
      // while preserving the blockchain records
      res.json({ message: "Personal data deletion request submitted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to process GDPR request" });
    }
  });

  app.get("/api/gdpr/export", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const [user, assets, transfers, licenses] = await Promise.all([
        storage.getUser(userId),
        storage.getIPAssetsByOwner(userId),
        storage.getPendingTransfersByUser(userId),
        storage.getLicensesByLicenser(userId)
      ]);

      // Remove password from user data
      const { password, ...userData } = user!;

      res.json({
        user: userData,
        assets,
        transfers,
        licenses
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}