export type AnchorSola = {
  "version": "0.1.0",
  "name": "anchor_sola",
  "instructions": [
    {
      "name": "initializeeBadgeGlobal",
      "accounts": [
        {
          "name": "badgeGlobal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "mintBadge",
      "accounts": [
        {
          "name": "masterToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterEdition",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "badgeState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lineageOrigins",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "genericOrigins",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "publisher",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "to",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "splAtaProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "badgeId",
          "type": "u64"
        },
        {
          "name": "classId",
          "type": "u64"
        },
        {
          "name": "origins",
          "type": {
            "vec": "u64"
          }
        },
        {
          "name": "params",
          "type": {
            "defined": "MintBadgeParams"
          }
        }
      ]
    },
    {
      "name": "initializee",
      "accounts": [
        {
          "name": "solaProfileGlobal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "chainid",
          "type": "u64"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "mintProfile",
      "accounts": [
        {
          "name": "solaCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "addressDefaultProfiles",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "masterToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterEdition",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solaProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "publisher",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "to",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "splAtaProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "profileId",
          "type": "u64"
        },
        {
          "name": "params",
          "type": {
            "defined": "MintProfileParams"
          }
        }
      ]
    },
    {
      "name": "burnProfile",
      "accounts": [
        {
          "name": "addressDefaultProfiles",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "masterToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterEdition",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solaProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "close",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "splAtaProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "profileId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setProfileCreator",
      "accounts": [
        {
          "name": "solaProfileGlobal",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "solaCreator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "status",
          "type": "bool"
        }
      ]
    },
    {
      "name": "register",
      "accounts": [
        {
          "name": "tokenClass",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "classId",
          "type": "u64"
        },
        {
          "name": "profileId",
          "type": "u64"
        },
        {
          "name": "params",
          "type": {
            "defined": "RegisterParams"
          }
        }
      ]
    },
    {
      "name": "setDispatcher",
      "accounts": [
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dispatcher",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "userDispatcher",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "controllerId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setDefaultDispatcher",
      "accounts": [
        {
          "name": "solaProfileGlobal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "defaultDispatcher",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "dispatcher",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setGroupController",
      "accounts": [
        {
          "name": "masterMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "masterToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dispatcher",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "defaultDispatcher",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "groupController",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "controller",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "controllerId",
          "type": "u64"
        },
        {
          "name": "params",
          "type": {
            "defined": "SetGroupControllerParams"
          }
        }
      ]
    },
    {
      "name": "setClassGeneric",
      "accounts": [
        {
          "name": "tokenClass",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dispatcher",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "defaultDispatcher",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "groupController",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "classGeneric",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "classId",
          "type": "u64"
        },
        {
          "name": "params",
          "type": {
            "defined": "SetClassGenericParams"
          }
        }
      ]
    },
    {
      "name": "setTokenClassState",
      "accounts": [
        {
          "name": "tokenClass",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dispatcher",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "defaultDispatcher",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenClassState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "controller",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "classId",
          "type": "u64"
        },
        {
          "name": "params",
          "type": {
            "defined": "SetTokenClassStateParams"
          }
        }
      ]
    },
    {
      "name": "updateProfileGlobal",
      "accounts": [
        {
          "name": "solaProfileGlobal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "newOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "chainid",
          "type": "u64"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "badgeGlobal",
      "docs": [
        "seeds: \"badge_global\""
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "baseUri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "badgeState",
      "docs": [
        "seeds: \"badge_state\" + badge_mint"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "badgeId",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "metatable",
            "type": "u64"
          },
          {
            "name": "weights",
            "type": "u64"
          },
          {
            "name": "tokenSchema",
            "type": "string"
          },
          {
            "name": "masterMint",
            "type": "publicKey"
          },
          {
            "name": "masterMetadata",
            "type": "publicKey"
          },
          {
            "name": "masterEdition",
            "type": "publicKey"
          },
          {
            "name": "badgeBump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "mintBump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          }
        ]
      }
    },
    {
      "name": "lineageOrigins",
      "docs": [
        "seeds: \"lineage_origins\" + badge_mint"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "origins",
            "type": {
              "vec": "u64"
            }
          }
        ]
      }
    },
    {
      "name": "genericOrigins",
      "docs": [
        "seeds: \"generic_origins\" + badge_mint"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "origin",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "solaProfileGlobal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "chainid",
            "type": "u64"
          },
          {
            "name": "baseUri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "isProfileCreator",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isProfileCreator",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "defaultProfileId",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "profileId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "solaProfile",
      "docs": [
        "和spl的Mint关联",
        "",
        "seeds: \"sola_profile\" + master_mint"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "profileId",
            "docs": [
              "初始计数器，后续作为token id来使用"
            ],
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "masterMint",
            "docs": [
              "初始化的mint地址"
            ],
            "type": "publicKey"
          },
          {
            "name": "masterMetadata",
            "docs": [
              "初始化的metadata地址"
            ],
            "type": "publicKey"
          },
          {
            "name": "masterEdition",
            "type": "publicKey"
          },
          {
            "name": "addressDefaultProfiles",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "profileBump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "mintBump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          }
        ]
      }
    },
    {
      "name": "tokenClass",
      "docs": [
        "seeds: \"token_class\" + class_id"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fungible",
            "type": "bool"
          },
          {
            "name": "transferable",
            "type": "bool"
          },
          {
            "name": "revocable",
            "type": "bool"
          },
          {
            "name": "address",
            "type": "publicKey"
          },
          {
            "name": "schema",
            "type": "string"
          },
          {
            "name": "controller",
            "docs": [
              "profile id"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "groupController",
      "docs": [
        "seeds: \"group_controller\" + profile_mint + controller"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isManager",
            "type": "bool"
          },
          {
            "name": "isIssuer",
            "type": "bool"
          },
          {
            "name": "isMember",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "tokenClassState",
      "docs": [
        "seeds: \"token_class_state\" + token_class.key().as_ref() + controller.key().as_ref()"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isIssuer",
            "type": "bool"
          },
          {
            "name": "isConsumer",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "dispatcher",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dispatcher",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "classGeneric",
      "docs": [
        "seeds: \"class_generic\" + token_calss.key().as_ref()"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isGenericBadgeClass",
            "type": "bool"
          },
          {
            "name": "isLineageBadgeClass",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "MintBadgeParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "creators",
            "type": {
              "vec": {
                "defined": "CreatorsParam"
              }
            }
          },
          {
            "name": "sellerFeeBasisPoints",
            "type": "u16"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "isMutable",
            "type": "bool"
          },
          {
            "name": "weights",
            "type": "u64"
          },
          {
            "name": "schema",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "MintProfileParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "creators",
            "type": {
              "vec": {
                "defined": "CreatorsParam"
              }
            }
          },
          {
            "name": "sellerFeeBasisPoints",
            "type": "u16"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "isMutable",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "RegisterParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fungible",
            "type": "bool"
          },
          {
            "name": "transferable",
            "type": "bool"
          },
          {
            "name": "revocable",
            "type": "bool"
          },
          {
            "name": "address",
            "type": "publicKey"
          },
          {
            "name": "schema",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "SetClassGenericParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isGenericBadgeClass",
            "type": "bool"
          },
          {
            "name": "isLineageBadgeClass",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "SetGroupControllerParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isManager",
            "type": "bool"
          },
          {
            "name": "isIssuer",
            "type": "bool"
          },
          {
            "name": "isMember",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "SetTokenClassStateParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isIssuer",
            "type": "bool"
          },
          {
            "name": "isConsumer",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "CreatorsParam",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "publicKey"
          },
          {
            "name": "share",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotSupport",
      "msg": "not support."
    },
    {
      "code": 6001,
      "name": "InvalidTokenStandard",
      "msg": "invalid token standard"
    },
    {
      "code": 6002,
      "name": "OriginsMismatch",
      "msg": "origins mismatch."
    },
    {
      "code": 6003,
      "name": "NoPermission",
      "msg": "no permission"
    },
    {
      "code": 6004,
      "name": "ProfileIdNotNull",
      "msg": "When mint default profiles, profile id must be null."
    },
    {
      "code": 6005,
      "name": "NotFoundDefaultProfiles",
      "msg": "Not found default profiles in accounts."
    },
    {
      "code": 6006,
      "name": "FoundDefaultProfiles",
      "msg": "Found default profiles in accounts."
    },
    {
      "code": 6007,
      "name": "NotProfileCreator",
      "msg": "The publisher is not the profile creator."
    },
    {
      "code": 6008,
      "name": "IncorrectOwner",
      "msg": "incorrect owner."
    },
    {
      "code": 6009,
      "name": "MintMismatch",
      "msg": "mint mismatch"
    },
    {
      "code": 6010,
      "name": "NotEnoughTokens",
      "msg": "not enough tokens"
    },
    {
      "code": 6011,
      "name": "InvalidTokenExtensionType",
      "msg": "invalid token extension type"
    },
    {
      "code": 6012,
      "name": "MissingImmutableOwnerExtension",
      "msg": "missing immutable owner extension"
    }
  ]
};

export const IDL: AnchorSola = {
  "version": "0.1.0",
  "name": "anchor_sola",
  "instructions": [
    {
      "name": "initializeeBadgeGlobal",
      "accounts": [
        {
          "name": "badgeGlobal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "mintBadge",
      "accounts": [
        {
          "name": "masterToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterEdition",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "badgeState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lineageOrigins",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "genericOrigins",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "publisher",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "to",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "splAtaProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "badgeId",
          "type": "u64"
        },
        {
          "name": "classId",
          "type": "u64"
        },
        {
          "name": "origins",
          "type": {
            "vec": "u64"
          }
        },
        {
          "name": "params",
          "type": {
            "defined": "MintBadgeParams"
          }
        }
      ]
    },
    {
      "name": "initializee",
      "accounts": [
        {
          "name": "solaProfileGlobal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "chainid",
          "type": "u64"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "mintProfile",
      "accounts": [
        {
          "name": "solaCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "addressDefaultProfiles",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "masterToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterEdition",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solaProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "publisher",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "to",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "splAtaProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "profileId",
          "type": "u64"
        },
        {
          "name": "params",
          "type": {
            "defined": "MintProfileParams"
          }
        }
      ]
    },
    {
      "name": "burnProfile",
      "accounts": [
        {
          "name": "addressDefaultProfiles",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "masterToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterEdition",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solaProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "close",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "splAtaProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "profileId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setProfileCreator",
      "accounts": [
        {
          "name": "solaProfileGlobal",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "solaCreator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "status",
          "type": "bool"
        }
      ]
    },
    {
      "name": "register",
      "accounts": [
        {
          "name": "tokenClass",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "classId",
          "type": "u64"
        },
        {
          "name": "profileId",
          "type": "u64"
        },
        {
          "name": "params",
          "type": {
            "defined": "RegisterParams"
          }
        }
      ]
    },
    {
      "name": "setDispatcher",
      "accounts": [
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dispatcher",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "userDispatcher",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "controllerId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setDefaultDispatcher",
      "accounts": [
        {
          "name": "solaProfileGlobal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "defaultDispatcher",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "dispatcher",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setGroupController",
      "accounts": [
        {
          "name": "masterMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "masterToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dispatcher",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "defaultDispatcher",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "groupController",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "controller",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "controllerId",
          "type": "u64"
        },
        {
          "name": "params",
          "type": {
            "defined": "SetGroupControllerParams"
          }
        }
      ]
    },
    {
      "name": "setClassGeneric",
      "accounts": [
        {
          "name": "tokenClass",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dispatcher",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "defaultDispatcher",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "groupController",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "classGeneric",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "classId",
          "type": "u64"
        },
        {
          "name": "params",
          "type": {
            "defined": "SetClassGenericParams"
          }
        }
      ]
    },
    {
      "name": "setTokenClassState",
      "accounts": [
        {
          "name": "tokenClass",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dispatcher",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "defaultDispatcher",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenClassState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "controller",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "classId",
          "type": "u64"
        },
        {
          "name": "params",
          "type": {
            "defined": "SetTokenClassStateParams"
          }
        }
      ]
    },
    {
      "name": "updateProfileGlobal",
      "accounts": [
        {
          "name": "solaProfileGlobal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "newOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "chainid",
          "type": "u64"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "badgeGlobal",
      "docs": [
        "seeds: \"badge_global\""
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "baseUri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "badgeState",
      "docs": [
        "seeds: \"badge_state\" + badge_mint"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "badgeId",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "metatable",
            "type": "u64"
          },
          {
            "name": "weights",
            "type": "u64"
          },
          {
            "name": "tokenSchema",
            "type": "string"
          },
          {
            "name": "masterMint",
            "type": "publicKey"
          },
          {
            "name": "masterMetadata",
            "type": "publicKey"
          },
          {
            "name": "masterEdition",
            "type": "publicKey"
          },
          {
            "name": "badgeBump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "mintBump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          }
        ]
      }
    },
    {
      "name": "lineageOrigins",
      "docs": [
        "seeds: \"lineage_origins\" + badge_mint"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "origins",
            "type": {
              "vec": "u64"
            }
          }
        ]
      }
    },
    {
      "name": "genericOrigins",
      "docs": [
        "seeds: \"generic_origins\" + badge_mint"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "origin",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "solaProfileGlobal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "chainid",
            "type": "u64"
          },
          {
            "name": "baseUri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "isProfileCreator",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isProfileCreator",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "defaultProfileId",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "profileId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "solaProfile",
      "docs": [
        "和spl的Mint关联",
        "",
        "seeds: \"sola_profile\" + master_mint"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "profileId",
            "docs": [
              "初始计数器，后续作为token id来使用"
            ],
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "masterMint",
            "docs": [
              "初始化的mint地址"
            ],
            "type": "publicKey"
          },
          {
            "name": "masterMetadata",
            "docs": [
              "初始化的metadata地址"
            ],
            "type": "publicKey"
          },
          {
            "name": "masterEdition",
            "type": "publicKey"
          },
          {
            "name": "addressDefaultProfiles",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "profileBump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "mintBump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          }
        ]
      }
    },
    {
      "name": "tokenClass",
      "docs": [
        "seeds: \"token_class\" + class_id"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fungible",
            "type": "bool"
          },
          {
            "name": "transferable",
            "type": "bool"
          },
          {
            "name": "revocable",
            "type": "bool"
          },
          {
            "name": "address",
            "type": "publicKey"
          },
          {
            "name": "schema",
            "type": "string"
          },
          {
            "name": "controller",
            "docs": [
              "profile id"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "groupController",
      "docs": [
        "seeds: \"group_controller\" + profile_mint + controller"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isManager",
            "type": "bool"
          },
          {
            "name": "isIssuer",
            "type": "bool"
          },
          {
            "name": "isMember",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "tokenClassState",
      "docs": [
        "seeds: \"token_class_state\" + token_class.key().as_ref() + controller.key().as_ref()"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isIssuer",
            "type": "bool"
          },
          {
            "name": "isConsumer",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "dispatcher",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dispatcher",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "classGeneric",
      "docs": [
        "seeds: \"class_generic\" + token_calss.key().as_ref()"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isGenericBadgeClass",
            "type": "bool"
          },
          {
            "name": "isLineageBadgeClass",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "MintBadgeParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "creators",
            "type": {
              "vec": {
                "defined": "CreatorsParam"
              }
            }
          },
          {
            "name": "sellerFeeBasisPoints",
            "type": "u16"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "isMutable",
            "type": "bool"
          },
          {
            "name": "weights",
            "type": "u64"
          },
          {
            "name": "schema",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "MintProfileParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "creators",
            "type": {
              "vec": {
                "defined": "CreatorsParam"
              }
            }
          },
          {
            "name": "sellerFeeBasisPoints",
            "type": "u16"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "isMutable",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "RegisterParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fungible",
            "type": "bool"
          },
          {
            "name": "transferable",
            "type": "bool"
          },
          {
            "name": "revocable",
            "type": "bool"
          },
          {
            "name": "address",
            "type": "publicKey"
          },
          {
            "name": "schema",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "SetClassGenericParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isGenericBadgeClass",
            "type": "bool"
          },
          {
            "name": "isLineageBadgeClass",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "SetGroupControllerParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isManager",
            "type": "bool"
          },
          {
            "name": "isIssuer",
            "type": "bool"
          },
          {
            "name": "isMember",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "SetTokenClassStateParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isIssuer",
            "type": "bool"
          },
          {
            "name": "isConsumer",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "CreatorsParam",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "publicKey"
          },
          {
            "name": "share",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotSupport",
      "msg": "not support."
    },
    {
      "code": 6001,
      "name": "InvalidTokenStandard",
      "msg": "invalid token standard"
    },
    {
      "code": 6002,
      "name": "OriginsMismatch",
      "msg": "origins mismatch."
    },
    {
      "code": 6003,
      "name": "NoPermission",
      "msg": "no permission"
    },
    {
      "code": 6004,
      "name": "ProfileIdNotNull",
      "msg": "When mint default profiles, profile id must be null."
    },
    {
      "code": 6005,
      "name": "NotFoundDefaultProfiles",
      "msg": "Not found default profiles in accounts."
    },
    {
      "code": 6006,
      "name": "FoundDefaultProfiles",
      "msg": "Found default profiles in accounts."
    },
    {
      "code": 6007,
      "name": "NotProfileCreator",
      "msg": "The publisher is not the profile creator."
    },
    {
      "code": 6008,
      "name": "IncorrectOwner",
      "msg": "incorrect owner."
    },
    {
      "code": 6009,
      "name": "MintMismatch",
      "msg": "mint mismatch"
    },
    {
      "code": 6010,
      "name": "NotEnoughTokens",
      "msg": "not enough tokens"
    },
    {
      "code": 6011,
      "name": "InvalidTokenExtensionType",
      "msg": "invalid token extension type"
    },
    {
      "code": 6012,
      "name": "MissingImmutableOwnerExtension",
      "msg": "missing immutable owner extension"
    }
  ]
};
