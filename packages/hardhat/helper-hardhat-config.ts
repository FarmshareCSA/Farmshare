export interface networkConfigItem {
  name?: string;
  easContractAddress?: string;
  schemaRegistryAddress?: string;
  donationResolverAddress?: string;
}

export interface networkConfigInfo {
  [key: number]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
  31337: {
    name: "localhost",
  },
  11155111: {
    name: "sepolia",
    easContractAddress: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
    schemaRegistryAddress: "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0",
    donationResolverAddress: "0x932C90f9C801535Fe1160921Ec4043AA7b64F75E",
  },
};

export const developmentChains = ["hardhat", "localhost"];
export const VERIFICATION_BLOCK_CONFIRMATIONS = 6;
