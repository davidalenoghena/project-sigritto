// components/MultisigSearch.tsx
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { UseQueryResult } from "@tanstack/react-query";
import { MultisigWallet } from "./sigritto_data/sigritto-exports"; // Adjust path to your MultisigWallet type

interface MultisigSearchProps {
    getMultisigWallet: (creator: PublicKey, nonce: number) => UseQueryResult<MultisigWallet, Error>;
    programId: PublicKey;
}

export default function MultisigSearch({ getMultisigWallet, programId }: MultisigSearchProps) {
    const [searchCreator, setSearchCreator] = useState<string>("");
    const [searchNonce, setSearchNonce] = useState<string>("");
    const [searchParams, setSearchParams] = useState<{ creator: PublicKey | null; nonce: number | null }>({
        creator: null,
        nonce: null,
    });
    const [searchError, setSearchError] = useState<string | null>(null);

    const handleSearch = () => {
        setSearchError(null);
        try {
            const creatorPubkey = new PublicKey(searchCreator.trim());
            const nonceNum = parseInt(searchNonce.trim(), 10);
            if (isNaN(nonceNum) || nonceNum < 0) {
                throw new Error("Nonce must be a non-negative number");
            }
            setSearchParams({ creator: creatorPubkey, nonce: nonceNum });
        } catch (err) {
            setSearchError((err as Error).message);
            setSearchParams({ creator: null, nonce: null });
        }
    };

    const searchedWalletQuery = searchParams.creator && searchParams.nonce !== null
        ? getMultisigWallet(searchParams.creator, searchParams.nonce)
        : null;

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Search Multisig Wallet</h2>
            <div className="flex flex-col md:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Creator Public Key"
                    value={searchCreator}
                    onChange={(e) => setSearchCreator(e.target.value)}
                    className="flex-1 p-2 bg-gray-800 text-white rounded"
                />
                <input
                    type="number"
                    placeholder="Nonce"
                    value={searchNonce}
                    onChange={(e) => setSearchNonce(e.target.value)}
                    className="w-24 p-2 bg-gray-800 text-white rounded"
                />
                <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700">
                    Search
                </Button>
            </div>
            {searchError && <p className="text-red-500 mt-2">{searchError}</p>}
            {searchedWalletQuery?.isLoading && (
                <p className="text-gray-400 mt-4">Loading wallet...</p>
            )}
            {searchedWalletQuery?.error && (
                <p className="text-red-500 mt-4">Error: {searchedWalletQuery.error.message}</p>
            )}
            {searchedWalletQuery?.data && (
                <div className="mt-4">
                    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">Multisig Wallet</CardTitle>
                            <CardDescription className="text-gray-400 font-mono text-sm">
                                Address:{" "}
                                {PublicKey.findProgramAddressSync(
                                    [
                                        Buffer.from("multisig"),
                                        searchParams.creator!.toBuffer(),
                                        Buffer.from([searchParams.nonce!]),
                                    ],
                                    programId
                                )[0].toBase58()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Owners:</span>
                                    <span className="text-white">{searchedWalletQuery.data.owners.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Threshold:</span>
                                    <span className="text-white">
                                        {searchedWalletQuery.data.threshold} of {searchedWalletQuery.data.owners.length}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Link
                                to={`/wallet/${PublicKey.findProgramAddressSync(
                                    [
                                        Buffer.from("multisig"),
                                        searchParams.creator!.toBuffer(),
                                        Buffer.from([searchParams.nonce!]),
                                    ],
                                    programId
                                )[0].toBase58()}`}
                            >
                                <Button
                                    variant="outline"
                                    className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                                >
                                    View Details
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            )}
            {!searchParams.creator && !searchError && !searchedWalletQuery?.data && (
                <p className="text-gray-400 mt-4">Enter creator public key and nonce to search for a multisig wallet.</p>
            )}
        </div>
    );
}