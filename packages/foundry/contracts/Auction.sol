// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/** 
 * @title Auction
 * @dev Jingcheng
 */
contract Auction {

    // Definition of auction
    address public creator;
    address private chairperson;
    address payable private beneficiary;
    string public description;
    // Service charge ratio (x/10000)
    uint256 public serviceChargeRatio;

    // Auction status
    address public highestBidder;
    uint256 public highestBid;
    
    // Bidders get their returns if not highest
    mapping (address => uint256) public pendingReturns;

    // End status of auction
    uint public auctionEndTime;
    bool ended;
    // simple reentrancy guard
    bool private locked;

    modifier nonReentrant() {
        require(!locked, "ReentrancyGuard: reentrant call");
        locked = true;
        _;
        locked = false;
    }

    constructor(address _creator, address _chairperson, string memory _description, uint256 _serviceChargeRatio, uint biddingTime, address payable beneficiaryAddress) {
        require(_serviceChargeRatio <= 10000, "Service charge ratio cannot exceed 100%");
        creator = _creator;
        chairperson = _chairperson;
        beneficiary = beneficiaryAddress;
        description = _description;
        serviceChargeRatio = _serviceChargeRatio;
        highestBid = 0;
        auctionEndTime = block.timestamp + biddingTime;
        ended = false;
    }

    error NoPermission();
    error AuctionAlreadyEnded();
    error BidNotHighEnough(uint highestBid);
    error AuctionNotYetEnded();
    error AuctionEndAlreadyCalled();
    error TransferFail();
    error NoBidsPlaced();

    event HighestBidIncreased(address bidder, uint256 amount);
    event AuctionEnded(address bidder, uint256 amount);

    // --- Bid ---
    function bid() external payable {
        if(block.timestamp > auctionEndTime) revert AuctionAlreadyEnded();
        if(msg.value <= highestBid) revert BidNotHighEnough(highestBid);
        if(highestBid != 0) pendingReturns[highestBidder] += highestBid;

        highestBid = msg.value;
        highestBidder = msg.sender;
        emit HighestBidIncreased(msg.sender, msg.value);
    }

    // --- Claim Coins ---
    function auctionEnd() external {
        if(block.timestamp < auctionEndTime) revert AuctionNotYetEnded();
        if(ended) revert AuctionEndAlreadyCalled();
        if (highestBid == 0) revert NoBidsPlaced(); 
        ended = true;
        emit AuctionEnded(highestBidder, highestBid);
        uint256 fee = (highestBid * serviceChargeRatio) / 10000;        
        uint256 amountToBeneficiary = highestBid - fee;

        if(fee > 0) {
            (bool sentFee, ) = chairperson.call{value: fee}("");
            if(!sentFee) revert TransferFail();
        }
        (bool sent, ) = beneficiary.call{value: amountToBeneficiary}("");
        if(!sent) revert TransferFail();
    }

    // --- Force End Auction By Chairperson Or Creator ---
    function forceEndAuction() external {
        if((msg.sender != chairperson) && (msg.sender != creator)) revert NoPermission();
        if(block.timestamp >= auctionEndTime) revert AuctionAlreadyEnded();
        auctionEndTime = block.timestamp;
    }

    // --- Return Coins ---
    function claimReturns() external nonReentrant {
        uint256 amount = pendingReturns[msg.sender];
        if(amount == 0) revert();
        pendingReturns[msg.sender] = 0;
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        if(!sent) revert TransferFail();
    }
}