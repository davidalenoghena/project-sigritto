# Sigritto

Sigritto is a decentralized, multisignature wallet platform built on the Solana blockchain, designed specifically for teams working collaboratively, such as hackathon participants, freelancers, investment clubs, and decentralized autonomous organizations (DAOs).

## Features
- **Multisig Wallet Creation:** Create shared wallets with customizable approval thresholds for enhanced security.
- **Transaction Requests:** Initiate and approve withdrawal requests with multi-party authorization.
- **Audit Trail & Transparency:** All transactions are recorded on-chain, ensuring full transparency and immutability.

---

## Using the Live Application
You can try Sigritto right now by following these steps:

1. **Visit the live application:**  
   Go to [https://project-sigritto.vercel.app/](https://project-sigritto.vercel.app/)

2. **Connect your wallet:**  
   Use any standard web3 wallet (Phantom, Backpack, etc.) or sign in with your Google account using Civic Auth. If using Phantom, go to settings > Developer Settings and set it to test mode

3. **Get test tokens:**  
   Since the app is currently in dev mode:
   - Visit the Sonic faucet: [https://faucet.sonic.game/#/](https://faucet.sonic.game/#/)
   - Request test tokens to your connected wallet address

4. **Create a multisignature wallet:**  
   - Navigate to the dashboard
   - Set up a new multisig wallet with your desired approval thresholds

5. **Initiate transactions:**  
   - Create withdrawal requests from your multisig wallet
   - Have other signers approve/deny requests
   - Execute approved transactions

---

## Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli) (for localnet/devnet interaction)
- [Anchor CLI](https://book.anchor-lang.com/getting_started/installation.html) (for building/deploying Solana programs)

---

## Getting Started - To Clone Locally

### 1. Clone the Repository
```bash
git clone https://github.com/davidalenoghena/project-sigritto
cd project-sigritto/sigritto
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in `frontend/` with the following (replace with your actual values):
```env
VITE_CIVIC_CLIENT_ID=your-civic-client-id
```
> _Note: Additional environment variables may be required depending on your integration. Check the codebase for any `import.meta.env.VITE_...` usages._

### 4. Run the Frontend Locally
```bash
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal) to view the app.

---

## Solana Program (Anchor)

If you want to build, test, or deploy the Solana smart contract:

### 1. Install Rust & Anchor
- [Install Rust](https://www.rust-lang.org/tools/install)
- [Install Anchor](https://book.anchor-lang.com/getting_started/installation.html)

### 2. Build the Program
```bash
anchor build
```

### 3. (Optional) Test Locally
Start a local validator and deploy the program:
```bash
solana-test-validator
# In a new terminal:
anchor deploy
```

---

## Project Structure
- `sigritto/frontend/` - React frontend (Vite, TailwindCSS, Solana wallet adapters)
- `sigritto/programs/` - Solana smart contract (Rust, Anchor)
- `sigritto/tests/` - Anchor/TypeScript tests for the program

---

## Have fun
