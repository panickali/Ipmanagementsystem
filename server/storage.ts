import { users, ipAssets, ownershipTransfers, licenseAgreements } from "@shared/schema";
import type { User, InsertUser, IPAsset, InsertIPAsset, OwnershipTransfer, InsertOwnershipTransfer, LicenseAgreement, InsertLicenseAgreement } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and, desc } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Define SessionStore type since it's not exported from express-session
type SessionStore = ReturnType<typeof createMemoryStore>;

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // IP Asset methods
  getIPAsset(id: number): Promise<IPAsset | undefined>;
  getIPAssetsByOwner(ownerId: number): Promise<IPAsset[]>;
  getIPAssetByIPFSHash(ipfsHash: string): Promise<IPAsset | undefined>;
  createIPAsset(asset: InsertIPAsset): Promise<IPAsset>;
  updateIPAsset(id: number, asset: Partial<IPAsset>): Promise<IPAsset | undefined>;
  deleteIPAsset(id: number): Promise<boolean>;
  
  // Ownership Transfer methods
  getTransfer(id: number): Promise<OwnershipTransfer | undefined>;
  getPendingTransfersByUser(userId: number): Promise<OwnershipTransfer[]>;
  createTransfer(transfer: InsertOwnershipTransfer): Promise<OwnershipTransfer>;
  updateTransfer(id: number, transfer: Partial<OwnershipTransfer>): Promise<OwnershipTransfer | undefined>;
  
  // License Agreement methods
  getLicense(id: number): Promise<LicenseAgreement | undefined>;
  getLicensesByIPAsset(ipAssetId: number): Promise<LicenseAgreement[]>;
  getLicensesByLicenser(licenserId: number): Promise<LicenseAgreement[]>;
  createLicense(license: InsertLicenseAgreement): Promise<LicenseAgreement>;
  updateLicense(id: number, license: Partial<LicenseAgreement>): Promise<LicenseAgreement | undefined>;
  
  // Stats methods
  getStats(userId: number): Promise<{
    totalAssets: number;
    verifiedAssets: number;
    pendingTransfers: number;
    activeLicenses: number;
  }>;
  
  // Session store
  sessionStore: SessionStore;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private ipAssets: Map<number, IPAsset>;
  private ownershipTransfers: Map<number, OwnershipTransfer>;
  private licenseAgreements: Map<number, LicenseAgreement>;
  
  sessionStore: SessionStore;
  
  currentUserId: number;
  currentAssetId: number;
  currentTransferId: number;
  currentLicenseId: number;

  constructor() {
    this.users = new Map();
    this.ipAssets = new Map();
    this.ownershipTransfers = new Map();
    this.licenseAgreements = new Map();
    
    this.currentUserId = 1;
    this.currentAssetId = 1;
    this.currentTransferId = 1;
    this.currentLicenseId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      role: insertUser.role || "user",
      isHighPriority: insertUser.isHighPriority || false,
      canVerifyAssets: insertUser.canVerifyAssets || false,
      canManageUsers: insertUser.canManageUsers || false,
      canApproveTransfers: insertUser.canApproveTransfers || false,
      canEditAccessRights: insertUser.canEditAccessRights || false,
      gdprAccessLevel: insertUser.gdprAccessLevel || 0,
      lastLogin: null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser: User = { 
      ...existingUser, 
      ...userData
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // IP Asset methods
  async getIPAsset(id: number): Promise<IPAsset | undefined> {
    return this.ipAssets.get(id);
  }
  
  async getIPAssetsByOwner(ownerId: number): Promise<IPAsset[]> {
    return Array.from(this.ipAssets.values()).filter(
      (asset) => asset.ownerId === ownerId
    );
  }
  
  async getIPAssetByIPFSHash(ipfsHash: string): Promise<IPAsset | undefined> {
    return Array.from(this.ipAssets.values()).find(
      (asset) => asset.ipfsHash === ipfsHash
    );
  }
  
  async createIPAsset(asset: InsertIPAsset): Promise<IPAsset> {
    const id = this.currentAssetId++;
    const registrationDate = new Date();
    const lastUpdated = new Date();
    const newAsset: IPAsset = { 
      ...asset, 
      id, 
      registrationDate, 
      lastUpdated,
      status: asset.status || "pending",
      blockchainTxHash: asset.blockchainTxHash || null
    };
    this.ipAssets.set(id, newAsset);
    return newAsset;
  }
  
  async updateIPAsset(id: number, asset: Partial<IPAsset>): Promise<IPAsset | undefined> {
    const existingAsset = this.ipAssets.get(id);
    if (!existingAsset) return undefined;
    
    const updatedAsset: IPAsset = { 
      ...existingAsset, 
      ...asset, 
      lastUpdated: new Date() 
    };
    this.ipAssets.set(id, updatedAsset);
    return updatedAsset;
  }
  
  async deleteIPAsset(id: number): Promise<boolean> {
    return this.ipAssets.delete(id);
  }
  
  // Ownership Transfer methods
  async getTransfer(id: number): Promise<OwnershipTransfer | undefined> {
    return this.ownershipTransfers.get(id);
  }
  
  async getPendingTransfersByUser(userId: number): Promise<OwnershipTransfer[]> {
    return Array.from(this.ownershipTransfers.values()).filter(
      (transfer) => 
        (transfer.toUserId === userId || transfer.fromUserId === userId) && 
        transfer.status === "pending"
    );
  }
  
  async createTransfer(transfer: InsertOwnershipTransfer): Promise<OwnershipTransfer> {
    const id = this.currentTransferId++;
    const transferDate = new Date();
    const newTransfer: OwnershipTransfer = { 
      ...transfer, 
      id, 
      transferDate,
      status: transfer.status || "pending",
      blockchainTxHash: transfer.blockchainTxHash || null
    };
    this.ownershipTransfers.set(id, newTransfer);
    return newTransfer;
  }
  
  async updateTransfer(id: number, transfer: Partial<OwnershipTransfer>): Promise<OwnershipTransfer | undefined> {
    const existingTransfer = this.ownershipTransfers.get(id);
    if (!existingTransfer) return undefined;
    
    const updatedTransfer: OwnershipTransfer = { 
      ...existingTransfer, 
      ...transfer 
    };
    this.ownershipTransfers.set(id, updatedTransfer);
    return updatedTransfer;
  }
  
  // License Agreement methods
  async getLicense(id: number): Promise<LicenseAgreement | undefined> {
    return this.licenseAgreements.get(id);
  }
  
  async getLicensesByIPAsset(ipAssetId: number): Promise<LicenseAgreement[]> {
    return Array.from(this.licenseAgreements.values()).filter(
      (license) => license.ipAssetId === ipAssetId
    );
  }
  
  async getLicensesByLicenser(licenserId: number): Promise<LicenseAgreement[]> {
    return Array.from(this.licenseAgreements.values()).filter(
      (license) => license.licenserId === licenserId
    );
  }
  
  async createLicense(license: InsertLicenseAgreement): Promise<LicenseAgreement> {
    const id = this.currentLicenseId++;
    const createdAt = new Date();
    const newLicense: LicenseAgreement = { ...license, id, createdAt };
    this.licenseAgreements.set(id, newLicense);
    return newLicense;
  }
  
  async updateLicense(id: number, license: Partial<LicenseAgreement>): Promise<LicenseAgreement | undefined> {
    const existingLicense = this.licenseAgreements.get(id);
    if (!existingLicense) return undefined;
    
    const updatedLicense: LicenseAgreement = { 
      ...existingLicense, 
      ...license 
    };
    this.licenseAgreements.set(id, updatedLicense);
    return updatedLicense;
  }
  
  // Stats methods
  async getStats(userId: number): Promise<{
    totalAssets: number;
    verifiedAssets: number;
    pendingTransfers: number;
    activeLicenses: number;
  }> {
    const userAssets = await this.getIPAssetsByOwner(userId);
    const totalAssets = userAssets.length;
    const verifiedAssets = userAssets.filter(asset => asset.status === "verified").length;
    
    const pendingTransfers = (await this.getPendingTransfersByUser(userId)).length;
    
    const now = new Date();
    const activeLicenses = (await this.getLicensesByLicenser(userId))
      .filter(license => 
        license.status === "verified" && 
        (!license.endDate || license.endDate > now)
      ).length;
    
    return {
      totalAssets,
      verifiedAssets,
      pendingTransfers,
      activeLicenses
    };
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true 
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  // IP Asset methods
  async getIPAsset(id: number): Promise<IPAsset | undefined> {
    const [asset] = await db.select().from(ipAssets).where(eq(ipAssets.id, id));
    return asset;
  }
  
  async getIPAssetsByOwner(ownerId: number): Promise<IPAsset[]> {
    return await db.select().from(ipAssets).where(eq(ipAssets.ownerId, ownerId));
  }
  
  async getIPAssetByIPFSHash(ipfsHash: string): Promise<IPAsset | undefined> {
    const [asset] = await db.select().from(ipAssets).where(eq(ipAssets.ipfsHash, ipfsHash));
    return asset;
  }
  
  async createIPAsset(asset: InsertIPAsset): Promise<IPAsset> {
    const now = new Date();
    const [newAsset] = await db
      .insert(ipAssets)
      .values({
        ...asset,
        registrationDate: now,
        lastUpdated: now
      })
      .returning();
    return newAsset;
  }
  
  async updateIPAsset(id: number, asset: Partial<IPAsset>): Promise<IPAsset | undefined> {
    const [updatedAsset] = await db
      .update(ipAssets)
      .set({
        ...asset,
        lastUpdated: new Date()
      })
      .where(eq(ipAssets.id, id))
      .returning();
    return updatedAsset;
  }
  
  async deleteIPAsset(id: number): Promise<boolean> {
    const [deletedAsset] = await db
      .delete(ipAssets)
      .where(eq(ipAssets.id, id))
      .returning();
    return !!deletedAsset;
  }
  
  // Ownership Transfer methods
  async getTransfer(id: number): Promise<OwnershipTransfer | undefined> {
    const [transfer] = await db.select().from(ownershipTransfers).where(eq(ownershipTransfers.id, id));
    return transfer;
  }
  
  async getPendingTransfersByUser(userId: number): Promise<OwnershipTransfer[]> {
    return await db
      .select()
      .from(ownershipTransfers)
      .where(
        and(
          eq(ownershipTransfers.status, "pending"),
          eq(ownershipTransfers.toUserId, userId)
        )
      );
  }
  
  async createTransfer(transfer: InsertOwnershipTransfer): Promise<OwnershipTransfer> {
    const [newTransfer] = await db
      .insert(ownershipTransfers)
      .values({
        ...transfer,
        transferDate: new Date()
      })
      .returning();
    return newTransfer;
  }
  
  async updateTransfer(id: number, transfer: Partial<OwnershipTransfer>): Promise<OwnershipTransfer | undefined> {
    const [updatedTransfer] = await db
      .update(ownershipTransfers)
      .set(transfer)
      .where(eq(ownershipTransfers.id, id))
      .returning();
    return updatedTransfer;
  }
  
  // License Agreement methods
  async getLicense(id: number): Promise<LicenseAgreement | undefined> {
    const [license] = await db.select().from(licenseAgreements).where(eq(licenseAgreements.id, id));
    return license;
  }
  
  async getLicensesByIPAsset(ipAssetId: number): Promise<LicenseAgreement[]> {
    return await db.select().from(licenseAgreements).where(eq(licenseAgreements.ipAssetId, ipAssetId));
  }
  
  async getLicensesByLicenser(licenserId: number): Promise<LicenseAgreement[]> {
    return await db.select().from(licenseAgreements).where(eq(licenseAgreements.licenserId, licenserId));
  }
  
  async createLicense(license: InsertLicenseAgreement): Promise<LicenseAgreement> {
    const [newLicense] = await db
      .insert(licenseAgreements)
      .values({
        ...license,
        createdAt: new Date()
      })
      .returning();
    return newLicense;
  }
  
  async updateLicense(id: number, license: Partial<LicenseAgreement>): Promise<LicenseAgreement | undefined> {
    const [updatedLicense] = await db
      .update(licenseAgreements)
      .set(license)
      .where(eq(licenseAgreements.id, id))
      .returning();
    return updatedLicense;
  }
  
  // Stats methods
  async getStats(userId: number): Promise<{
    totalAssets: number;
    verifiedAssets: number;
    pendingTransfers: number;
    activeLicenses: number;
  }> {
    // Total assets
    const userAssets = await this.getIPAssetsByOwner(userId);
    const totalAssets = userAssets.length;
    
    // Verified assets
    const verifiedAssets = userAssets.filter(asset => asset.status === "verified").length;
    
    // Pending transfers
    const pendingTransfers = await db
      .select()
      .from(ownershipTransfers)
      .where(
        and(
          eq(ownershipTransfers.status, "pending"),
          eq(ownershipTransfers.toUserId, userId)
        )
      )
      .then(results => results.length);
    
    // Active licenses
    const now = new Date();
    const userLicenses = await this.getLicensesByLicenser(userId);
    const activeLicenses = userLicenses.filter(license => 
      license.status === "verified" && 
      (!license.endDate || license.endDate > now)
    ).length;
    
    return {
      totalAssets,
      verifiedAssets,
      pendingTransfers,
      activeLicenses
    };
  }
}

// Use database storage
export const storage = new DatabaseStorage();
