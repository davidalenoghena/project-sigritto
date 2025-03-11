"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { SparklesCore } from "../components/sparkles"
//import Navbar from "../components/navbar"
import { ArrowLeft, Copy, ExternalLink, Plus } from "lucide-react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { Progress } from "../components/ui/progress"

// Mock data - would be fetched from your Solana program in production
const mockWalletData = {
    wallet1: {
        id: "wallet1",
        name: "Team Treasury",
        address: "GgE5bqTEXcsGRHJjrKnpcHbJR2ULMqfLiYwPkgSfcEo1",
        balance: 5.75,
        owners: [
            { address: "8xF3hPFYbkmpPVKr87ntjuUxPTPayY6qLJHLM4YCyUMd", label: "Alice" },
            { address: "7YHZ3rfpGzLEFYmxrxCU1Qpde2wHUBQJYnfPmkwmWMNB", label: "Bob" },
            { address: "3zQ9CtDkTx4PQgHsrNcNJfNzPAM1VeXzh6JfyAYPwqMT", label: "Charlie" },
        ],
        threshold: 2,
        pendingTransactions: [
            {
                id: "tx1",
                amount: 1.2,
                recipient: "DRvsYJQYG3HsPCpw7GXdQrNpV7QXTWrTMXEwMGvxYKPv",
                description: "Marketing expenses",
                requester: "Alice",
                requestedAt: "2025-03-09T15:30:00Z",
                approvals: ["Alice"],
                status: "pending",
            },
        ],
        completedTransactions: [
            {
                id: "tx2",
                amount: 0.5,
                recipient: "6YHZ3rfpGzLEFYmxrxCU1Qpde2wHUBQJYnfPmkwmWMNB",
                description: "Design work",
                requester: "Bob",
                requestedAt: "2025-03-05T10:15:00Z",
                completedAt: "2025-03-05T14:22:00Z",
                approvals: ["Bob", "Charlie"],
                status: "completed",
            },
            {
                id: "tx3",
                amount: 0.3,
                recipient: "9xF3hPFYbkmpPVKr87ntjuUxPTPayY6qLJHLM4YCyUMd",
                description: "Server costs",
                requester: "Charlie",
                requestedAt: "2025-03-01T08:45:00Z",
                completedAt: "2025-03-01T12:30:00Z",
                approvals: ["Charlie", "Alice"],
                status: "completed",
            },
        ],
    },
    wallet2: {
        id: "wallet2",
        name: "Project Fund",
        address: "7xF3hPFYbkmpPVKr87ntjuUxPTPayY6qLJHLM4YCyUMd",
        balance: 12.3,
        owners: [
            { address: "8xF3hPFYbkmpPVKr87ntjuUxPTPayY6qLJHLM4YCyUMd", label: "Alice" },
            { address: "5YHZ3rfpGzLEFYmxrxCU1Qpde2wHUBQJYnfPmkwmWMNB", label: "Dave" },
            { address: "2zQ9CtDkTx4PQgHsrNcNJfNzPAM1VeXzh6JfyAYPwqMT", label: "Eve" },
        ],
        threshold: 2,
        pendingTransactions: [],
        completedTransactions: [
            {
                id: "tx4",
                amount: 1.0,
                recipient: "4YHZ3rfpGzLEFYmxrxCU1Qpde2wHUBQJYnfPmkwmWMNB",
                description: "Development milestone",
                requester: "Dave",
                requestedAt: "2025-03-07T09:20:00Z",
                completedAt: "2025-03-07T16:45:00Z",
                approvals: ["Dave", "Alice"],
                status: "completed",
            },
        ],
    },
}

