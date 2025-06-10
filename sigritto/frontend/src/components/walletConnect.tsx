import * as React from "react";
import { useMemo, ReactNode } from "react";
import {
    AnchorWallet,
    useConnection,
    ConnectionProvider,
    WalletProvider,
    useWallet as useSolanaWallet,
} from "@solana/wallet-adapter-react";
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import { CivicAuthProvider } from "@civic/auth-web3/react";

import {
    WalletModalProvider,
    WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { AnchorProvider } from "@coral-xyz/anchor";
import { useCluster } from "@/components/cluster/cluster-data-access";
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletProviderProps {
    children: ReactNode;
}

export const CustomWalletMultiButton = () => {
    return (
        <WalletMultiButton
            style={connectButtonStyles}
            className="hover:bg-purple-700"
        />
    );
};

const connectButtonStyles: React.CSSProperties = {
    backgroundColor: "#6B21A8",
    color: "#fff",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "0.375rem",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
};

export const SolanaProvider = ({ children }: WalletProviderProps) => {
    const { cluster } = useCluster();
    //const endpoint = useMemo(() => cluster.endpoint, [cluster]);
    const endpoint = "https://api.testnet.sonic.game"

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
        ],
        [cluster.network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <CivicAuthProvider clientId={import.meta.env.CIVIC_CLIENT_ID}>
                        {children}
                    </CivicAuthProvider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export function useAnchorProvider() {
    const { connection } = useConnection();
    const wallet = useSolanaWallet();

    if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error("Wallet not connected!");
    }

    return new AnchorProvider(connection, wallet as AnchorWallet, {
        commitment: "confirmed",
    });
}