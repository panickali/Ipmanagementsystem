# IP Categorization System

This document details the IP categorization system used in the IP Management Web Application. It explains how intellectual property assets are categorized, stored, and managed within the application.

## Table of Contents

1. [Overview](#overview)
2. [Asset Types](#asset-types)
3. [Categorization Process](#categorization-process)
4. [Metadata Structure](#metadata-structure)
5. [Categorization Algorithm](#categorization-algorithm)
6. [Storage and Retrieval](#storage-and-retrieval)
7. [Integration with Blockchain](#integration-with-blockchain)
8. [Search and Filtering](#search-and-filtering)
9. [Best Practices](#best-practices)

## Overview

The IP categorization system is designed to:

- Organize intellectual property assets by type, category, and tags
- Enable efficient search and retrieval of assets
- Facilitate blockchain integration with appropriate metadata
- Support GDPR compliance through proper data organization
- Provide a consistent structure for assets regardless of storage method

## Asset Types

The system recognizes four primary types of intellectual property:

1. **Copyright** - Original creative works including:
   - Software code
   - Literary works
   - Artistic works
   - Music and audio
   - Video and film
   - Photography

2. **Patent** - Novel inventions and processes including:
   - Utility patents
   - Design patents
   - Plant patents
   - Provisional applications

3. **Trademark** - Brand identifiers including:
   - Word marks
   - Design marks
   - Sound marks
   - Color marks
   - Trade dress

4. **Design** - Ornamental designs including:
   - Industrial designs
   - Graphical user interfaces
   - Product packaging
   - Architectural designs

## Categorization Process

When a user uploads an IP asset, the categorization follows these steps:

1. **User Input**
   - The user provides basic information about the asset
   - Required fields include name, description, and type

2. **Metadata Enrichment**
   - The system extracts additional metadata from the asset
   - File type, size, creation date, and other technical details are added

3. **Content Analysis**
   - For certain file types, content is analyzed to determine characteristics
   - Images are checked for dominant colors, dimensions, etc.
   - Documents are analyzed for length, language, and content type

4. **Categorization**
   - The system assigns categories based on the combination of user input and analysis
   - A confidence score indicates the reliability of the categorization

5. **Storage**
   - Complete metadata record is stored in the database
   - Metadata is also stored with the asset in IPFS
   - Key metadata elements are included in the blockchain record

## Metadata Structure

Each IP asset contains the following metadata structure:

```json
{
  "asset": {
    "name": "Asset Name",
    "description": "Detailed description of the asset",
    "type": "copyright | patent | trademark | design",
    "category": "Primary category",
    "subCategory": "More specific classification",
    "tags": ["tag1", "tag2", "tag3"],
    "createdAt": "ISO timestamp",
    "lastUpdated": "ISO timestamp"
  },
  "technical": {
    "fileType": "mimetype",
    "fileSize": "size in bytes",
    "fileName": "original filename",
    "fileHash": "SHA-256 hash of file"
  },
  "ownership": {
    "creator": "Creator's ID or name",
    "owner": "Current owner's ID or name",
    "contributorsList": ["contributor1", "contributor2"],
    "registrationDate": "ISO timestamp"
  },
  "ipfs": {
    "hash": "IPFS content identifier",
    "gateway": "Gateway URL"
  },
  "blockchain": {
    "registered": true,
    "txHash": "Transaction hash",
    "timestamp": "Block timestamp",
    "contractAddress": "Smart contract address"
  },
  "gdpr": {
    "personalDataIncluded": false,
    "dataSubjects": [],
    "consentStatus": "not_applicable",
    "accessLevel": 0
  },
  "categorization": {
    "confidence": 0.85,
    "method": "user_input | content_analysis | hybrid",
    "contentFeatures": {
      // Content-specific features that vary by asset type
    }
  }
}
```

## Categorization Algorithm

The system uses a multi-stage approach to categorization:

### 1. User-Provided Categorization

User input is given highest priority since the asset owner typically knows the correct classification.

### 2. File Type Analysis

Basic file type detection determines the general category:

- Images → copyright/design
- Documents → copyright/patent
- Audio/Video → copyright
- Source Code → copyright/software

### 3. Content-Based Analysis

For more specific categorization, content analysis is applied:

- **Images**: Analyzed for composition, colors, and content
- **Documents**: Analyzed for structure, formatting, and content type
- **Code**: Language detection and repository structure analysis
- **Audio/Video**: Format, duration, and content analysis

### 4. Hybrid Confidence Score

A confidence score is calculated based on:
- Agreement between user input and automated analysis
- Completeness of metadata
- Quality and specificity of file content
- Similarity to previously categorized assets

## Storage and Retrieval

Categorization data is stored in multiple locations:

1. **Database**
   - Complete metadata with indexes for efficient querying
   - Status and verification information
   - Ownership and transfer history

2. **IPFS**
   - Asset file with attached metadata.json
   - Content addressing ensures integrity
   - Decentralized storage with local caching

3. **Blockchain**
   - Core metadata hash for verification
   - Ownership information
   - Timestamp and registration proof

## Integration with Blockchain

The categorization system integrates with blockchain:

1. **Registration**
   - Core metadata is hashed and stored on-chain
   - Categorization is included in registration transactions

2. **Verification**
   - Blockchain records can verify metadata integrity
   - Changes in categorization can be tracked with new transactions

3. **Smart Contracts**
   - Different contracts handle different IP types
   - Contract selection based on categorization
   - Licensing terms appropriate to the IP type

## Search and Filtering

The categorization system enables powerful search capabilities:

1. **Faceted Search**
   - Filter by IP type, category, tags
   - Filter by ownership status, registration date

2. **Similarity Search**
   - Find assets with similar characteristics
   - Content-based recommendations

3. **Legal Status Search**
   - Filter by verification status
   - Filter by licensing availability

## Best Practices

To maximize the effectiveness of the IP categorization system:

1. **Complete Metadata**
   - Provide detailed information during upload
   - Include clear descriptions and appropriate tags

2. **Consistent Naming**
   - Use consistent naming conventions
   - Apply standardized categorization when possible

3. **Regular Verification**
   - Periodically review categorization
   - Update metadata as IP status changes

4. **Proper File Formats**
   - Use appropriate file formats for each IP type
   - Include high-quality source files when available

5. **GDPR Awareness**
   - Clearly indicate if assets contain personal data
   - Apply appropriate access controls based on content