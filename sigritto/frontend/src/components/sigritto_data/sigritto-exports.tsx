// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import SigrittoIDL from '../../../idltypes/idl/multisig_wallet.json';
import type { MultisigWallet } from '../../../idltypes/types/multisig_wallet';

// Re-export the generated IDL and type
export { MultisigWallet, SigrittoIDL };

// The programId is imported from the program IDL.
export const SIGRITTO_PROGRAM_ID = new PublicKey(SigrittoIDL.address);

// This is a helper function to get the Anchor program.
export function getSigrittoProgram(provider: AnchorProvider) {
    return new Program(SigrittoIDL as MultisigWallet, provider);
}

// This is a helper function to get the program ID for the Counter program depending on the cluster.
export function getSigrittoProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
      return new PublicKey('5jAp6TAEegjtconAwrAu4T62FS4yyg4CwykuFhdJv3Dp');
    case 'testnet':
    case 'mainnet-beta':
    default:
      return SIGRITTO_PROGRAM_ID;
  }
}
export enum UserCategory {
    Free = 'Free',
    Pro = 'Pro',
}
