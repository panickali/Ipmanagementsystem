// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title GDPRCompliance
 * @dev Smart contract for handling GDPR compliance in blockchain applications
 */
contract GDPRCompliance {
    // Roles
    bytes32 public constant DATA_CONTROLLER_ROLE = keccak256("DATA_CONTROLLER");
    bytes32 public constant DATA_PROCESSOR_ROLE = keccak256("DATA_PROCESSOR");
    
    // Mapping for roles
    mapping(address => mapping(bytes32 => bool)) private roles;
    
    // Mapping from data subject to their assets
    mapping(address => bytes32[]) private subjectAssets;
    
    // Mapping from asset ID to its controller
    mapping(bytes32 => address) private assetControllers;
    
    // Mapping for logical deletion
    mapping(bytes32 => bool) private logicallyDeleted;
    
    // Events
    event DataSubjectRegistered(address indexed subject, bytes32 indexed assetId);
    event DataControllerChanged(bytes32 indexed assetId, address indexed oldController, address indexed newController);
    event LogicalDeletionPerformed(bytes32 indexed assetId);
    event LogicalDeletionReverted(bytes32 indexed assetId);
    
    /**
     * @dev Constructor assigns admin role to deployer
     */
    constructor() {
        // The deployer is the initial data controller
        roles[msg.sender][DATA_CONTROLLER_ROLE] = true;
    }
    
    /**
     * @dev Modifier to restrict function to data controllers
     */
    modifier onlyDataController() {
        require(isDataController(msg.sender), "Caller is not a data controller");
        _;
    }
    
    /**
     * @dev Grant a role to an address
     * @param _account Address to grant role to
     * @param _role Role to grant
     */
    function grantRole(address _account, bytes32 _role) public onlyDataController {
        roles[_account][_role] = true;
    }
    
    /**
     * @dev Revoke a role from an address
     * @param _account Address to revoke role from
     * @param _role Role to revoke
     */
    function revokeRole(address _account, bytes32 _role) public onlyDataController {
        roles[_account][_role] = false;
    }
    
    /**
     * @dev Check if an address has a specific role
     * @param _account Address to check
     * @param _role Role to check
     * @return true if the address has the role
     */
    function hasRole(address _account, bytes32 _role) public view returns (bool) {
        return roles[_account][_role];
    }
    
    /**
     * @dev Check if an address is a data controller
     * @param _account Address to check
     * @return true if the address is a data controller
     */
    function isDataController(address _account) public view returns (bool) {
        return hasRole(_account, DATA_CONTROLLER_ROLE);
    }
    
    /**
     * @dev Check if an address is a data processor
     * @param _account Address to check
     * @return true if the address is a data processor
     */
    function isDataProcessor(address _account) public view returns (bool) {
        return hasRole(_account, DATA_PROCESSOR_ROLE);
    }
    
    /**
     * @dev Register a data subject for an asset
     * @param _subject Address of the data subject
     * @param _assetId ID of the asset
     */
    function registerDataSubject(address _subject, bytes32 _assetId) public {
        // The initial caller of this function should be the IP Registry contract
        // In a real implementation, we would add access control
        
        // Register the asset for the subject
        subjectAssets[_subject].push(_assetId);
        
        // Set the subject as the initial controller
        assetControllers[_assetId] = _subject;
        
        // Emit event
        emit DataSubjectRegistered(_subject, _assetId);
    }
    
    /**
     * @dev Update the data controller for an asset
     * @param _assetId ID of the asset
     * @param _newController Address of the new controller
     */
    function updateDataController(bytes32 _assetId, address _newController) public {
        address currentController = assetControllers[_assetId];
        
        // Only the current controller or another data controller can update
        require(
            msg.sender == currentController || isDataController(msg.sender), 
            "Not authorized"
        );
        
        // Update controller
        address oldController = assetControllers[_assetId];
        assetControllers[_assetId] = _newController;
        
        // Emit event
        emit DataControllerChanged(_assetId, oldController, _newController);
    }
    
    /**
     * @dev Perform logical deletion of an asset (right to be forgotten)
     * @param _assetId ID of the asset to logically delete
     */
    function performLogicalDeletion(bytes32 _assetId) public {
        address controller = assetControllers[_assetId];
        
        // Only the data subject or a data controller can request deletion
        require(
            msg.sender == controller || isDataController(msg.sender), 
            "Not authorized"
        );
        
        // Mark as logically deleted
        logicallyDeleted[_assetId] = true;
        
        // Emit event
        emit LogicalDeletionPerformed(_assetId);
    }
    
    /**
     * @dev Revert logical deletion (for authorized parties)
     * @param _assetId ID of the asset to revert logical deletion
     */
    function revertLogicalDeletion(bytes32 _assetId) public onlyDataController {
        // Only a data controller can revert logical deletion
        
        // Revert logical deletion
        logicallyDeleted[_assetId] = false;
        
        // Emit event
        emit LogicalDeletionReverted(_assetId);
    }
    
    /**
     * @dev Check if an asset is logically deleted
     * @param _assetId ID of the asset to check
     * @return true if the asset is logically deleted
     */
    function isLogicallyDeleted(bytes32 _assetId) public view returns (bool) {
        return logicallyDeleted[_assetId];
    }
    
    /**
     * @dev Get all assets associated with a data subject
     * @param _subject Address of the data subject
     * @return Array of asset IDs
     */
    function getSubjectAssets(address _subject) public view returns (bytes32[] memory) {
        return subjectAssets[_subject];
    }
    
    /**
     * @dev Get the data controller for an asset
     * @param _assetId ID of the asset
     * @return Address of the data controller
     */
    function getAssetController(bytes32 _assetId) public view returns (address) {
        return assetControllers[_assetId];
    }
}
