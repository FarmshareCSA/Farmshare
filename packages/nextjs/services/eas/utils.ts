import { Task, TaskReward } from "./customSchemaTypes";
import type { Attestation, AttestationResult, EASChainConfig, MyAttestationResult } from "./types";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import axios from "axios";
import invariant from "tiny-invariant";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

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
  {
    chainId: 84531,
    chainName: "base-goerli",
    subdomain: "base-goerli.",
    version: "0.26",
    contractAddress: "0xAcfE09Fd03f7812F022FBf636700AdEA18Fd2A7A",
    schemaRegistryAddress: "0x720c2bA66D19A725143FBf5fDC5b4ADA2742682E",
    etherscanURL: "https://goerli.basescan.io",
    contractStartBlock: 4843438,
    rpcProvider: `https://base-goerli.public.blastapi.io`,
  },
];

invariant(chain, "No supported chain connected");
export const activeChainConfig = EAS_CHAIN_CONFIGS.find(config => config.chainId === chain.id);

export const baseURL = `https://${activeChainConfig!.subdomain}easscan.org`;

invariant(activeChainConfig, "No chain config found for chain ID");
export const EASContractAddress = activeChainConfig.contractAddress;

export const EASVersion = activeChainConfig.version;

export const EAS_CONFIG = {
  address: EASContractAddress,
  version: EASVersion,
  chainId: chain.id,
};

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
    },
  );
  return response.data.data.attestation;
}

export async function getUserAttestationsForAddress(address: string, schema: string) {
  const response = await axios.post<MyAttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        "query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  }\n}",

      variables: {
        where: {
          schemaId: {
            equals: schema,
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
    },
  );
  return response.data.data.attestations;
}

export async function getCommunityMembershipAttestation(
  address: string,
  communityUID: string,
  membershipSchema: string,
) {
  const response = await axios.post<MyAttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        "query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  }\n}",

      variables: {
        where: {
          schemaId: {
            equals: membershipSchema,
          },
          recipient: {
            equals: address,
          },
          refUID: {
            equals: communityUID,
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
    },
  );
  return response.data.data.attestations;
}

export async function getAllAttestationsForSchema(schema: string) {
  const response = await axios.post<MyAttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        "query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  }\n}",

      variables: {
        where: {
          schemaId: {
            equals: schema,
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
    },
  );
  return response.data.data.attestations;
}

export async function getTasksForCommunity(
  communityUID: string,
  taskSchemaUID: string,
  rewardSchemaUID: string,
  taskSchemaEncoder: SchemaEncoder,
  rewardSchemaEncoder: SchemaEncoder,
) {
  const response = await axios.post<MyAttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        "query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  }\n}",

      variables: {
        where: {
          schemaId: {
            equals: taskSchemaUID,
          },
          refUID: {
            equals: communityUID,
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
    },
  );
  const tasks: Task[] = [];
  const taskAttestations = response.data.data.attestations;
  for (const taskAttestation of taskAttestations) {
    const taskData = taskSchemaEncoder.decodeData(taskAttestation.data);
    // Get rewards
    const response2 = await axios.post<MyAttestationResult>(
      `${baseURL}/graphql`,
      {
        query:
          "query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  }\n}",

        variables: {
          where: {
            schemaId: {
              equals: rewardSchemaUID,
            },
            refUID: {
              equals: taskAttestation.id,
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
      },
    );
    const rewardAttestations = response2.data.data.attestations;
    // Decode rewards
    const rewards = rewardAttestations.map(rewardAttestation => {
      const rewardData = rewardSchemaEncoder.decodeData(rewardAttestation.data);
      return {
        uid: rewardAttestation.id,
        taskUID: taskAttestation.id,
        tokenAddress: rewardData[0].value.value.toString(),
        isErc1155: rewardData[1].value.value == true,
        isErc20: rewardData[2].value.value == true,
        amount: parseInt(rewardData[3].value.value.toString()),
        tokenId: parseInt(rewardData[4].value.value.toString()),
        tokenName: rewardData[5].value.value.toString(),
      } as TaskReward;
    });
    tasks.push({
      uid: taskAttestation.id,
      communityUID: communityUID,
      name: taskData[1].value.value.toString(),
      description: taskData[2].value.value.toString(),
      creator: taskData[3].value.value.toString(),
      startTime: parseInt(taskData[4].value.value.toString()),
      endTime: parseInt(taskData[5].value.value.toString()),
      recurring: taskData[6].value.value == true,
      frequency: parseInt(taskData[7].value.value.toString()),
      imageURL: taskData[8].value.value.toString(),
      rewards: rewards,
    });
  }
  return tasks;
}

export async function getSkillUIDByName(
  skillName: string,
  userRegistryAddress: string,
  skillRecordSchema: string,
  schemaEncoder: SchemaEncoder,
) {
  console.log("Skill name: %s", skillName);
  const response = await axios.post<MyAttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        "query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  }\n}",

      variables: {
        where: {
          schemaId: {
            equals: skillRecordSchema,
          },
          recipient: {
            equals: userRegistryAddress,
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
    },
  );
  for (let i = 0; i < response.data.data.attestations.length; i++) {
    const attestation = response.data.data.attestations[i];
    const decodedData = schemaEncoder.decodeData(attestation.data);
    console.log("Decoded data");
    console.log(decodedData);
    if (decodedData[0] && decodedData[0].value.value.toString() == skillName) {
      return attestation.id;
    }
  }
  return "";
}
