import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Home from "@/pages/Home"
import Navbar from "./pages/Navbar"
import HowItWorks from "@/pages/HowItWorks"
import Pricing from "./pricing"
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
                    {/* Add other routes as needed */}
                </Routes>
            </div>
        </Router>
    )
}

export default App