// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./GDPRCompliance.sol";

/**
 * @title IPRegistry
 * @dev Smart contract for registering IP assets on the blockchain with GDPR compliance
 */
contract IPRegistry {
    // Structure for IP asset metadata
    struct IPAsset {
        string ipfsHash;
        address owner;
        uint256 registrationDate;
        bool isActive;
        string assetType; // Copyright, Patent, Trademark, Design
        bytes32 metadataHash; // Hash of additional metadata
    }
    
    // Mapping from asset ID to IPAsset
    mapping(bytes32 => IPAsset) private ipAssets;
    
    // List of all asset IDs for a given owner
    mapping(address => bytes32[]) private ownerAssets;
    
    // GDPR Compliance module
    GDPRCompliance private gdprCompliance;
    
    // Events
    event IPAssetRegistered(bytes32 indexed assetId, string ipfsHash, address indexed owner, string assetType);
    event IPAssetDeactivated(bytes32 indexed assetId);
    event IPAssetReactivated(bytes32 indexed assetId);
    
    /**
     * @dev Constructor to set up the GDPR compliance module
     * @param _gdprCompliance Address of the GDPR compliance contract
     */
    constructor(address _gdprCompliance) {
        gdprCompliance = GDPRCompliance(_gdprCompliance);
    }
    
    /**
     * @dev Register a new IP asset
     * @param _ipfsHash IPFS hash of the IP asset content
     * @param _assetType Type of the IP asset (Copyright, Patent, Trademark, Design)
     * @param _metadataHash Hash of additional metadata
     * @return assetId Unique identifier for the registered asset
     */
    function registerIPAsset(
        string memory _ipfsHash,
        string memory _assetType,
        bytes32 _metadataHash
    ) 
        public 
        returns (bytes32 assetId) 
    {
        // Generate unique asset ID from IPFS hash and sender
        assetId = keccak256(abi.encodePacked(_ipfsHash, msg.sender, block.timestamp));
        
        // Ensure this asset doesn't already exist
        require(ipAssets[assetId].registrationDate == 0, "IP asset already registered");
        
        // Store the IP asset
        ipAssets[assetId] = IPAsset({
            ipfsHash: _ipfsHash,
            owner: msg.sender,
            registrationDate: block.timestamp,
            isActive: true,
            assetType: _assetType,
            metadataHash: _metadataHash
        });
        
        // Add to owner's assets
        ownerAssets[msg.sender].push(assetId);
        
        // Register with GDPR compliance
        gdprCompliance.registerDataSubject(msg.sender, assetId);
        
        // Emit event
        emit IPAssetRegistered(assetId, _ipfsHash, msg.sender, _assetType);
        
        return assetId;
    }
    
    /**
     * @dev Get details of an IP asset
     * @param _assetId ID of the asset to retrieve
     * @return IP asset details (excluding sensitive data)
     */
    function getIPAsset(bytes32 _assetId) 
        public 
        view 
        returns (
            string memory ipfsHash,
            address owner,
            uint256 registrationDate,
            bool isActive,
            string memory assetType
        ) 
    {
        IPAsset storage asset = ipAssets[_assetId];
        require(asset.registrationDate > 0, "IP asset not found");
        
        return (
            asset.ipfsHash,
            asset.owner,
            asset.registrationDate,
            asset.isActive,
            asset.assetType
        );
    }
    
    /**
     * @dev Check if an IP asset exists and is active
     * @param _assetId ID of the asset to check
     * @return true if asset exists and is active
     */
    function isIPAssetActive(bytes32 _assetId) public view returns (bool) {
        return ipAssets[_assetId].isActive;
    }
    
    /**
     * @dev Deactivate an IP asset (for GDPR compliance)
     * @param _assetId ID of the asset to deactivate
     */
    function deactivateIPAsset(bytes32 _assetId) public {
        IPAsset storage asset = ipAssets[_assetId];
        require(asset.registrationDate > 0, "IP asset not found");
        require(asset.owner == msg.sender || gdprCompliance.isDataController(msg.sender), "Not authorized");
        
        asset.isActive = false;
        emit IPAssetDeactivated(_assetId);
    }
    
    /**
     * @dev Reactivate an IP asset
     * @param _assetId ID of the asset to reactivate
     */
    function reactivateIPAsset(bytes32 _assetId) public {
        IPAsset storage asset = ipAssets[_assetId];
        require(asset.registrationDate > 0, "IP asset not found");
        require(asset.owner == msg.sender, "Not authorized");
        
        asset.isActive = true;
        emit IPAssetReactivated(_assetId);
    }
    
    /**
     * @dev Get all asset IDs owned by an address
     * @param _owner Address to check
     * @return Array of asset IDs
     */
    function getAssetsByOwner(address _owner) public view returns (bytes32[] memory) {
        return ownerAssets[_owner];
    }
}