export default function WalletDetails() {
    const params = useParams()
    const navigate = useNavigate()
    const walletId = params.id
    const [wallet, setWallet] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    //const [activeTab, setActiveTab] = useState("overview") Commented this for now because of unused variable activeTab
    const [activeTab, setActiveTab] = useState("overview")

    useEffect(() => {
        // Mock API call to fetch wallet data
        const fetchWallet = async () => {
            try {
                // Simulate API delay
                await new Promise((resolve) => setTimeout(resolve, 500))

                const walletData = mockWalletData[walletId as keyof typeof mockWalletData]
                if (!walletData) {
                    navigate("/dashboard")
                    return
                }

                setWallet(walletData)
            } catch (error) {
                console.error("Error fetching wallet:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchWallet()
    }, [walletId, navigate])

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        // You could add a toast notification here
    }

    const getInitials = (name: string) => {
        return name.charAt(0).toUpperCase()
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
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
                    <div className="container mx-auto px-6 py-20 flex items-center justify-center">
                        <div className="text-white">Loading wallet details...</div>
                    </div>
                </div>
            </main>
        )
    }

    if (!wallet) {
        return null // Router will redirect
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
                    <Link to="/dashboard" className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-white">{wallet.name}</h1>
                            <div className="flex items-center mt-2">
                                <p className="text-gray-400 font-mono text-sm mr-2">{wallet.address}</p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-gray-400 hover:text-white"
                                    onClick={() => copyToClipboard(wallet.address)}
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-gray-400 hover:text-white"
                                    onClick={() => window.open(`https://explorer.solana.com/address/${wallet.address}`, "_blank")}
                                >
                                    <ExternalLink className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-white text-lg">Balance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-white">{wallet.balance} SOL</div>
                                    <div className="text-gray-400 text-sm mt-1">≈ ${(wallet.balance * 150).toFixed(2)} USD</div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-white text-lg">Owners</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-white">{wallet.owners.length}</div>
                                    <div className="text-gray-400 text-sm mt-1">Threshold: {wallet.threshold} signatures</div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-white text-lg">Pending Transactions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-white">{wallet.pendingTransactions.length}</div>
                                    <div className="text-gray-400 text-sm mt-1">
                                        {wallet.pendingTransactions.length === 0 ? "No pending approvals" : "Waiting for approval"}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
                            <TabsList className="bg-gray-900/50 border-gray-800">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                                <TabsTrigger value="owners">Owners</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="mt-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="text-white">Pending Approvals</CardTitle>
                                                <Link to={`/wallet/${walletId}/request`}>
                                                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                                        <Plus className="mr-1 h-4 w-4" />
                                                        New Request
                                                    </Button>
                                                </Link>
                                            </div>
                                            <CardDescription className="text-gray-400">Transactions waiting for approval</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {wallet.pendingTransactions.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <p className="text-gray-400">No pending transactions</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {wallet.pendingTransactions.map((tx: any) => (
                                                        <div key={tx.id} className="border border-gray-800 rounded-lg p-4">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <h3 className="text-white font-medium">{tx.description}</h3>
                                                                    <p className="text-sm text-gray-400">
                                                                        Requested by {tx.requester} on {formatDate(tx.requestedAt)}
                                                                    </p>
                                                                </div>
                                                                <Badge variant="outline" className="bg-amber-600/20 text-amber-400 border-amber-500/20">
                                                                    Pending
                                                                </Badge>
                                                            </div>
                                                            <div className="flex justify-between items-center mb-3">
                                                                <div className="text-white font-medium">{tx.amount} SOL</div>
                                                                <div className="text-sm font-mono text-gray-400 truncate max-w-[200px]">
                                                                    To: {tx.recipient}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-400">Approvals:</span>
                                                                    <span className="text-white">
                                                                        {tx.approvals.length} of {wallet.threshold}
                                                                    </span>
                                                                </div>
                                                                <Progress
                                                                    value={(tx.approvals.length / wallet.threshold) * 100}
                                                                    className="h-2 bg-gray-800"
                                                                />
                                                                <div className="flex items-center space-x-2 mt-2">
                                                                    {tx.approvals.map((approver: string) => (
                                                                        <Avatar key={approver} className="h-6 w-6">
                                                                            <AvatarFallback className="bg-purple-600 text-xs">
                                                                                {getInitials(approver)}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="mt-4 flex space-x-2">
                                                                <Button
                                                                    className="w-full bg-purple-600 hover:bg-purple-700"
                                                                    size="sm"
                                                                    onClick={() => navigate(`/wallet/${walletId}/transaction/${tx.id}`)}
                                                                >
                                                                    View Details
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                                        <CardHeader>
                                            <CardTitle className="text-white">Recent Activity</CardTitle>
                                            <CardDescription className="text-gray-400">Recently completed transactions</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {wallet.completedTransactions.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <p className="text-gray-400">No completed transactions</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {wallet.completedTransactions.slice(0, 3).map((tx: any) => (
                                                        <div key={tx.id} className="border border-gray-800 rounded-lg p-4">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <h3 className="text-white font-medium">{tx.description}</h3>
                                                                    <p className="text-sm text-gray-400">Completed on {formatDate(tx.completedAt)}</p>
                                                                </div>
                                                                <Badge variant="outline" className="bg-green-600/20 text-green-400 border-green-500/20">
                                                                    Completed
                                                                </Badge>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <div className="text-white font-medium">{tx.amount} SOL</div>
                                                                <div className="text-sm font-mono text-gray-400 truncate max-w-[200px]">
                                                                    To: {tx.recipient}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="transactions" className="mt-6">
                                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-white">All Transactions</CardTitle>
                                            <Link to={`/wallet/${walletId}/request`}>
                                                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                                    <Plus className="mr-1 h-4 w-4" />
                                                    New Request
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {[...wallet.pendingTransactions, ...wallet.completedTransactions].length === 0 ? (
                                                <div className="text-center py-8">
                                                    <p className="text-gray-400">No transactions found</p>
                                                </div>
                                            ) : (
                                                [...wallet.pendingTransactions, ...wallet.completedTransactions]
                                                    .sort((a: any, b: any) => {
                                                        const dateA = new Date(a.completedAt || a.requestedAt)
                                                        const dateB = new Date(b.completedAt || b.requestedAt)
                                                        return dateB.getTime() - dateA.getTime()
                                                    })
                                                    .map((tx: any) => (
                                                        <div key={tx.id} className="border border-gray-800 rounded-lg p-4">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <h3 className="text-white font-medium">{tx.description}</h3>
                                                                    <p className="text-sm text-gray-400">
                                                                        {tx.status === "completed"
                                                                            ? `Completed on ${formatDate(tx.completedAt)}`
                                                                            : `Requested by ${tx.requester} on ${formatDate(tx.requestedAt)}`}
                                                                    </p>
                                                                </div>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={
                                                                        tx.status === "completed"
                                                                            ? "bg-green-600/20 text-green-400 border-green-500/20"
                                                                            : "bg-amber-600/20 text-amber-400 border-amber-500/20"
                                                                    }
                                                                >
                                                                    {tx.status === "completed" ? "Completed" : "Pending"}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex justify-between items-center mb-2">
                                                                <div className="text-white font-medium">{tx.amount} SOL</div>
                                                                <div className="text-sm font-mono text-gray-400 truncate max-w-[200px]">
                                                                    To: {tx.recipient}
                                                                </div>
                                                            </div>
                                                            {tx.status === "pending" && (
                                                                <div className="mt-2">
                                                                    <div className="flex justify-between text-sm mb-1">
                                                                        <span className="text-gray-400">Approvals:</span>
                                                                        <span className="text-white">
                                                                            {tx.approvals.length} of {wallet.threshold}
                                                                        </span>
                                                                    </div>
                                                                    <Progress
                                                                        value={(tx.approvals.length / wallet.threshold) * 100}
                                                                        className="h-2 bg-gray-800"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="mt-3">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                                                                    onClick={() => navigate(`/wallet/${walletId}/transaction/${tx.id}`)}
                                                                >
                                                                    View Details
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="owners" className="mt-6">
                                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="text-white">Wallet Owners</CardTitle>
                                        <CardDescription className="text-gray-400">
                                            {wallet.threshold} of {wallet.owners.length} signatures required for transactions
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {wallet.owners.map((owner: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-3 border border-gray-800 rounded-lg"
                                                >
                                                    <div className="flex items-center">
                                                        <Avatar className="h-10 w-10 mr-4">
                                                            <AvatarFallback className="bg-purple-600">
                                                                {getInitials(owner.label || `Owner ${index + 1}`)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="text-white font-medium">{owner.label || `Owner ${index + 1}`}</div>
                                                            <div className="text-sm font-mono text-gray-400 truncate max-w-[200px] md:max-w-[300px]">
                                                                {owner.address}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-400 hover:text-white"
                                                        onClick={() => copyToClipboard(owner.address)}
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </motion.div>
                </div>
            </div>
        </main>
    )
}

