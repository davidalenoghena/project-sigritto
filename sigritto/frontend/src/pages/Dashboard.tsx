"use client"

import { useEffect, useMemo } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { SparklesCore } from "../components/sparkles"
import { Plus, Wallet, ArrowRight, Clock, Loader } from "lucide-react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useSigrittoProgram } from "../components/sigritto_data/sigritto-data-access"
import { useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { useQuery } from "@tanstack/react-query"
import toast from "react-hot-toast"

const MAX_NONCE = 2 // Maximum nonce value per creator

export default function Dashboard() {
    const { publicKey, connecting } = useWallet()
    const { program } = useSigrittoProgram()
    const connection = useMemo(() => new Connection("https://api.devnet.solana.com"), [])

    // Main wallets query
    const { data: wallets, isLoading, error } = useQuery({
        queryKey: ['multisigWallets', publicKey?.toBase58()],
        queryFn: async () => {
            if (!publicKey || !program) return []

            // 1. Discover potential wallets using PDA derivation
            const potentialWallets = Array.from({ length: MAX_NONCE + 1 }, (_, nonce) =>
                PublicKey.findProgramAddressSync(
                    [
                        Buffer.from('multisig'),
                        publicKey.toBuffer(),
                        Buffer.from([nonce])
                    ],
                    program.programId
                )[0]
            )

            // 2. Check existence efficiently
            //const existenceChecks = await connection.getMultipleAccountsInfo(potentialWallets)

            // 3. Filter valid wallets
            //const validWallets = potentialWallets.filter((wallet, index) =>
            //    existenceChecks[index]?.data !== undefined
            //)

            // 4. Parallel fetch details
            const walletDetails = await Promise.all(
                potentialWallets.map(async (wallet) => {
                    try {
                        const [account, balance, pendingTx] = await Promise.all([
                            program.account.multisigWallet.fetch(wallet),
                            connection.getBalance(wallet),
                            program.account.multisigWallet
                                .fetch(wallet)
                                .then(acc => acc.pendingTransactions.length)
                                .catch(() => 0)
                        ])

                        return {
                            publicKey: wallet,
                            account,
                            balance: balance / LAMPORTS_PER_SOL,
                            pendingTxCount: pendingTx,
                            nonce: account.nonce
                        }
                    } catch (error) {
                        console.error(`Error loading wallet ${wallet.toBase58()}:`, error)
                        return null
                    }
                })
            )

            console.log("just before returning giberish...");

            return (walletDetails.filter(Boolean) as NonNullable<typeof walletDetails[number]>[]).map(wallet => ({
                address: wallet.publicKey.toBase58(),
                name: `Multisig #${wallet.nonce}`,
                balance: wallet.balance.toFixed(4),
                owners: wallet.account.owners.map((o: PublicKey) => o.toBase58()),
                threshold: wallet.account.threshold,
                pendingTxCount: wallet.pendingTxCount,
                created: new Date(Number(wallet.account.createdAt) * 1000).toLocaleDateString()
            }))
        },
        enabled: !!publicKey && !!program,
        staleTime: 5 * 60 * 1000, // 5 minute cache
        refetchOnWindowFocus: false
    })

    // Error handling
    useEffect(() => {
        if (error) {
            toast.error(`Wallet loading failed: ${error.message}`)
        }
    }, [error])

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <Loader className="animate-spin text-purple-500 w-12 h-12" />
                <p className="ml-4 text-gray-400">Discovering multisig wallets...</p>
            </div>
        )
    }

    if (connecting) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <Loader className="animate-spin text-purple-500 w-12 h-12" />
                <p className="ml-4 text-gray-400">Connecting your wallet...</p>
            </div>
        )
    }

    // Connection required
    if (!publicKey) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black">
                <Wallet className="w-16 h-16 text-purple-500 mb-4" />
                <h2 className="text-2xl font-semibold text-white mb-2">
                    Wallet Not Connected
                </h2>
                <p className="text-gray-400 mb-6">
                    Connect your wallet to view managed multisigs
                </p>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black">
                <div className="text-red-500 mb-4">⚠️</div>
                <h2 className="text-xl text-white mb-2">Error Loading Wallets</h2>
                <p className="text-gray-400 text-center max-w-md">
                    {(error as Error).message}
                </p>
                <Button
                    className="mt-4 bg-purple-600 hover:bg-purple-700"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </Button>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-black antialiased relative overflow-hidden">
            <div className="h-full w-full absolute inset-0 z-0">
                <SparklesCore
                    background="transparent"
                    minSize={0.6}
                    maxSize={1.4}
                    particleDensity={100}
                    className="w-full h-full"
                    particleColor="#FFFFFF"
                />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            Managed Multisig Wallets
                        </h1>
                        <p className="text-gray-400 mt-2">
                            {publicKey.toBase58().slice(0, 6)}...'s multisig vaults
                        </p>
                    </div>
                    <Link to="/create-wallet">
                        <Button className="mt-4 md:mt-0 bg-purple-600 hover:bg-purple-700">
                            <Plus className="mr-2 h-4 w-4" />
                            New Multisig
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wallets?.map((wallet) => (
                        <motion.div
                            key={wallet.address}
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
                                    <CardDescription className="text-gray-400 font-mono text-sm">
                                        Created: {wallet.created}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Balance:</span>
                                            <span className="text-white font-medium">
                                                {wallet.balance} SOL
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Owners:</span>
                                            <span className="text-white">
                                                {wallet.owners.length}
                                            </span>
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
                                    <Link
                                        to={`/wallet/${wallet.address}`}
                                        className="w-full"
                                        state={{ owners: wallet.owners }}
                                    >
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

                {wallets?.length === 0 && (
                    <div className="text-center text-gray-400 py-12">
                        No multisig wallets found. Create your first one!
                    </div>
                )}
            </div>
        </main>
    )
}