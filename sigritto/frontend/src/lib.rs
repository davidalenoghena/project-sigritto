#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod multisig_wallet {
    use ink_storage::collections::HashMap as StorageHashMap;

    #[ink(storage)]
    pub struct MultisigWallet {
        signatories: StorageHashMap<AccountId, bool>,
        required_signatures: u32,
    }

    impl MultisigWallet {
        #[ink(constructor)]
        pub fn new(signatories: Vec<AccountId>, required_signatures: u32) -> Self {
            let mut signatories_map = StorageHashMap::new();
            for signatory in signatories {
                signatories_map.insert(signatory, true);
            }
            Self {
                signatories: signatories_map,
                required_signatures,
            }
        }

        #[ink(message)]
        pub fn remove_signatory(&mut self, signatory: AccountId) -> Result<(), &'static str> {
            if !self.signatories.contains_key(&signatory) {
                return Err("Signatory not found");
            }
            self.signatories.remove(&signatory);
            Ok(())
        }

        #[ink(message)]
        pub fn is_signatory(&self, signatory: AccountId) -> bool {
            self.signatories.contains_key(&signatory)
        }

        #[ink(message)]
        pub fn get_required_signatures(&self) -> u32 {
            self.required_signatures
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn test_remove_signatory() {
            let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            let mut wallet = MultisigWallet::new(vec![accounts.david, accounts.isaac], 2);

            assert!(wallet.is_signatory(accounts.david));
            assert!(wallet.is_signatory(accounts.isaac));

            assert_eq!(wallet.remove_signatory(accounts.david), Ok(()));
            assert!(!wallet.is_signatory(accounts.david));
            assert!(wallet.is_signatory(accounts.isaac));
        }
    }
}