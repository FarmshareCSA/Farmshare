export interface networkConfigItem {
  name: string;
  easContractAddress: string;
  schemaRegistryAddress: string;
}

export interface networkConfigInfo {
  [key: number]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
  31337: {
    name: "localhost",
    easContractAddress: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
    schemaRegistryAddress: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"
  },
  280: {
    name: "zksync era testnet",
    easContractAddress: "0x87A33bc39A49Bd3e50aa053Bee91a988A510ED6a",
    schemaRegistryAddress: "0x11619C020e98c9B6055f9fc82D4761259e760189"
  },
  11155111: {
    name: "sepolia",
    easContractAddress: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
    schemaRegistryAddress: "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0",
  },
};

export const developmentChains = ["hardhat", "localhost"];
export const VERIFICATION_BLOCK_CONFIRMATIONS = 6;
