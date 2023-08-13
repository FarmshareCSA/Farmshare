export interface networkConfigItem {
  name: string;
  easContractAddress: string;
  schemaRegistryAddress: string;
  safeAddress: string;
  safeFactoryAddress: string;
  safeFallbackHandlerAddress: string;
}

export interface networkConfigInfo {
  [key: number]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
  31337: {
    name: "localhost",
    easContractAddress: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
    schemaRegistryAddress: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
    safeAddress: "0x0",
    safeFactoryAddress: "0x0",
    safeFallbackHandlerAddress: "0x0",
  },
  280: {
    name: "zksync era testnet",
    easContractAddress: "0x87A33bc39A49Bd3e50aa053Bee91a988A510ED6a",
    schemaRegistryAddress: "0x11619C020e98c9B6055f9fc82D4761259e760189",
    safeAddress: "0x11e7507Cc687ACd59638Ff5046532F9a8fDe7314",
    safeFactoryAddress: "0xbc5F85521BC978A7Dd480FB0337a6426379B9A09",
    safeFallbackHandlerAddress: "0xA636D5dC32A4a989cB3be51F144FD9e1e6c846f3",
  },
  11155111: {
    name: "sepolia",
    easContractAddress: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
    schemaRegistryAddress: "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0",
    safeAddress: "0x9fb6Eacdd0DAC54f37D9852eAD55dc25495D3e62",
    safeFactoryAddress: "0x38dF3ac5Bf7a46Fed3f28ef5f68D6494174dDe09",
    safeFallbackHandlerAddress: "0x4F7B35969Fd796ce07021220A77ec5Ff8d02858a"
  },
  84531: {
    name: "base goerli",
    easContractAddress: "0xAcfE09Fd03f7812F022FBf636700AdEA18Fd2A7A",
    schemaRegistryAddress: "0x720c2bA66D19A725143FBf5fDC5b4ADA2742682E",
    safeAddress: "0x110418c98832Ce96b67384fC8C0F7A30e67eac64",
    safeFactoryAddress: "0xb2F04C53f4622e1dE99659FC2de7343EF53Bb816",
    safeFallbackHandlerAddress: "0x3ef0C82dd951d40c8400D6E67f5bF14c254e2d49",
  }
};

export const developmentChains = ["hardhat", "localhost"];
export const VERIFICATION_BLOCK_CONFIRMATIONS = 6;
