import * as React from "react";
import { createContext, useContext, useMemo, ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet as useSolanaWallet,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import { WalletContextState } from "@solana/wallet-adapter-react";

// Define the props type for the provider
interface WalletContextProviderProps {
  children: ReactNode;
}

// Create the context with the correct type
const WalletContext = createContext<WalletContextState | null>(null);

export const CustomWalletMultiButton = () => {
  const wallet = useSolanaWallet();

  // Conditionally render button text based on connection state
  const buttonText = wallet.connected ? null : "Connect Wallet";

  return (
      <WalletMultiButton
          style={connectButtonStyles}
          className="hover:bg-purple-700"
      >
          {buttonText}
      </WalletMultiButton>
  );
};

// Button styles
const connectButtonStyles: React.CSSProperties = {
    backgroundColor: "#6B21A8", // Tailwind 'purple-600' color
    color: "#fff",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "0.375rem", // Tailwind 'rounded-md'
    fontSize: "1rem", // Tailwind 'text-base'
    cursor: "pointer",
    transition: "background-color 0.3s ease",
};

const WalletContextProvider: React.FC<WalletContextProviderProps> = ({
  children,
}) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);

  const wallet = useSolanaWallet();

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContext.Provider value={wallet}>
            {children}
          </WalletContext.Provider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === null) {
    throw new Error("useWallet must be used within a WalletContextProvider");
  }
  return context;
};

export default WalletContextProvider;
