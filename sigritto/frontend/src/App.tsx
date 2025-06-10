import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Home from "@/pages/Home"
import Navbar from "./pages/Navbar"
import HowItWorks from "@/pages/HowItWorks"
import Pricing from "./pages/pricing"
import Dashboard from "./pages/Dashboard"
import CreateWallet from "./pages/CreateWallet"
import WalletDetails from "./pages/WalletDetails"
import RequestWithdrawal from "./pages/RequestWithdrawal"
import TransactionDetails from "./pages/TransactionDetails"

import { SolanaProvider } from "./components/walletConnect";
import { ClusterProvider } from '@/components/cluster/cluster-data-access';
//import { SolanaProvider } from '@/components/solana/solana-provider';
import { ReactQueryProvider } from './react-query-provider';
import { CivicAuthProvider } from "@civic/auth-web3/react";

function App() {
    return (
        <ReactQueryProvider>
            <CivicAuthProvider clientId={import.meta.env.CIVIC_CLIENT_ID}>
                <ClusterProvider>
                    <SolanaProvider>
                            <Router>
                                <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02]">
                                    <Navbar />
                                    <Routes>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/how-it-works" element={<HowItWorks />} />
                                        <Route path="/pricing" element={<Pricing />} />
                                        <Route path="/dashboard" element={<Dashboard />} />
                                        <Route path="/create-wallet" element={<CreateWallet />} />
                                        <Route path="/wallet/:id" element={<WalletDetails />} />
                                        <Route path="/wallet/:id/request" element={<RequestWithdrawal />} />
                                        <Route path="/wallet/:id/transaction/:txId" element={<TransactionDetails />} />
                                        {/* Add other routes as needed */}
                                    </Routes>
                                </div>
                            </Router>
                    </SolanaProvider>
                </ClusterProvider>
            </CivicAuthProvider>
        </ReactQueryProvider>
    )
}

export default App