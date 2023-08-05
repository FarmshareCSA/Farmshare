import invariant from "tiny-invariant";
import type {
  Attestation,
  AttestationResult,
  EASChainConfig,
  MyAttestationResult,
} from "./types";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import axios from "axios";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

const chain = getTargetNetwork();

export const EAS_CHAIN_CONFIGS: EASChainConfig[] = [
    {
      chainId: 11155111,
      chainName: "sepolia",
      subdomain: "sepolia.",
      version: "0.26",
      contractAddress: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
      schemaRegistryAddress: "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0",
      etherscanURL: "https://sepolia.etherscan.io",
      contractStartBlock: 2958570,
      rpcProvider: `https://sepolia.infura.io/v3/`,
    },
];

invariant(chain, "No supported chain connected")
export const activeChainConfig = EAS_CHAIN_CONFIGS.find(
    (config) => config.chainId === chain.id
);

export const baseURL = `https://${activeChainConfig!.subdomain}easscan.org`;

invariant(activeChainConfig, "No chain config found for chain ID");
export const EASContractAddress = activeChainConfig.contractAddress;

export const EASVersion = activeChainConfig.version;

export const EAS_CONFIG = {
  address: EASContractAddress,
  version: EASVersion,
  chainId: chain.id,
};

export const CUSTOM_SCHEMAS = {
    USER_REGISTRATION_SCHEMA: "0xa1bcdf5b69bb07822297df0a172e90fdd02b19b13780be86281b17a78d0687ed"
}

export async function getAttestation(uid: string): Promise<Attestation | null> {
    const response = await axios.post<AttestationResult>(
      `${baseURL}/graphql`,
      {
        query:
          "query Query($where: AttestationWhereUniqueInput!) {\n  attestation(where: $where) {\n    id\n    attester\n    recipient\n    revocationTime\n    expirationTime\n    time\n    txid\n    data\n  }\n}",
        variables: {
          where: {
            id: uid,
          },
        },
      },
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );
    return response.data.data.attestation;
}

export async function getUserAttestationsForAddress(address: string) {
    const response = await axios.post<MyAttestationResult>(
      `${baseURL}/graphql`,
      {
        query:
          "query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  }\n}",
  
        variables: {
          where: {
            schemaId: {
              equals: CUSTOM_SCHEMAS.USER_REGISTRATION_SCHEMA,
            },
            recipient: {
                equals: address,
            },
          },
          orderBy: [
            {
              time: "desc",
            },
          ],
        },
      },
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );
    return response.data.data.attestations;
  }