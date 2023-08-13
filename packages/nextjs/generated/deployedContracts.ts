const contracts = {
  11155111: [
    {
      chainId: "11155111",
      name: "sepolia",
      contracts: {
        CommunityRegistry: {
          address: "0x4Ef314537bd47DBDF66Bdbcc34F4974fF5D70906",
          abi: [
            {
              inputs: [
                {
                  internalType: "contract IEAS",
                  name: "_easContract",
                  type: "address",
                },
                {
                  internalType: "contract ISchemaRegistry",
                  name: "_schemaRegistry",
                  type: "address",
                },
                {
                  internalType: "contract IUserRegistry",
                  name: "_userRegistry",
                  type: "address",
                },
                {
                  internalType: "contract IFarmRegistry",
                  name: "_farmRegistry",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "_safeProxyFactory",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "_safeSingleton",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "_safeFallbackHandler",
                  type: "address",
                },
              ],
              stateMutability: "nonpayable",
              type: "constructor",
            },
            {
              inputs: [],
              name: "AccessDenied",
              type: "error",
            },
            {
              inputs: [],
              name: "InsufficientValue",
              type: "error",
            },
            {
              inputs: [],
              name: "InvalidEAS",
              type: "error",
            },
            {
              inputs: [],
              name: "NotPayable",
              type: "error",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "bytes32",
                  name: "uid",
                  type: "bytes32",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "name",
                  type: "string",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "description",
                  type: "string",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "country",
                  type: "string",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "state",
                  type: "string",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "postalCode",
                  type: "string",
                },
              ],
              name: "CommunityRegistered",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "bytes32",
                  name: "uid",
                  type: "bytes32",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "communityName",
                  type: "string",
                },
                {
                  indexed: false,
                  internalType: "bytes32",
                  name: "communityUID",
                  type: "bytes32",
                },
                {
                  indexed: false,
                  internalType: "address",
                  name: "treasury",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "address[]",
                  name: "initialOwners",
                  type: "address[]",
                },
              ],
              name: "CommunityTreasuryCreated",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: false,
                  internalType: "address",
                  name: "farmOwner",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "farmName",
                  type: "string",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "communityName",
                  type: "string",
                },
              ],
              name: "FarmJoinedCommunity",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "previousOwner",
                  type: "address",
                },
                {
                  indexed: true,
                  internalType: "address",
                  name: "newOwner",
                  type: "address",
                },
              ],
              name: "OwnershipTransferred",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: false,
                  internalType: "address",
                  name: "user",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "communityName",
                  type: "string",
                },
                {
                  indexed: false,
                  internalType: "enum UserRole",
                  name: "role",
                  type: "uint8",
                },
              ],
              name: "UserJoinedCommunity",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: false,
                  internalType: "address",
                  name: "user",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "communityName",
                  type: "string",
                },
              ],
              name: "UserRemovedFromCommunity",
              type: "event",
            },
            {
              inputs: [
                {
                  components: [
                    {
                      internalType: "bytes32",
                      name: "uid",
                      type: "bytes32",
                    },
                    {
                      internalType: "bytes32",
                      name: "schema",
                      type: "bytes32",
                    },
                    {
                      internalType: "uint64",
                      name: "time",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "expirationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "revocationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "bytes32",
                      name: "refUID",
                      type: "bytes32",
                    },
                    {
                      internalType: "address",
                      name: "recipient",
                      type: "address",
                    },
                    {
                      internalType: "address",
                      name: "attester",
                      type: "address",
                    },
                    {
                      internalType: "bool",
                      name: "revocable",
                      type: "bool",
                    },
                    {
                      internalType: "bytes",
                      name: "data",
                      type: "bytes",
                    },
                  ],
                  internalType: "struct Attestation",
                  name: "attestation",
                  type: "tuple",
                },
              ],
              name: "attest",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "string",
                  name: "name",
                  type: "string",
                },
              ],
              name: "communityByName",
              outputs: [
                {
                  components: [
                    {
                      internalType: "bytes32",
                      name: "uid",
                      type: "bytes32",
                    },
                    {
                      internalType: "string",
                      name: "name",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "description",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "country",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "state",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "postalCode",
                      type: "string",
                    },
                    {
                      internalType: "address payable",
                      name: "treasury",
                      type: "address",
                    },
                  ],
                  internalType: "struct Community",
                  name: "",
                  type: "tuple",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "bytes32",
                  name: "uid",
                  type: "bytes32",
                },
              ],
              name: "communityByUID",
              outputs: [
                {
                  components: [
                    {
                      internalType: "bytes32",
                      name: "uid",
                      type: "bytes32",
                    },
                    {
                      internalType: "string",
                      name: "name",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "description",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "country",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "state",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "postalCode",
                      type: "string",
                    },
                    {
                      internalType: "address payable",
                      name: "treasury",
                      type: "address",
                    },
                  ],
                  internalType: "struct Community",
                  name: "",
                  type: "tuple",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "string",
                  name: "",
                  type: "string",
                },
              ],
              name: "communityTreasuryByName",
              outputs: [
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "string",
                  name: "",
                  type: "string",
                },
              ],
              name: "communityUIDByName",
              outputs: [
                {
                  internalType: "bytes32",
                  name: "",
                  type: "bytes32",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
              ],
              name: "communityUIDByTreasury",
              outputs: [
                {
                  internalType: "bytes32",
                  name: "",
                  type: "bytes32",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "bytes32",
                  name: "communityUID",
                  type: "bytes32",
                },
                {
                  internalType: "address[]",
                  name: "initialOwners",
                  type: "address[]",
                },
              ],
              name: "createTreasury",
              outputs: [
                {
                  internalType: "address",
                  name: "newTreasury",
                  type: "address",
                },
              ],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [],
              name: "farmRegistry",
              outputs: [
                {
                  internalType: "contract IFarmRegistry",
                  name: "",
                  type: "address",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "isPayable",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "pure",
              type: "function",
            },
            {
              inputs: [
                {
                  components: [
                    {
                      internalType: "bytes32",
                      name: "uid",
                      type: "bytes32",
                    },
                    {
                      internalType: "bytes32",
                      name: "schema",
                      type: "bytes32",
                    },
                    {
                      internalType: "uint64",
                      name: "time",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "expirationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "revocationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "bytes32",
                      name: "refUID",
                      type: "bytes32",
                    },
                    {
                      internalType: "address",
                      name: "recipient",
                      type: "address",
                    },
                    {
                      internalType: "address",
                      name: "attester",
                      type: "address",
                    },
                    {
                      internalType: "bool",
                      name: "revocable",
                      type: "bool",
                    },
                    {
                      internalType: "bytes",
                      name: "data",
                      type: "bytes",
                    },
                  ],
                  internalType: "struct Attestation[]",
                  name: "attestations",
                  type: "tuple[]",
                },
                {
                  internalType: "uint256[]",
                  name: "values",
                  type: "uint256[]",
                },
              ],
              name: "multiAttest",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [
                {
                  components: [
                    {
                      internalType: "bytes32",
                      name: "uid",
                      type: "bytes32",
                    },
                    {
                      internalType: "bytes32",
                      name: "schema",
                      type: "bytes32",
                    },
                    {
                      internalType: "uint64",
                      name: "time",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "expirationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "revocationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "bytes32",
                      name: "refUID",
                      type: "bytes32",
                    },
                    {
                      internalType: "address",
                      name: "recipient",
                      type: "address",
                    },
                    {
                      internalType: "address",
                      name: "attester",
                      type: "address",
                    },
                    {
                      internalType: "bool",
                      name: "revocable",
                      type: "bool",
                    },
                    {
                      internalType: "bytes",
                      name: "data",
                      type: "bytes",
                    },
                  ],
                  internalType: "struct Attestation[]",
                  name: "attestations",
                  type: "tuple[]",
                },
                {
                  internalType: "uint256[]",
                  name: "values",
                  type: "uint256[]",
                },
              ],
              name: "multiRevoke",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [],
              name: "owner",
              outputs: [
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "registrationSchema",
              outputs: [
                {
                  internalType: "string",
                  name: "",
                  type: "string",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "registrationSchemaUID",
              outputs: [
                {
                  internalType: "bytes32",
                  name: "",
                  type: "bytes32",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "renounceOwnership",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  components: [
                    {
                      internalType: "bytes32",
                      name: "uid",
                      type: "bytes32",
                    },
                    {
                      internalType: "bytes32",
                      name: "schema",
                      type: "bytes32",
                    },
                    {
                      internalType: "uint64",
                      name: "time",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "expirationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "revocationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "bytes32",
                      name: "refUID",
                      type: "bytes32",
                    },
                    {
                      internalType: "address",
                      name: "recipient",
                      type: "address",
                    },
                    {
                      internalType: "address",
                      name: "attester",
                      type: "address",
                    },
                    {
                      internalType: "bool",
                      name: "revocable",
                      type: "bool",
                    },
                    {
                      internalType: "bytes",
                      name: "data",
                      type: "bytes",
                    },
                  ],
                  internalType: "struct Attestation",
                  name: "attestation",
                  type: "tuple",
                },
              ],
              name: "revoke",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_userRegistry",
                  type: "address",
                },
              ],
              name: "setUserRegistry",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "newOwner",
                  type: "address",
                },
              ],
              name: "transferOwnership",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [],
              name: "treasurySchema",
              outputs: [
                {
                  internalType: "string",
                  name: "",
                  type: "string",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "treasurySchemaUID",
              outputs: [
                {
                  internalType: "bytes32",
                  name: "",
                  type: "bytes32",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "bytes32",
                  name: "",
                  type: "bytes32",
                },
              ],
              name: "treasuryUIDByCommunityUID",
              outputs: [
                {
                  internalType: "bytes32",
                  name: "",
                  type: "bytes32",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "userRegistry",
              outputs: [
                {
                  internalType: "contract IUserRegistry",
                  name: "",
                  type: "address",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "version",
              outputs: [
                {
                  internalType: "string",
                  name: "",
                  type: "string",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              stateMutability: "payable",
              type: "receive",
            },
          ],
        },
        CompatibilityFallbackHandler: {
          address: "0x4F7B35969Fd796ce07021220A77ec5Ff8d02858a",
          abi: [
            {
              inputs: [
                {
                  internalType: "contract Safe",
                  name: "safe",
                  type: "address",
                },
                {
                  internalType: "bytes",
                  name: "message",
                  type: "bytes",
                },
              ],
              name: "encodeMessageDataForSafe",
              outputs: [
                {
                  internalType: "bytes",
                  name: "",
                  type: "bytes",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "bytes",
                  name: "message",
                  type: "bytes",
                },
              ],
              name: "getMessageHash",
              outputs: [
                {
                  internalType: "bytes32",
                  name: "",
                  type: "bytes32",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "contract Safe",
                  name: "safe",
                  type: "address",
                },
                {
                  internalType: "bytes",
                  name: "message",
                  type: "bytes",
                },
              ],
              name: "getMessageHashForSafe",
              outputs: [
                {
                  internalType: "bytes32",
                  name: "",
                  type: "bytes32",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "getModules",
              outputs: [
                {
                  internalType: "address[]",
                  name: "",
                  type: "address[]",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "bytes32",
                  name: "_dataHash",
                  type: "bytes32",
                },
                {
                  internalType: "bytes",
                  name: "_signature",
                  type: "bytes",
                },
              ],
              name: "isValidSignature",
              outputs: [
                {
                  internalType: "bytes4",
                  name: "",
                  type: "bytes4",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "bytes",
                  name: "_data",
                  type: "bytes",
                },
                {
                  internalType: "bytes",
                  name: "_signature",
                  type: "bytes",
                },
              ],
              name: "isValidSignature",
              outputs: [
                {
                  internalType: "bytes4",
                  name: "",
                  type: "bytes4",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
                {
                  internalType: "uint256[]",
                  name: "",
                  type: "uint256[]",
                },
                {
                  internalType: "uint256[]",
                  name: "",
                  type: "uint256[]",
                },
                {
                  internalType: "bytes",
                  name: "",
                  type: "bytes",
                },
              ],
              name: "onERC1155BatchReceived",
              outputs: [
                {
                  internalType: "bytes4",
                  name: "",
                  type: "bytes4",
                },
              ],
              stateMutability: "pure",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
                {
                  internalType: "bytes",
                  name: "",
                  type: "bytes",
                },
              ],
              name: "onERC1155Received",
              outputs: [
                {
                  internalType: "bytes4",
                  name: "",
                  type: "bytes4",
                },
              ],
              stateMutability: "pure",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
                {
                  internalType: "bytes",
                  name: "",
                  type: "bytes",
                },
              ],
              name: "onERC721Received",
              outputs: [
                {
                  internalType: "bytes4",
                  name: "",
                  type: "bytes4",
                },
              ],
              stateMutability: "pure",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "targetContract",
                  type: "address",
                },
                {
                  internalType: "bytes",
                  name: "calldataPayload",
                  type: "bytes",
                },
              ],
              name: "simulate",
              outputs: [
                {
                  internalType: "bytes",
                  name: "response",
                  type: "bytes",
                },
              ],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "bytes4",
                  name: "interfaceId",
                  type: "bytes4",
                },
              ],
              name: "supportsInterface",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
                {
                  internalType: "bytes",
                  name: "",
                  type: "bytes",
                },
                {
                  internalType: "bytes",
                  name: "",
                  type: "bytes",
                },
              ],
              name: "tokensReceived",
              outputs: [],
              stateMutability: "pure",
              type: "function",
            },
          ],
        },
        FarmRegistry: {
          address: "0xAa3e73A5A63de9f320A0Be92D5A5Da534f10f7D9",
          abi: [
            {
              inputs: [
                {
                  internalType: "contract IEAS",
                  name: "eas",
                  type: "address",
                },
                {
                  internalType: "contract ISchemaRegistry",
                  name: "_schemaRegistry",
                  type: "address",
                },
                {
                  internalType: "contract IUserRegistry",
                  name: "_userRegistry",
                  type: "address",
                },
              ],
              stateMutability: "nonpayable",
              type: "constructor",
            },
            {
              inputs: [],
              name: "AccessDenied",
              type: "error",
            },
            {
              inputs: [],
              name: "InsufficientValue",
              type: "error",
            },
            {
              inputs: [],
              name: "InvalidEAS",
              type: "error",
            },
            {
              inputs: [],
              name: "NotPayable",
              type: "error",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "bytes32",
                  name: "uid",
                  type: "bytes32",
                },
                {
                  indexed: false,
                  internalType: "bytes32",
                  name: "ownerUID",
                  type: "bytes32",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "name",
                  type: "string",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "description",
                  type: "string",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "country",
                  type: "string",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "state",
                  type: "string",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "postalCode",
                  type: "string",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "website",
                  type: "string",
                },
              ],
              name: "FarmRegistered",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "bytes32",
                  name: "uid",
                  type: "bytes32",
                },
                {
                  indexed: false,
                  internalType: "bytes32",
                  name: "ownerUID",
                  type: "bytes32",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "name",
                  type: "string",
                },
              ],
              name: "FarmRevoked",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "previousOwner",
                  type: "address",
                },
                {
                  indexed: true,
                  internalType: "address",
                  name: "newOwner",
                  type: "address",
                },
              ],
              name: "OwnershipTransferred",
              type: "event",
            },
            {
              inputs: [
                {
                  components: [
                    {
                      internalType: "bytes32",
                      name: "uid",
                      type: "bytes32",
                    },
                    {
                      internalType: "bytes32",
                      name: "schema",
                      type: "bytes32",
                    },
                    {
                      internalType: "uint64",
                      name: "time",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "expirationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "revocationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "bytes32",
                      name: "refUID",
                      type: "bytes32",
                    },
                    {
                      internalType: "address",
                      name: "recipient",
                      type: "address",
                    },
                    {
                      internalType: "address",
                      name: "attester",
                      type: "address",
                    },
                    {
                      internalType: "bool",
                      name: "revocable",
                      type: "bool",
                    },
                    {
                      internalType: "bytes",
                      name: "data",
                      type: "bytes",
                    },
                  ],
                  internalType: "struct Attestation",
                  name: "attestation",
                  type: "tuple",
                },
              ],
              name: "attest",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "string",
                  name: "farmName",
                  type: "string",
                },
              ],
              name: "farmRecordByName",
              outputs: [
                {
                  components: [
                    {
                      internalType: "string",
                      name: "farmName",
                      type: "string",
                    },
                    {
                      internalType: "address",
                      name: "farmOwner",
                      type: "address",
                    },
                    {
                      internalType: "string",
                      name: "description",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "country",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "state",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "postalCode",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "websiteUrl",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "imageUrl",
                      type: "string",
                    },
                  ],
                  internalType: "struct FarmRecord",
                  name: "",
                  type: "tuple",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "farmOwner",
                  type: "address",
                },
              ],
              name: "farmRecordByOwnerAddress",
              outputs: [
                {
                  components: [
                    {
                      internalType: "string",
                      name: "farmName",
                      type: "string",
                    },
                    {
                      internalType: "address",
                      name: "farmOwner",
                      type: "address",
                    },
                    {
                      internalType: "string",
                      name: "description",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "country",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "state",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "postalCode",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "websiteUrl",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "imageUrl",
                      type: "string",
                    },
                  ],
                  internalType: "struct FarmRecord",
                  name: "",
                  type: "tuple",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "bytes32",
                  name: "farmOwnerUID",
                  type: "bytes32",
                },
              ],
              name: "farmRecordByOwnerUID",
              outputs: [
                {
                  components: [
                    {
                      internalType: "string",
                      name: "farmName",
                      type: "string",
                    },
                    {
                      internalType: "address",
                      name: "farmOwner",
                      type: "address",
                    },
                    {
                      internalType: "string",
                      name: "description",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "country",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "state",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "postalCode",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "websiteUrl",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "imageUrl",
                      type: "string",
                    },
                  ],
                  internalType: "struct FarmRecord",
                  name: "",
                  type: "tuple",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "bytes32",
                  name: "farmUID",
                  type: "bytes32",
                },
              ],
              name: "farmRecordByUID",
              outputs: [
                {
                  components: [
                    {
                      internalType: "string",
                      name: "farmName",
                      type: "string",
                    },
                    {
                      internalType: "address",
                      name: "farmOwner",
                      type: "address",
                    },
                    {
                      internalType: "string",
                      name: "description",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "country",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "state",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "postalCode",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "websiteUrl",
                      type: "string",
                    },
                    {
                      internalType: "string",
                      name: "imageUrl",
                      type: "string",
                    },
                  ],
                  internalType: "struct FarmRecord",
                  name: "",
                  type: "tuple",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "bytes32",
                  name: "",
                  type: "bytes32",
                },
              ],
              name: "farmUIDByFarmer",
              outputs: [
                {
                  internalType: "bytes32",
                  name: "",
                  type: "bytes32",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "string",
                  name: "",
                  type: "string",
                },
              ],
              name: "farmUIDByName",
              outputs: [
                {
                  internalType: "bytes32",
                  name: "",
                  type: "bytes32",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "isPayable",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "pure",
              type: "function",
            },
            {
              inputs: [
                {
                  components: [
                    {
                      internalType: "bytes32",
                      name: "uid",
                      type: "bytes32",
                    },
                    {
                      internalType: "bytes32",
                      name: "schema",
                      type: "bytes32",
                    },
                    {
                      internalType: "uint64",
                      name: "time",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "expirationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "revocationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "bytes32",
                      name: "refUID",
                      type: "bytes32",
                    },
                    {
                      internalType: "address",
                      name: "recipient",
                      type: "address",
                    },
                    {
                      internalType: "address",
                      name: "attester",
                      type: "address",
                    },
                    {
                      internalType: "bool",
                      name: "revocable",
                      type: "bool",
                    },
                    {
                      internalType: "bytes",
                      name: "data",
                      type: "bytes",
                    },
                  ],
                  internalType: "struct Attestation[]",
                  name: "attestations",
                  type: "tuple[]",
                },
                {
                  internalType: "uint256[]",
                  name: "values",
                  type: "uint256[]",
                },
              ],
              name: "multiAttest",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [
                {
                  components: [
                    {
                      internalType: "bytes32",
                      name: "uid",
                      type: "bytes32",
                    },
                    {
                      internalType: "bytes32",
                      name: "schema",
                      type: "bytes32",
                    },
                    {
                      internalType: "uint64",
                      name: "time",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "expirationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "revocationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "bytes32",
                      name: "refUID",
                      type: "bytes32",
                    },
                    {
                      internalType: "address",
                      name: "recipient",
                      type: "address",
                    },
                    {
                      internalType: "address",
                      name: "attester",
                      type: "address",
                    },
                    {
                      internalType: "bool",
                      name: "revocable",
                      type: "bool",
                    },
                    {
                      internalType: "bytes",
                      name: "data",
                      type: "bytes",
                    },
                  ],
                  internalType: "struct Attestation[]",
                  name: "attestations",
                  type: "tuple[]",
                },
                {
                  internalType: "uint256[]",
                  name: "values",
                  type: "uint256[]",
                },
              ],
              name: "multiRevoke",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [],
              name: "owner",
              outputs: [
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "registrationSchema",
              outputs: [
                {
                  internalType: "string",
                  name: "",
                  type: "string",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "registrationSchemaUID",
              outputs: [
                {
                  internalType: "bytes32",
                  name: "",
                  type: "bytes32",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "renounceOwnership",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  components: [
                    {
                      internalType: "bytes32",
                      name: "uid",
                      type: "bytes32",
                    },
                    {
                      internalType: "bytes32",
                      name: "schema",
                      type: "bytes32",
                    },
                    {
                      internalType: "uint64",
                      name: "time",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "expirationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "revocationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "bytes32",
                      name: "refUID",
                      type: "bytes32",
                    },
                    {
                      internalType: "address",
                      name: "recipient",
                      type: "address",
                    },
                    {
                      internalType: "address",
                      name: "attester",
                      type: "address",
                    },
                    {
                      internalType: "bool",
                      name: "revocable",
                      type: "bool",
                    },
                    {
                      internalType: "bytes",
                      name: "data",
                      type: "bytes",
                    },
                  ],
                  internalType: "struct Attestation",
                  name: "attestation",
                  type: "tuple",
                },
              ],
              name: "revoke",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "newOwner",
                  type: "address",
                },
              ],
              name: "transferOwnership",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [],
              name: "userRegistry",
              outputs: [
                {
                  internalType: "contract IUserRegistry",
                  name: "",
                  type: "address",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "version",
              outputs: [
                {
                  internalType: "string",
                  name: "",
                  type: "string",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              stateMutability: "payable",
              type: "receive",
            },
          ],
        },
        Safe: {
          address: "0x9fb6Eacdd0DAC54f37D9852eAD55dc25495D3e62",
          abi: [
            {
              inputs: [],
              stateMutability: "nonpayable",
              type: "constructor",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "owner",
                  type: "address",
                },
              ],
              name: "AddedOwner",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "bytes32",
                  name: "approvedHash",
                  type: "bytes32",
                },
                {
                  indexed: true,
                  internalType: "address",
                  name: "owner",
                  type: "address",
                },
              ],
              name: "ApproveHash",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "handler",
                  type: "address",
                },
              ],
              name: "ChangedFallbackHandler",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "guard",
                  type: "address",
                },
              ],
              name: "ChangedGuard",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "threshold",
                  type: "uint256",
                },
              ],
              name: "ChangedThreshold",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "module",
                  type: "address",
                },
              ],
              name: "DisabledModule",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "module",
                  type: "address",
                },
              ],
              name: "EnabledModule",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "bytes32",
                  name: "txHash",
                  type: "bytes32",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "payment",
                  type: "uint256",
                },
              ],
              name: "ExecutionFailure",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "module",
                  type: "address",
                },
              ],
              name: "ExecutionFromModuleFailure",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "module",
                  type: "address",
                },
              ],
              name: "ExecutionFromModuleSuccess",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "bytes32",
                  name: "txHash",
                  type: "bytes32",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "payment",
                  type: "uint256",
                },
              ],
              name: "ExecutionSuccess",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "owner",
                  type: "address",
                },
              ],
              name: "RemovedOwner",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "sender",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "value",
                  type: "uint256",
                },
              ],
              name: "SafeReceived",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "initiator",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "address[]",
                  name: "owners",
                  type: "address[]",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "threshold",
                  type: "uint256",
                },
                {
                  indexed: false,
                  internalType: "address",
                  name: "initializer",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "address",
                  name: "fallbackHandler",
                  type: "address",
                },
              ],
              name: "SafeSetup",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "bytes32",
                  name: "msgHash",
                  type: "bytes32",
                },
              ],
              name: "SignMsg",
              type: "event",
            },
            {
              stateMutability: "nonpayable",
              type: "fallback",
            },
            {
              inputs: [],
              name: "VERSION",
              outputs: [
                {
                  internalType: "string",
                  name: "",
                  type: "string",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "owner",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "_threshold",
                  type: "uint256",
                },
              ],
              name: "addOwnerWithThreshold",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "bytes32",
                  name: "hashToApprove",
                  type: "bytes32",
                },
              ],
              name: "approveHash",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
                {
                  internalType: "bytes32",
                  name: "",
                  type: "bytes32",
                },
              ],
              name: "approvedHashes",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "_threshold",
                  type: "uint256",
                },
              ],
              name: "changeThreshold",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "bytes32",
                  name: "dataHash",
                  type: "bytes32",
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes",
                },
                {
                  internalType: "bytes",
                  name: "signatures",
                  type: "bytes",
                },
                {
                  internalType: "uint256",
                  name: "requiredSignatures",
                  type: "uint256",
                },
              ],
              name: "checkNSignatures",
              outputs: [],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "bytes32",
                  name: "dataHash",
                  type: "bytes32",
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes",
                },
                {
                  internalType: "bytes",
                  name: "signatures",
                  type: "bytes",
                },
              ],
              name: "checkSignatures",
              outputs: [],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "prevModule",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "module",
                  type: "address",
                },
              ],
              name: "disableModule",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [],
              name: "domainSeparator",
              outputs: [
                {
                  internalType: "bytes32",
                  name: "",
                  type: "bytes32",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "module",
                  type: "address",
                },
              ],
              name: "enableModule",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "to",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "value",
                  type: "uint256",
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes",
                },
                {
                  internalType: "enum Enum.Operation",
                  name: "operation",
                  type: "uint8",
                },
                {
                  internalType: "uint256",
                  name: "safeTxGas",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "baseGas",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "gasPrice",
                  type: "uint256",
                },
                {
                  internalType: "address",
                  name: "gasToken",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "refundReceiver",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "_nonce",
                  type: "uint256",
                },
              ],
              name: "encodeTransactionData",
              outputs: [
                {
                  internalType: "bytes",
                  name: "",
                  type: "bytes",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "to",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "value",
                  type: "uint256",
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes",
                },
                {
                  internalType: "enum Enum.Operation",
                  name: "operation",
                  type: "uint8",
                },
                {
                  internalType: "uint256",
                  name: "safeTxGas",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "baseGas",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "gasPrice",
                  type: "uint256",
                },
                {
                  internalType: "address",
                  name: "gasToken",
                  type: "address",
                },
                {
                  internalType: "address payable",
                  name: "refundReceiver",
                  type: "address",
                },
                {
                  internalType: "bytes",
                  name: "signatures",
                  type: "bytes",
                },
              ],
              name: "execTransaction",
              outputs: [
                {
                  internalType: "bool",
                  name: "success",
                  type: "bool",
                },
              ],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "to",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "value",
                  type: "uint256",
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes",
                },
                {
                  internalType: "enum Enum.Operation",
                  name: "operation",
                  type: "uint8",
                },
              ],
              name: "execTransactionFromModule",
              outputs: [
                {
                  internalType: "bool",
                  name: "success",
                  type: "bool",
                },
              ],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "to",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "value",
                  type: "uint256",
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes",
                },
                {
                  internalType: "enum Enum.Operation",
                  name: "operation",
                  type: "uint8",
                },
              ],
              name: "execTransactionFromModuleReturnData",
              outputs: [
                {
                  internalType: "bool",
                  name: "success",
                  type: "bool",
                },
                {
                  internalType: "bytes",
                  name: "returnData",
                  type: "bytes",
                },
              ],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [],
              name: "getChainId",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "start",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "pageSize",
                  type: "uint256",
                },
              ],
              name: "getModulesPaginated",
              outputs: [
                {
                  internalType: "address[]",
                  name: "array",
                  type: "address[]",
                },
                {
                  internalType: "address",
                  name: "next",
                  type: "address",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "getOwners",
              outputs: [
                {
                  internalType: "address[]",
                  name: "",
                  type: "address[]",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "offset",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "length",
                  type: "uint256",
                },
              ],
              name: "getStorageAt",
              outputs: [
                {
                  internalType: "bytes",
                  name: "",
                  type: "bytes",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "getThreshold",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "to",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "value",
                  type: "uint256",
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes",
                },
                {
                  internalType: "enum Enum.Operation",
                  name: "operation",
                  type: "uint8",
                },
                {
                  internalType: "uint256",
                  name: "safeTxGas",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "baseGas",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "gasPrice",
                  type: "uint256",
                },
                {
                  internalType: "address",
                  name: "gasToken",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "refundReceiver",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "_nonce",
                  type: "uint256",
                },
              ],
              name: "getTransactionHash",
              outputs: [
                {
                  internalType: "bytes32",
                  name: "",
                  type: "bytes32",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "module",
                  type: "address",
                },
              ],
              name: "isModuleEnabled",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "owner",
                  type: "address",
                },
              ],
              name: "isOwner",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "nonce",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "prevOwner",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "owner",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "_threshold",
                  type: "uint256",
                },
              ],
              name: "removeOwner",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "handler",
                  type: "address",
                },
              ],
              name: "setFallbackHandler",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "guard",
                  type: "address",
                },
              ],
              name: "setGuard",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address[]",
                  name: "_owners",
                  type: "address[]",
                },
                {
                  internalType: "uint256",
                  name: "_threshold",
                  type: "uint256",
                },
                {
                  internalType: "address",
                  name: "to",
                  type: "address",
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes",
                },
                {
                  internalType: "address",
                  name: "fallbackHandler",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "paymentToken",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "payment",
                  type: "uint256",
                },
                {
                  internalType: "address payable",
                  name: "paymentReceiver",
                  type: "address",
                },
              ],
              name: "setup",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "bytes32",
                  name: "",
                  type: "bytes32",
                },
              ],
              name: "signedMessages",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "targetContract",
                  type: "address",
                },
                {
                  internalType: "bytes",
                  name: "calldataPayload",
                  type: "bytes",
                },
              ],
              name: "simulateAndRevert",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "prevOwner",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "oldOwner",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "newOwner",
                  type: "address",
                },
              ],
              name: "swapOwner",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              stateMutability: "payable",
              type: "receive",
            },
          ],
        },
        SafeProxyFactory: {
          address: "0x38dF3ac5Bf7a46Fed3f28ef5f68D6494174dDe09",
          abi: [
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "contract SafeProxy",
                  name: "proxy",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "address",
                  name: "singleton",
                  type: "address",
                },
              ],
              name: "ProxyCreation",
              type: "event",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_singleton",
                  type: "address",
                },
                {
                  internalType: "bytes",
                  name: "initializer",
                  type: "bytes",
                },
                {
                  internalType: "uint256",
                  name: "saltNonce",
                  type: "uint256",
                },
              ],
              name: "createChainSpecificProxyWithNonce",
              outputs: [
                {
                  internalType: "contract SafeProxy",
                  name: "proxy",
                  type: "address",
                },
              ],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_singleton",
                  type: "address",
                },
                {
                  internalType: "bytes",
                  name: "initializer",
                  type: "bytes",
                },
                {
                  internalType: "uint256",
                  name: "saltNonce",
                  type: "uint256",
                },
                {
                  internalType: "contract IProxyCreationCallback",
                  name: "callback",
                  type: "address",
                },
              ],
              name: "createProxyWithCallback",
              outputs: [
                {
                  internalType: "contract SafeProxy",
                  name: "proxy",
                  type: "address",
                },
              ],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_singleton",
                  type: "address",
                },
                {
                  internalType: "bytes",
                  name: "initializer",
                  type: "bytes",
                },
                {
                  internalType: "uint256",
                  name: "saltNonce",
                  type: "uint256",
                },
              ],
              name: "createProxyWithNonce",
              outputs: [
                {
                  internalType: "contract SafeProxy",
                  name: "proxy",
                  type: "address",
                },
              ],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [],
              name: "getChainId",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "proxyCreationCode",
              outputs: [
                {
                  internalType: "bytes",
                  name: "",
                  type: "bytes",
                },
              ],
              stateMutability: "pure",
              type: "function",
            },
          ],
        },
        UserRegistry: {
          address: "0xb97C5be89b4345e9252eC1d44A7Cd66B8C3857Ca",
          abi: [
            {
              inputs: [
                {
                  internalType: "contract IEAS",
                  name: "eas",
                  type: "address",
                },
                {
                  internalType: "contract ISchemaRegistry",
                  name: "registry",
                  type: "address",
                },
              ],
              stateMutability: "nonpayable",
              type: "constructor",
            },
            {
              inputs: [],
              name: "AccessDenied",
              type: "error",
            },
            {
              inputs: [],
              name: "InsufficientValue",
              type: "error",
            },
            {
              inputs: [],
              name: "InvalidEAS",
              type: "error",
            },
            {
              inputs: [],
              name: "NotPayable",
              type: "error",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "previousOwner",
                  type: "address",
                },
                {
                  indexed: true,
                  internalType: "address",
                  name: "newOwner",
                  type: "address",
                },
              ],
              name: "OwnershipTransferred",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "account",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "bytes32",
                  name: "uid",
                  type: "bytes32",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "name",
                  type: "string",
                },
                {
                  indexed: false,
                  internalType: "bytes32",
                  name: "emailHash",
                  type: "bytes32",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "location",
                  type: "string",
                },
                {
                  indexed: false,
                  internalType: "enum UserRole",
                  name: "role",
                  type: "uint8",
                },
              ],
              name: "UserRegistered",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "account",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "bytes32",
                  name: "uid",
                  type: "bytes32",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "name",
                  type: "string",
                },
                {
                  indexed: false,
                  internalType: "bytes32",
                  name: "emailHash",
                  type: "bytes32",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "location",
                  type: "string",
                },
                {
                  indexed: false,
                  internalType: "enum UserRole",
                  name: "role",
                  type: "uint8",
                },
              ],
              name: "UserRevoked",
              type: "event",
            },
            {
              inputs: [
                {
                  components: [
                    {
                      internalType: "bytes32",
                      name: "uid",
                      type: "bytes32",
                    },
                    {
                      internalType: "bytes32",
                      name: "schema",
                      type: "bytes32",
                    },
                    {
                      internalType: "uint64",
                      name: "time",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "expirationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "revocationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "bytes32",
                      name: "refUID",
                      type: "bytes32",
                    },
                    {
                      internalType: "address",
                      name: "recipient",
                      type: "address",
                    },
                    {
                      internalType: "address",
                      name: "attester",
                      type: "address",
                    },
                    {
                      internalType: "bool",
                      name: "revocable",
                      type: "bool",
                    },
                    {
                      internalType: "bytes",
                      name: "data",
                      type: "bytes",
                    },
                  ],
                  internalType: "struct Attestation",
                  name: "attestation",
                  type: "tuple",
                },
              ],
              name: "attest",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [],
              name: "isPayable",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "pure",
              type: "function",
            },
            {
              inputs: [
                {
                  components: [
                    {
                      internalType: "bytes32",
                      name: "uid",
                      type: "bytes32",
                    },
                    {
                      internalType: "bytes32",
                      name: "schema",
                      type: "bytes32",
                    },
                    {
                      internalType: "uint64",
                      name: "time",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "expirationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "revocationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "bytes32",
                      name: "refUID",
                      type: "bytes32",
                    },
                    {
                      internalType: "address",
                      name: "recipient",
                      type: "address",
                    },
                    {
                      internalType: "address",
                      name: "attester",
                      type: "address",
                    },
                    {
                      internalType: "bool",
                      name: "revocable",
                      type: "bool",
                    },
                    {
                      internalType: "bytes",
                      name: "data",
                      type: "bytes",
                    },
                  ],
                  internalType: "struct Attestation[]",
                  name: "attestations",
                  type: "tuple[]",
                },
                {
                  internalType: "uint256[]",
                  name: "values",
                  type: "uint256[]",
                },
              ],
              name: "multiAttest",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [
                {
                  components: [
                    {
                      internalType: "bytes32",
                      name: "uid",
                      type: "bytes32",
                    },
                    {
                      internalType: "bytes32",
                      name: "schema",
                      type: "bytes32",
                    },
                    {
                      internalType: "uint64",
                      name: "time",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "expirationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "revocationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "bytes32",
                      name: "refUID",
                      type: "bytes32",
                    },
                    {
                      internalType: "address",
                      name: "recipient",
                      type: "address",
                    },
                    {
                      internalType: "address",
                      name: "attester",
                      type: "address",
                    },
                    {
                      internalType: "bool",
                      name: "revocable",
                      type: "bool",
                    },
                    {
                      internalType: "bytes",
                      name: "data",
                      type: "bytes",
                    },
                  ],
                  internalType: "struct Attestation[]",
                  name: "attestations",
                  type: "tuple[]",
                },
                {
                  internalType: "uint256[]",
                  name: "values",
                  type: "uint256[]",
                },
              ],
              name: "multiRevoke",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [],
              name: "owner",
              outputs: [
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "registrationSchema",
              outputs: [
                {
                  internalType: "string",
                  name: "",
                  type: "string",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "registrationSchemaUID",
              outputs: [
                {
                  internalType: "bytes32",
                  name: "",
                  type: "bytes32",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "renounceOwnership",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  components: [
                    {
                      internalType: "bytes32",
                      name: "uid",
                      type: "bytes32",
                    },
                    {
                      internalType: "bytes32",
                      name: "schema",
                      type: "bytes32",
                    },
                    {
                      internalType: "uint64",
                      name: "time",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "expirationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "uint64",
                      name: "revocationTime",
                      type: "uint64",
                    },
                    {
                      internalType: "bytes32",
                      name: "refUID",
                      type: "bytes32",
                    },
                    {
                      internalType: "address",
                      name: "recipient",
                      type: "address",
                    },
                    {
                      internalType: "address",
                      name: "attester",
                      type: "address",
                    },
                    {
                      internalType: "bool",
                      name: "revocable",
                      type: "bool",
                    },
                    {
                      internalType: "bytes",
                      name: "data",
                      type: "bytes",
                    },
                  ],
                  internalType: "struct Attestation",
                  name: "attestation",
                  type: "tuple",
                },
              ],
              name: "revoke",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "newOwner",
                  type: "address",
                },
              ],
              name: "transferOwnership",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "bytes32",
                  name: "",
                  type: "bytes32",
                },
              ],
              name: "userEmailHashToAddress",
              outputs: [
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "user",
                  type: "address",
                },
              ],
              name: "userRecordByAddress",
              outputs: [
                {
                  components: [
                    {
                      internalType: "address",
                      name: "account",
                      type: "address",
                    },
                    {
                      internalType: "string",
                      name: "name",
                      type: "string",
                    },
                    {
                      internalType: "bytes32",
                      name: "emailHash",
                      type: "bytes32",
                    },
                    {
                      internalType: "string",
                      name: "location",
                      type: "string",
                    },
                    {
                      internalType: "enum UserRole",
                      name: "role",
                      type: "uint8",
                    },
                  ],
                  internalType: "struct UserRecord",
                  name: "",
                  type: "tuple",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "string",
                  name: "email",
                  type: "string",
                },
              ],
              name: "userRecordByEmail",
              outputs: [
                {
                  components: [
                    {
                      internalType: "address",
                      name: "account",
                      type: "address",
                    },
                    {
                      internalType: "string",
                      name: "name",
                      type: "string",
                    },
                    {
                      internalType: "bytes32",
                      name: "emailHash",
                      type: "bytes32",
                    },
                    {
                      internalType: "string",
                      name: "location",
                      type: "string",
                    },
                    {
                      internalType: "enum UserRole",
                      name: "role",
                      type: "uint8",
                    },
                  ],
                  internalType: "struct UserRecord",
                  name: "",
                  type: "tuple",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "bytes32",
                  name: "userUID",
                  type: "bytes32",
                },
              ],
              name: "userRecordByUID",
              outputs: [
                {
                  components: [
                    {
                      internalType: "address",
                      name: "account",
                      type: "address",
                    },
                    {
                      internalType: "string",
                      name: "name",
                      type: "string",
                    },
                    {
                      internalType: "bytes32",
                      name: "emailHash",
                      type: "bytes32",
                    },
                    {
                      internalType: "string",
                      name: "location",
                      type: "string",
                    },
                    {
                      internalType: "enum UserRole",
                      name: "role",
                      type: "uint8",
                    },
                  ],
                  internalType: "struct UserRecord",
                  name: "",
                  type: "tuple",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
              ],
              name: "userRegistrations",
              outputs: [
                {
                  internalType: "bytes32",
                  name: "",
                  type: "bytes32",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "version",
              outputs: [
                {
                  internalType: "string",
                  name: "",
                  type: "string",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              stateMutability: "payable",
              type: "receive",
            },
          ],
        },
      },
    },
  ],
} as const;

export default contracts;
