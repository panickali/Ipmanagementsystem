import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// IP asset types enum
export const ipAssetTypeEnum = pgEnum("ip_asset_type", [
  "copyright",
  "patent",
  "trademark",
  "design",
]);

// Status enum
export const statusEnum = pgEnum("status", ["pending", "verified", "rejected"]);

// IP assets model
export const ipAssets = pgTable("ip_assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: ipAssetTypeEnum("type").notNull(),
  ownerId: integer("owner_id")
    .references(() => users.id)
    .notNull(),
  ipfsHash: text("ipfs_hash").notNull(),
  blockchainTxHash: text("blockchain_tx_hash"),
  status: statusEnum("status").default("pending").notNull(),
  registrationDate: timestamp("registration_date").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Ownership transfers model
export const ownershipTransfers = pgTable("ownership_transfers", {
  id: serial("id").primaryKey(),
  ipAssetId: integer("ip_asset_id")
    .references(() => ipAssets.id)
    .notNull(),
  fromUserId: integer("from_user_id")
    .references(() => users.id)
    .notNull(),
  toUserId: integer("to_user_id")
    .references(() => users.id)
    .notNull(),
  blockchainTxHash: text("blockchain_tx_hash"),
  status: statusEnum("status").default("pending").notNull(),
  transferDate: timestamp("transfer_date").defaultNow().notNull(),
});

// License agreements model
export const licenseAgreements = pgTable("license_agreements", {
  id: serial("id").primaryKey(),
  ipAssetId: integer("ip_asset_id")
    .references(() => ipAssets.id)
    .notNull(),
  licenserId: integer("licenser_id")
    .references(() => users.id)
    .notNull(),
  licenseeName: text("licensee_name").notNull(),
  licenseeEmail: text("licensee_email").notNull(),
  termsText: text("terms_text").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  blockchainTxHash: text("blockchain_tx_hash"),
  status: statusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
});

export const insertIPAssetSchema = createInsertSchema(ipAssets).pick({
  name: true,
  description: true,
  type: true,
  ownerId: true,
  ipfsHash: true,
  blockchainTxHash: true,
  status: true,
});

export const insertOwnershipTransferSchema = createInsertSchema(ownershipTransfers).pick({
  ipAssetId: true,
  fromUserId: true,
  toUserId: true,
  blockchainTxHash: true,
  status: true,
});

export const insertLicenseAgreementSchema = createInsertSchema(licenseAgreements).pick({
  ipAssetId: true,
  licenserId: true,
  licenseeName: true,
  licenseeEmail: true,
  termsText: true,
  startDate: true,
  endDate: true,
  blockchainTxHash: true,
  status: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type IPAsset = typeof ipAssets.$inferSelect;
export type InsertIPAsset = z.infer<typeof insertIPAssetSchema>;

export type OwnershipTransfer = typeof ownershipTransfers.$inferSelect;
export type InsertOwnershipTransfer = z.infer<typeof insertOwnershipTransferSchema>;

export type LicenseAgreement = typeof licenseAgreements.$inferSelect;
export type InsertLicenseAgreement = z.infer<typeof insertLicenseAgreementSchema>;
