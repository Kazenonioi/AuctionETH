// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "forge-std/Test.sol";
import "../contracts/Auction.sol";

/** 
 * @title AuctionTest
 * @dev Jingcheng
 */
contract AuctionTest is Test {
    Auction auction;
    address payable beneficiary = payable(makeAddr("beneficiary"));

    function setUp() public {
        vm.deal(beneficiary, 0);
        vm.deal(address(this), 0);
        auction = new Auction(
            address(this),
            address(this), 
            "High frequency auction",
            100,
            1 days,
            beneficiary
        );
    }

    // --- Basic MultiBidder Test ---
    function testMultipleBidders() public {
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);

        vm.prank(alice); 
        auction.bid{value: 1 ether}();
        assertEq(auction.highestBidder(), alice);

        vm.prank(bob);   
        auction.bid{value: 2 ether}();
        assertEq(auction.highestBidder(), bob);

        vm.prank(alice);
        auction.claimReturns();
        assertEq(alice.balance, 10 ether); 

        vm.warp(block.timestamp + 2 days + 1 seconds);
        (bool success, ) = address(auction).call(abi.encodeWithSignature("auctionEnd()"));
        assertTrue(beneficiary.balance != 0);
        assertTrue(address(this).balance != 0);
        console.log(beneficiary.balance);
        console.log(address(this).balance);
    }

    // --- Fuzz Test ---
    function testFuzz_Bidding(address bidder, uint256 amount) public {
        vm.assume(bidder != address(0));
        vm.assume(bidder != address(auction));
        
        amount = bound(amount, 1, 1_000_000 ether);

        uint256 currentHighest = auction.highestBid();

        vm.deal(bidder, amount);

        if (amount > currentHighest) {
            vm.prank(bidder);
            auction.bid{value: amount}();
            assertEq(auction.highestBidder(), bidder);
            assertEq(auction.highestBid(), amount);
        } else {
            vm.prank(bidder);
            vm.expectRevert(); // Expect Revert Next Line
            auction.bid{value: amount}();
        }
    }

    // --- Massive Sequential Test ---
    function testMassiveSequentialBidding() public {
        for (uint160 i = 1; i < 100; i++) {
            address user = address(i); 
            uint256 bidAmount = i * 1 ether;

            vm.deal(user, bidAmount);
            
            vm.prank(user);
            auction.bid{value: bidAmount}();

            assertEq(auction.highestBidder(), user);
            console.log("Bidder", i, "successfully bid", bidAmount);
        }
    }

    // --- End Test ---
    function testAuctionEnd() public {
        bool isAuctionEnded = (block.timestamp >= auction.auctionEndTime());
        assertFalse(isAuctionEnded, "Should not be ended yet");

        (bool successBefore, ) = address(auction).call(abi.encodeWithSignature("auctionEnd()"));
        assertFalse(successBefore, "Auction should not end before time");

        address alice = makeAddr("alice");
        vm.deal(alice, 10 ether);
        vm.prank(alice);
        auction.bid{value: 2 ether}();

        vm.warp(block.timestamp + 2 days + 1 seconds);

        (bool successAfter, ) = address(auction).call(abi.encodeWithSignature("auctionEnd()"));
        assertTrue(successAfter, "Auction should end successfully after time");
    }

    receive() external payable {}
}