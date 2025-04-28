// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./IPRegistry.sol";
import "./GDPRCompliance.sol";

/**
 * @title Licensing
 * @dev Smart contract for managing IP asset licensing with GDPR compliance
 */
contract Licensing {
    // License types
    enum LicenseType { Exclusive, NonExclusive, SingleUse }
    
    // Structure for license agreement
    struct LicenseAgreement {
        bytes32 assetId;
        address licensor;
        address licensee;
        uint256 startDate;
        uint256 endDate; // 0 means perpetual
        LicenseType licenseType;
        string termsHash; // IPFS hash of the full license terms
        bool isActive;
        uint256 royaltyAmount; // In wei
        uint256 royaltyPaid; // Total royalties paid
    }
    
    // References to other contracts
    IPRegistry private ipRegistry;
    GDPRCompliance private gdprCompliance;
    
    // Mapping from license ID to LicenseAgreement
    mapping(bytes32 => LicenseAgreement) private licenses;
    
    // Licenses issued by a licensor
    mapping(address => bytes32[]) private licensorLicenses;
    
    // Licenses held by a licensee
    mapping(address => bytes32[]) private licenseeLicenses;
    
    // Events
    event LicenseCreated(bytes32 indexed licenseId, bytes32 indexed assetId, address indexed licensor, address licensee);
    event LicenseTerminated(bytes32 indexed licenseId);
    event RoyaltyPaid(bytes32 indexed licenseId, uint256 amount);
    
    /**
     * @dev Constructor to set up related contracts
     * @param _ipRegistry Address of the IP registry contract
     * @param _gdprCompliance Address of the GDPR compliance contract
     */
    constructor(address _ipRegistry, address _gdprCompliance) {
        ipRegistry = IPRegistry(_ipRegistry);
        gdprCompliance = GDPRCompliance(_gdprCompliance);
    }
    
    /**
     * @dev Create a new license agreement
     * @param _assetId ID of the asset to license
     * @param _licensee Address of the licensee
     * @param _startDate Start date of the license
     * @param _endDate End date of the license (0 for perpetual)
     * @param _licenseType Type of license
     * @param _termsHash IPFS hash of the full license terms
     * @param _royaltyAmount Royalty amount in wei
     * @return licenseId Unique identifier for the license
     */
    function createLicense(
        bytes32 _assetId,
        address _licensee,
        uint256 _startDate,
        uint256 _endDate,
        LicenseType _licenseType,
        string memory _termsHash,
        uint256 _royaltyAmount
    ) 
        public 
        returns (bytes32 licenseId) 
    {
        // Get asset details
        (, address owner, , bool isActive, ) = ipRegistry.getIPAsset(_assetId);
        
        // Checks
        require(owner == msg.sender, "Not the owner of the asset");
        require(isActive, "Asset is not active");
        require(_licensee != address(0), "Invalid licensee address");
        require(_startDate >= block.timestamp, "Start date must be in the future");
        require(_endDate == 0 || _endDate > _startDate, "Invalid end date");
        
        // Generate license ID
        licenseId = keccak256(abi.encodePacked(_assetId, msg.sender, _licensee, block.timestamp));
        
        // Create license agreement
        licenses[licenseId] = LicenseAgreement({
            assetId: _assetId,
            licensor: msg.sender,
            licensee: _licensee,
            startDate: _startDate,
            endDate: _endDate,
            licenseType: _licenseType,
            termsHash: _termsHash,
            isActive: true,
            royaltyAmount: _royaltyAmount,
            royaltyPaid: 0
        });
        
        // Add to licensor's and licensee's licenses
        licensorLicenses[msg.sender].push(licenseId);
        licenseeLicenses[_licensee].push(licenseId);
        
        // Register with GDPR compliance
        // This is a data processing relationship
        gdprCompliance.grantRole(_licensee, keccak256("DATA_PROCESSOR"));
        
        // Emit event
        emit LicenseCreated(licenseId, _assetId, msg.sender, _licensee);
        
        return licenseId;
    }
    
    /**
     * @dev Terminate a license agreement
     * @param _licenseId ID of the license to terminate
     */
    function terminateLicense(bytes32 _licenseId) public {
        LicenseAgreement storage license = licenses[_licenseId];
        
        // Checks
        require(license.startDate > 0, "License not found");
        require(license.licensor == msg.sender || license.licensee == msg.sender, "Not authorized");
        require(license.isActive, "License already terminated");
        
        // Terminate license
        license.isActive = false;
        
        // Emit event
        emit LicenseTerminated(_licenseId);
    }
    
    /**
     * @dev Pay royalties for a license
     * @param _licenseId ID of the license
     */
    function payRoyalty(bytes32 _licenseId) public payable {
        LicenseAgreement storage license = licenses[_licenseId];
        
        // Checks
        require(license.startDate > 0, "License not found");
        require(license.isActive, "License not active");
        require(msg.value > 0, "Payment amount must be greater than zero");
        
        // Update royalty paid
        license.royaltyPaid += msg.value;
        
        // Transfer royalty to licensor
        payable(license.licensor).transfer(msg.value);
        
        // Emit event
        emit RoyaltyPaid(_licenseId, msg.value);
    }
    
    /**
     * @dev Get details of a license agreement
     * @param _licenseId ID of the license to retrieve
     * @return License agreement details
     */
    function getLicense(bytes32 _licenseId) 
        public 
        view 
        returns (
            bytes32 assetId,
            address licensor,
            address licensee,
            uint256 startDate,
            uint256 endDate,
            LicenseType licenseType,
            string memory termsHash,
            bool isActive,
            uint256 royaltyAmount,
            uint256 royaltyPaid
        ) 
    {
        LicenseAgreement storage license = licenses[_licenseId];
        require(license.startDate > 0, "License not found");
        
        return (
            license.assetId,
            license.licensor,
            license.licensee,
            license.startDate,
            license.endDate,
            license.licenseType,
            license.termsHash,
            license.isActive,
            license.royaltyAmount,
            license.royaltyPaid
        );
    }
    
    /**
     * @dev Check if a license is valid (active and within date range)
     * @param _licenseId ID of the license to check
     * @return true if the license is valid
     */
    function isLicenseValid(bytes32 _licenseId) public view returns (bool) {
        LicenseAgreement storage license = licenses[_licenseId];
        
        if (license.startDate == 0 || !license.isActive) {
            return false;
        }
        
        if (block.timestamp < license.startDate) {
            return false;
        }
        
        if (license.endDate > 0 && block.timestamp > license.endDate) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Get all licenses issued by a licensor
     * @param _licensor Address of the licensor
     * @return Array of license IDs
     */
    function getLicensorLicenses(address _licensor) public view returns (bytes32[] memory) {
        return licensorLicenses[_licensor];
    }
    
    /**
     * @dev Get all licenses held by a licensee
     * @param _licensee Address of the licensee
     * @return Array of license IDs
     */
    function getLicenseeLicenses(address _licensee) public view returns (bytes32[] memory) {
        return licenseeLicenses[_licensee];
    }
}
