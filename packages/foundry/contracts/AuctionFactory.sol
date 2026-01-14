// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "./Auction.sol"; 

/** 
 * @title AuctionFactory
 * @dev Jingcheng
 */
contract AuctionFactory {
    address[] public auctions;
    address public platformOwner;

    event AuctionCreated(address auctionAddress, address creator, string description);

    constructor() {
        platformOwner = msg.sender;
    }

    function createAuction(
        string memory _description,
        uint256 _serviceChargeRatio,
        uint _biddingTime,
        address payable _beneficiary
    ) external {
        Auction newAuction = new Auction(
            msg.sender,
            platformOwner,
            _description, 
            _serviceChargeRatio, 
            _biddingTime, 
            _beneficiary
        );
        auctions.push(address(newAuction));
        emit AuctionCreated(address(newAuction), msg.sender, _description);
    }

    function getAuctions() external view returns (address[] memory) {
        return auctions;
    }
}