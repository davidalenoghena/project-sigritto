"use client"

import { useEffect, useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { SparklesCore } from "../components/sparkles"
import { ArrowLeft, Copy, ExternalLink, Plus, Loader2 } from "lucide-react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { Progress } from "../components/ui/progress"
import { useSigrittoProgram } from "../components/sigritto_data/sigritto-data-access"
import { PublicKey } from "@solana/web3.js"
import { useQuery } from "@tanstack/react-query"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import toast from "react-hot-toast"

export default function WalletDetails() {
    const { program } = useSigrittoProgram()
    const params = useParams()
    const navigate = useNavigate()
    const walletAddress = params.id as string
    const [activeTab, setActiveTab] = useState("overview")

    const { data: wallet, isLoading, error } = useQuery({
        queryKey: ["multisigWallet", walletAddress],
        queryFn: async () => {
            if (!program || !walletAddress) return null

            try {
                const publicKey = new PublicKey(walletAddress)
                const [account, balance] = await Promise.all([
                    program.account.multisigWallet.fetch(publicKey),
                    program.provider.connection.getBalance(publicKey)
                ])

                return {
                    publicKey: publicKey.toString(),
                    account,
                    balance: balance / LAMPORTS_PER_SOL,
                    pendingTransactions: account.pendingTransactions,
                    owners: account.owners.map((o: PublicKey) => o.toString()),
                    threshold: account.threshold,
                    createdAt: account.createdAt
                }
            } catch (e) {
                throw new Error("Wallet not found or access denied")
            }
        },
        enabled: !!walletAddress && !!program,
        retry: 1
    })

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Copied to clipboard")
    }

    const getInitials = (address: PublicKey) => {
        const addressString = address.toString()
        return addressString.charAt(0).toUpperCase() + addressString.slice(-1).toUpperCase()
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    useEffect(() => {
        if (error) {
            toast.error(error.message)
            navigate("/dashboard", { replace: true })
        }
    }, [error, navigate])

    if (isLoading) {
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
                        <Loader2 className="animate-spin text-purple-500 w-12 h-12" />
                        <p className="ml-4 text-gray-400">Loading multisig details...</p>
                    </div>
                </div>
            </main>
        )
    }

    if (!wallet) return null

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
                <div className="container mx-auto px-6 py-8">
                    <Link to="/dashboard" className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-white">Multisig Wallet</h1>
                            <div className="flex items-center mt-2">
                                <p className="text-gray-400 font-mono text-sm mr-2">{wallet.publicKey}</p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-gray-400 hover:text-white"
                                    onClick={() => copyToClipboard(wallet.publicKey)}
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-gray-400 hover:text-white"
                                    onClick={() => window.open(`https://explorer.solana.com/address/${wallet.publicKey}`, "_blank")}
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
                                    <div className="text-3xl font-bold text-white">{wallet.balance.toFixed(4)} SOL</div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-white text-lg">Owners</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-white">{wallet.account.owners.length}</div>
                                    <div className="text-gray-400 text-sm mt-1">
                                        Threshold: {wallet.account.threshold} signatures
                                    </div>
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
                                                <Link to={`/wallet/${walletAddress}/request`}>
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
                                                                    <h3 className="text-white font-medium">Transaction #{tx.id.toString()}</h3>
                                                                    <p className="text-sm text-gray-400">
                                                                        Created {formatDate(wallet.createdAt.toNumber())}
                                                                    </p>
                                                                </div>
                                                                <Badge variant="outline" className="bg-amber-600/20 text-amber-400 border-amber-500/20">
                                                                    Pending
                                                                </Badge>
                                                            </div>
                                                            <div className="flex justify-between items-center mb-3">
                                                                <div className="text-white font-medium">{(tx.amount.toNumber() / LAMPORTS_PER_SOL).toFixed(4)} SOL</div>
                                                                <div className="text-sm font-mono text-gray-400 truncate max-w-[200px]">
                                                                    To: {tx.to.toString()}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-400">Approvals:</span>
                                                                    <span className="text-white">
                                                                        {tx.approvals.length} of {wallet.account.threshold}
                                                                    </span>
                                                                </div>
                                                                <Progress
                                                                    value={(tx.approvals.length / wallet.account.threshold) * 100}
                                                                    className="h-2 bg-gray-800"
                                                                />
                                                                <div className="flex items-center space-x-2 mt-2">
                                                                    {tx.approvals.map((approver: PublicKey) => (
                                                                        <Avatar key={approver.toString()} className="h-6 w-6">
                                                                            <AvatarFallback className="bg-purple-600 text-xs">
                                                                                {getInitials(new PublicKey(approver))}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="mt-4 flex space-x-2">
                                                                <Button
                                                                    className="w-full bg-purple-600 hover:bg-purple-700"
                                                                    size="sm"
                                                                    onClick={() => navigate(`/wallet/${wallet.publicKey}/transaction/${tx.id}`)}
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
                                </div>
                            </TabsContent>

                            <TabsContent value="transactions" className="mt-6">
                                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-white">All Transactions</CardTitle>
                                            <Link to={`/wallet/${walletAddress}/request`}>
                                                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                                    <Plus className="mr-1 h-4 w-4" />
                                                    New Request
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {wallet.pendingTransactions.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <p className="text-gray-400">No transactions found</p>
                                                </div>
                                            ) : (
                                                wallet.pendingTransactions.map((tx: any) => (
                                                    <div key={tx.id} className="border border-gray-800 rounded-lg p-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h3 className="text-white font-medium">Transaction #{tx.id.toString()}</h3>
                                                                <p className="text-sm text-gray-400">
                                                                    Created {formatDate(wallet.createdAt.toNumber())}
                                                                </p>
                                                            </div>
                                                            <Badge variant="outline" className="bg-amber-600/20 text-amber-400 border-amber-500/20">
                                                                Pending
                                                            </Badge>
                                                        </div>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div className="text-white font-medium">{(tx.amount.toNumber() / LAMPORTS_PER_SOL).toFixed(4)} SOL</div>
                                                            <div className="text-sm font-mono text-gray-400 truncate max-w-[200px]">
                                                                To: {tx.to.toString()}
                                                            </div>
                                                        </div>
                                                        <div className="mt-2">
                                                            <div className="flex justify-between text-sm mb-1">
                                                                <span className="text-gray-400">Approvals:</span>
                                                                <span className="text-white">
                                                                    {tx.approvals.length} of {wallet.account.threshold}
                                                                </span>
                                                            </div>
                                                            <Progress
                                                                value={(tx.approvals.length / wallet.account.threshold) * 100}
                                                                className="h-2 bg-gray-800"
                                                            />
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
                                            {wallet.account.threshold} of {wallet.account.owners.length} signatures required
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {wallet.account.owners.map((owner: PublicKey) => (
                                                <div
                                                    key={owner.toString()}
                                                    className="flex items-center justify-between p-3 border border-gray-800 rounded-lg"
                                                >
                                                    <div className="flex items-center">
                                                        <Avatar className="h-10 w-10 mr-4">
                                                            <AvatarFallback className="bg-purple-600 text-xs">
                                                                {getInitials(new PublicKey(owner))}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="text-white font-mono truncate max-w-[200px] md:max-w-[300px]">
                                                                {owner.toString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-400 hover:text-white"
                                                        onClick={() => copyToClipboard(owner.toString())}
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