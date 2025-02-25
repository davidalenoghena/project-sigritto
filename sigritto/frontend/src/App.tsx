import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Navbar from "@/components/Navbar"
import Home from "@/pages/Home"
import HowItWorks from "@/pages/HowItWorks"
// Import other pages as needed

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02]">
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    {/* Add other routes as needed */}
                </Routes>
            </div>
        </Router>
    )
}

export default App

