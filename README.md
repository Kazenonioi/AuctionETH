
# Decentralized Auction dApp

A fully functional auction smart contract deployed on **Sepolia testnet**, with frontend built using **[Scaffold-ETH 2](https://scaffoldeth.io/)**.

Anyone can create an auction, place bids, get refunds if outbid, and the seller receives the highest bid minus a configurable service fee.

[Live Demo](https://auction-eth-nextjs-git-main-kazenoniois-projects.vercel.app/)  
[Contract on Sepolia](https://sepolia.etherscan.io/address/0x70e9da06559f1f6d5dc5d204d0fdfbe6bcc913a6)

## Features

- **Bidding mechanism** — Higher bids automatically outbid previous ones
- **Refund system** — Previous highest bidders can claim their funds via `claimReturns()`
- **Service fee** — Configurable fee ratio (basis points) deducted from the final winning bid
- **Time-based auction** — Ends after a set duration; chairperson can force early end
- **Reentrancy protection** — Using nonReentrant modifier on claimReturns
- **Custom errors** — Gas-efficient and readable error handling
- **Events** — Emitted for highest bid increases and auction end
- **Frontend** — Real-time UI with Scaffold-ETH 2 (RainbowKit, Wagmi, Viem), showing current bid, bidder, countdown, pending returns, etc.
- **Testing** — Comprehensive Foundry tests including fuzzing, multi-bidder scenarios, time warping, and boundary cases

## Tech Stack

- **Smart Contract** — Solidity
- **Testing** — Foundry (forge test, fuzzing with bound/assume, vm.prank/deal/warp)
- **Frontend** — Scaffold-ETH 2
- **Deployment** — Sepolia testnet (contract), Vercel (frontend)

## How to Run Locally (Under Construction)

### Prerequisites

- Node.js ≥18
- Yarn
- MetaMask (or any wallet) connected to Sepolia testnet (with test ETH from faucet)

### Backend (Smart Contract)

```bash
# Clone repo
git clone https://github.com/Kazenonioii/AuctionETH.git
cd AuctionETH

# Install dependencies (if using Foundry for contract)
forge install

# Run tests
forge test
forge test --gas-report   # Optional: see gas usage

# Deploy to Sepolia (example with Foundry script)
forge script script/DeployAuction.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify


### Frontend

Bash
cd packages/nextjs   # or root if monorepo structure

yarn install
yarn dev             # Start local dev server → http://localhost:3000

```
## Security Considerations

- Reentrancy guard on fund withdrawal
- Checks-Effects-Interactions pattern in bid() and auctionEnd()
- Custom errors for gas efficiency and clarity
- Fee deducted in auctionEnd() with safe low-level call
- Tested for reentrancy attempts, overflow, invalid bids, time boundaries

**Note**: This is a testnet demo project for learning and portfolio purposes. Not audited for production use.

## Future Improvements

- Gasless bidding via EIP-712 Permit signatures
- Multi-round auctions or reserve price
- Frontend countdown timer with real-time block updates
- Event listening for live bid notifications (toast)
- IPFS metadata for auction descriptions/images
