// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./IPRegistry.sol";
import "./GDPRCompliance.sol";

/**
 * @title OwnershipManagement
 * @dev Smart contract for managing ownership of IP assets with GDPR compliance
 */
contract OwnershipManagement {
    // Structure for transfer request
    struct TransferRequest {
        bytes32 assetId;
        address from;
        address to;
        uint256 requestDate;
        bool completed;
        bool canceled;
    }
    
    // References to other contracts
    IPRegistry private ipRegistry;
    GDPRCompliance private gdprCompliance;
    
    // Mapping from transfer ID to TransferRequest
    mapping(bytes32 => TransferRequest) private transferRequests;
    
    // Pending transfers for a recipient
    mapping(address => bytes32[]) private pendingReceivedTransfers;
    
    // Events
    event TransferRequested(bytes32 indexed transferId, bytes32 indexed assetId, address indexed from, address to);
    event TransferCompleted(bytes32 indexed transferId, bytes32 indexed assetId, address indexed from, address to);
    event TransferCanceled(bytes32 indexed transferId);
    
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
     * @dev Request transfer of IP asset ownership
     * @param _assetId ID of the asset to transfer
     * @param _to Address of the recipient
     * @return transferId Unique identifier for the transfer request
     */
    function requestTransfer(bytes32 _assetId, address _to) public returns (bytes32 transferId) {
        // Get asset details
        (, address currentOwner, , bool isActive, ) = ipRegistry.getIPAsset(_assetId);
        
        // Checks
        require(currentOwner == msg.sender, "Not the owner of the asset");
        require(isActive, "Asset is not active");
        require(_to != address(0) && _to != msg.sender, "Invalid recipient");
        
        // Generate transfer ID
        transferId = keccak256(abi.encodePacked(_assetId, msg.sender, _to, block.timestamp));
        
        // Create transfer request
        transferRequests[transferId] = TransferRequest({
            assetId: _assetId,
            from: msg.sender,
            to: _to,
            requestDate: block.timestamp,
            completed: false,
            canceled: false
        });
        
        // Add to recipient's pending transfers
        pendingReceivedTransfers[_to].push(transferId);
        
        // Emit event
        emit TransferRequested(transferId, _assetId, msg.sender, _to);
        
        return transferId;
    }
    
    /**
     * @dev Accept and complete a transfer request
     * @param _transferId ID of the transfer to accept
     */
    function acceptTransfer(bytes32 _transferId) public {
        TransferRequest storage request = transferRequests[_transferId];
        
        // Checks
        require(request.requestDate > 0, "Transfer request not found");
        require(request.to == msg.sender, "Not the intended recipient");
        require(!request.completed && !request.canceled, "Transfer already completed or canceled");
        
        // Mark as completed
        request.completed = true;
        
        // Transfer ownership in IP registry
        // This would require the IP Registry to have a transferOwnership function
        // For this example, we're simulating it with events
        
        // Update GDPR compliance
        gdprCompliance.updateDataController(request.assetId, msg.sender);
        
        // Emit event
        emit TransferCompleted(_transferId, request.assetId, request.from, request.to);
    }
    
    /**
     * @dev Cancel a transfer request
     * @param _transferId ID of the transfer to cancel
     */
    function cancelTransfer(bytes32 _transferId) public {
        TransferRequest storage request = transferRequests[_transferId];
        
        // Checks
        require(request.requestDate > 0, "Transfer request not found");
        require(request.from == msg.sender, "Not the sender of the transfer");
        require(!request.completed && !request.canceled, "Transfer already completed or canceled");
        
        // Mark as canceled
        request.canceled = true;
        
        // Emit event
        emit TransferCanceled(_transferId);
    }
    
    /**
     * @dev Get details of a transfer request
     * @param _transferId ID of the transfer to retrieve
     * @return Transfer request details
     */
    function getTransferRequest(bytes32 _transferId) 
        public 
        view 
        returns (
            bytes32 assetId,
            address from,
            address to,
            uint256 requestDate,
            bool completed,
            bool canceled
        ) 
    {
        TransferRequest storage request = transferRequests[_transferId];
        require(request.requestDate > 0, "Transfer request not found");
        
        return (
            request.assetId,
            request.from,
            request.to,
            request.requestDate,
            request.completed,
            request.canceled
        );
    }
    
    /**
     * @dev Get all pending transfer requests for the caller
     * @return Array of transfer IDs
     */
    function getPendingReceivedTransfers() public view returns (bytes32[] memory) {
        bytes32[] memory allTransfers = pendingReceivedTransfers[msg.sender];
        uint256 pendingCount = 0;
        
        // Count pending transfers
        for (uint256 i = 0; i < allTransfers.length; i++) {
            TransferRequest storage request = transferRequests[allTransfers[i]];
            if (!request.completed && !request.canceled) {
                pendingCount++;
            }
        }
        
        // Create result array
        bytes32[] memory result = new bytes32[](pendingCount);
        uint256 resultIndex = 0;
        
        // Fill result array
        for (uint256 i = 0; i < allTransfers.length; i++) {
            TransferRequest storage request = transferRequests[allTransfers[i]];
            if (!request.completed && !request.canceled) {
                result[resultIndex] = allTransfers[i];
                resultIndex++;
            }
        }
        
        return result;
    }
}
