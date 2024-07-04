export type SolanaDaoProgram = {
  "version": "0.1.0",
  "name": "solana_dao_program",
  "instructions": [
    {
      "name": "createDao",
      "accounts": [
        {
          "name": "daoAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "dao",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "treasuryAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createProposal",
      "accounts": [
        {
          "name": "proposalAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "dao",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "deadline",
          "type": "u64"
        },
        {
          "name": "quantityToSend",
          "type": "u64"
        },
        {
          "name": "sendToPubkey",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "createVote",
      "accounts": [
        {
          "name": "voteAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "vote",
          "type": "bool"
        }
      ]
    },
    {
      "name": "executeProposal",
      "accounts": [
        {
          "name": "proposalAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "dao",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recipient",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "dao",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "author",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "nameLength",
            "type": "u8"
          },
          {
            "name": "description",
            "type": {
              "array": [
                "u8",
                100
              ]
            }
          },
          {
            "name": "descriptionLength",
            "type": "u8"
          },
          {
            "name": "treasuryAmount",
            "type": "u64"
          },
          {
            "name": "treasuryAmountAvailable",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "proposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "author",
            "type": "publicKey"
          },
          {
            "name": "daoPubkey",
            "type": "publicKey"
          },
          {
            "name": "description",
            "type": {
              "array": [
                "u8",
                1000
              ]
            }
          },
          {
            "name": "descriptionLength",
            "type": "u16"
          },
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "nameLength",
            "type": "u8"
          },
          {
            "name": "yesQuantity",
            "type": "u64"
          },
          {
            "name": "noQuantity",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": "ProposalStatus"
            }
          },
          {
            "name": "quantityToSend",
            "type": "u64"
          },
          {
            "name": "sendToPubkey",
            "type": "publicKey"
          },
          {
            "name": "deadline",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "vote",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vote",
            "type": "bool"
          },
          {
            "name": "proposalPubkey",
            "type": "publicKey"
          },
          {
            "name": "voter",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "ProposalStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Open"
          },
          {
            "name": "Executed"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NameTooLong"
    },
    {
      "code": 6001,
      "name": "DescriptionTooLong"
    },
    {
      "code": 6002,
      "name": "ProposalLamportsExceedBalance"
    },
    {
      "code": 6003,
      "name": "ProposalDescriptionTooLong"
    },
    {
      "code": 6004,
      "name": "ProposalNameTooLong"
    },
    {
      "code": 6005,
      "name": "ProposalExpired"
    },
    {
      "code": 6006,
      "name": "ExecuteFailedProposalVotingActive"
    },
    {
      "code": 6007,
      "name": "ExecuteFailedProposalIsFinished"
    }
  ]
};

export const IDL: SolanaDaoProgram = {
  "version": "0.1.0",
  "name": "solana_dao_program",
  "instructions": [
    {
      "name": "createDao",
      "accounts": [
        {
          "name": "daoAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "dao",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "treasuryAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createProposal",
      "accounts": [
        {
          "name": "proposalAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "dao",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "deadline",
          "type": "u64"
        },
        {
          "name": "quantityToSend",
          "type": "u64"
        },
        {
          "name": "sendToPubkey",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "createVote",
      "accounts": [
        {
          "name": "voteAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "vote",
          "type": "bool"
        }
      ]
    },
    {
      "name": "executeProposal",
      "accounts": [
        {
          "name": "proposalAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "dao",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recipient",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "dao",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "author",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "nameLength",
            "type": "u8"
          },
          {
            "name": "description",
            "type": {
              "array": [
                "u8",
                100
              ]
            }
          },
          {
            "name": "descriptionLength",
            "type": "u8"
          },
          {
            "name": "treasuryAmount",
            "type": "u64"
          },
          {
            "name": "treasuryAmountAvailable",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "proposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "author",
            "type": "publicKey"
          },
          {
            "name": "daoPubkey",
            "type": "publicKey"
          },
          {
            "name": "description",
            "type": {
              "array": [
                "u8",
                1000
              ]
            }
          },
          {
            "name": "descriptionLength",
            "type": "u16"
          },
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "nameLength",
            "type": "u8"
          },
          {
            "name": "yesQuantity",
            "type": "u64"
          },
          {
            "name": "noQuantity",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": "ProposalStatus"
            }
          },
          {
            "name": "quantityToSend",
            "type": "u64"
          },
          {
            "name": "sendToPubkey",
            "type": "publicKey"
          },
          {
            "name": "deadline",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "vote",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vote",
            "type": "bool"
          },
          {
            "name": "proposalPubkey",
            "type": "publicKey"
          },
          {
            "name": "voter",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "ProposalStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Open"
          },
          {
            "name": "Executed"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NameTooLong"
    },
    {
      "code": 6001,
      "name": "DescriptionTooLong"
    },
    {
      "code": 6002,
      "name": "ProposalLamportsExceedBalance"
    },
    {
      "code": 6003,
      "name": "ProposalDescriptionTooLong"
    },
    {
      "code": 6004,
      "name": "ProposalNameTooLong"
    },
    {
      "code": 6005,
      "name": "ProposalExpired"
    },
    {
      "code": 6006,
      "name": "ExecuteFailedProposalVotingActive"
    },
    {
      "code": 6007,
      "name": "ExecuteFailedProposalIsFinished"
    }
  ]
};
