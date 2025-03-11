"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { SparklesCore } from "../components/sparkles"
import { Plus, Wallet, ArrowRight, Clock } from "lucide-react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

// Mock data - would be fetched from your Solana program in production
const mockWallets = [
    {
        id: "wallet1",
        name: "Team Treasury",
        address: "GgE5...",
        balance: 5.75,
        owners: ["Alice", "Bob", "Charlie"],
        threshold: 2,
        pendingTxCount: 1,
    },
    {
        id: "wallet2",
        name: "Project Fund",
        address: "7xF3...",
        balance: 12.3,
        owners: ["Alice", "Dave", "Eve"],
        threshold: 2,
        pendingTxCount: 0,
    },
]

export default function Dashboard() {
    //const [wallets, setWallets] = useState(mockWallets) - Commented this for now because of unused variable setWallets
    const [wallets] = useState(mockWallets)
    const [isConnected, setIsConnected] = useState(false)

    // Mock wallet connection
    const connectWallet = () => {
        setIsConnected(true)
    }

    return (
        <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
            {/* Ambient background with moving particles */}
            <div className="h-full w-full absolute inset-0 z-0">
                <SparklesCore
                    id="tsparticlesfullpage"
                    background="transparent"
                    minSize={0.6}
                    maxSize={1.4}
                    particleDensity={100}
                    className="w-full h-full"
                    particleColor="#FFFFFF"
                />
            </div>

            <div className="relative z-10">

                <div className="container mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Multisig Wallets</h1>
                            <p className="text-gray-400 mt-2">Manage your Solana multisig wallets</p>
                        </div>

                        {!isConnected ? (
                            <></>
                        ) : (
                            <Link to="/create-wallet">
                                <Button className="mt-4 md:mt-0 bg-purple-600 hover:bg-purple-700">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create New Wallet
                                </Button>
                            </Link>
                        )}
                    </div>

                    {!isConnected ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <Wallet className="w-16 h-16 text-purple-500 mb-4" />
                            <h2 className="text-2xl font-semibold text-white mb-2">Connect Your Wallet</h2>
                            <p className="text-gray-400 text-center max-w-md mb-6">
                                Connect your Solana wallet to view and manage your multisig wallets
                            </p>
                            <Button onClick={connectWallet} className="bg-purple-600 hover:bg-purple-700" size="lg">
                                Connect Now
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {wallets.map((wallet) => (
                                <motion.div
                                    key={wallet.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:border-purple-500/50 transition-all">
                                        <CardHeader>
                                            <CardTitle className="text-white flex justify-between items-center">
                                                {wallet.name}
                                                {wallet.pendingTxCount > 0 && (
                                                    <span className="bg-amber-600/20 text-amber-400 text-xs px-2 py-1 rounded-full flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {wallet.pendingTxCount} Pending
                                                    </span>
                                                )}
                                            </CardTitle>
                                            <CardDescription className="text-gray-400 font-mono text-sm">{wallet.address}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Balance:</span>
                                                    <span className="text-white font-medium">{wallet.balance} SOL</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Owners:</span>
                                                    <span className="text-white">{wallet.owners.length}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Threshold:</span>
                                                    <span className="text-white">
                                                        {wallet.threshold} of {wallet.owners.length}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Link to={`/wallet/${wallet.id}`} className="w-full">
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                                                >
                                                    View Details
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}

