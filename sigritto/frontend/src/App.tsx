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
// Import other pages as needed

function App() {
    return (
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
    )
}

export default App