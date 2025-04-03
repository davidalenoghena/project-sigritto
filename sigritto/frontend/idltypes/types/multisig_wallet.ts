/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/multisig_wallet.json`.
 */
export type MultisigWallet = {
  "address": "FvQihDMQ3Y55X3ZV1oowcm5CM2iwgioEiyV54KfXPWks",
  "metadata": {
    "name": "multisigWallet",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "approveRequest",
      "docs": [
        "Approve a pending withdrawal request"
      ],
      "discriminator": [
        89,
        68,
        167,
        104,
        93,
        25,
        178,
        205
      ],
      "accounts": [
        {
          "name": "multisig",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "transactionId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "executeRequest",
      "docs": [
        "Execute a pending withdrawal request once threshold is met"
      ],
      "discriminator": [
        113,
        254,
        117,
        135,
        26,
        14,
        232,
        88
      ],
      "accounts": [
        {
          "name": "multisig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  117,
                  108,
                  116,
                  105,
                  115,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "recipient",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "transactionId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "getOwners",
      "docs": [
        "Retrieve the list of current owners (view function)"
      ],
      "discriminator": [
        204,
        58,
        71,
        128,
        202,
        150,
        123,
        65
      ],
      "accounts": [
        {
          "name": "multisig"
        }
      ],
      "args": [],
      "returns": {
        "vec": "pubkey"
      }
    },
    {
      "name": "getPendingTransactions",
      "docs": [
        "Retrieve a list of pending transactions (view function)"
      ],
      "discriminator": [
        255,
        208,
        163,
        77,
        86,
        47,
        202,
        124
      ],
      "accounts": [
        {
          "name": "multisig"
        }
      ],
      "args": [],
      "returns": {
        "vec": {
          "defined": {
            "name": "transaction"
          }
        }
      }
    },
    {
      "name": "getWalletBalance",
      "docs": [
        "Query the current balance of the multisig wallet (view function)"
      ],
      "discriminator": [
        30,
        0,
        146,
        170,
        168,
        235,
        151,
        58
      ],
      "accounts": [
        {
          "name": "multisig"
        }
      ],
      "args": [],
      "returns": "u64"
    },
    {
      "name": "initializeMultisigWallet",
      "docs": [
        "Initialize the multisig wallet"
      ],
      "discriminator": [
        145,
        90,
        157,
        235,
        35,
        6,
        20,
        37
      ],
      "accounts": [
        {
          "name": "multisig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  117,
                  108,
                  116,
                  105,
                  115,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "owners",
          "type": {
            "vec": "pubkey"
          }
        },
        {
          "name": "threshold",
          "type": "u8"
        },
        {
          "name": "category",
          "type": {
            "defined": {
              "name": "userCategory"
            }
          }
        }
      ]
    },
    {
      "name": "requestWithdrawal",
      "docs": [
        "Request a withdrawal from the multisig wallet"
      ],
      "discriminator": [
        251,
        85,
        121,
        205,
        56,
        201,
        12,
        177
      ],
      "accounts": [
        {
          "name": "multisig",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "multisigWallet",
      "discriminator": [
        32,
        135,
        234,
        172,
        132,
        39,
        242,
        66
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "tooManyOwners",
      "msg": "Number of owners exceeds the limit for this category"
    },
    {
      "code": 6001,
      "name": "tooFewOwners",
      "msg": "Number of owners not enough for multisig"
    },
    {
      "code": 6002,
      "name": "thresholdTooLow",
      "msg": "Threshold must be at least 2 to ensure collaboration"
    },
    {
      "code": 6003,
      "name": "thresholdExceedsOwners",
      "msg": "Threshold cannot exceed the number of owners"
    },
    {
      "code": 6004,
      "name": "notAnOwner",
      "msg": "Signer is not an owner of the multisig wallet"
    },
    {
      "code": 6005,
      "name": "insufficientBalance",
      "msg": "Insufficient balance in the multisig wallet"
    },
    {
      "code": 6006,
      "name": "ownerAlreadyExists",
      "msg": "Owner already exists in the multisig wallet"
    },
    {
      "code": 6007,
      "name": "transactionAlreadyExecuted",
      "msg": "Transaction already executed"
    },
    {
      "code": 6008,
      "name": "alreadyApproved",
      "msg": "Signer has already approved this transaction"
    },
    {
      "code": 6009,
      "name": "transactionNotFound",
      "msg": "Transaction not found"
    },
    {
      "code": 6010,
      "name": "thresholdNotMet",
      "msg": "Threshold not met for execution"
    }
  ],
  "types": [
    {
      "name": "multisigWallet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owners",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "threshold",
            "type": "u8"
          },
          {
            "name": "transactionCount",
            "type": "u64"
          },
          {
            "name": "pendingTransactions",
            "type": {
              "vec": {
                "defined": {
                  "name": "transaction"
                }
              }
            }
          },
          {
            "name": "balance",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "transaction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "to",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "approvals",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "executed",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "userCategory",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "free"
          },
          {
            "name": "pro"
          }
        ]
      }
    }
  ]
};
