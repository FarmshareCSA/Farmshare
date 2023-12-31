import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";

/**
 * Deploys a contract named "UserRegistry" using the deployer account
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployRegistryContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const chainId = hre.network.config.chainId;

  let eas;
  let schemaRegistry;
  let safeProxyFactory, safeSingleton, safeFallbackHandler;
  if (developmentChains.includes(hre.network.name)) {
    eas = await hre.ethers.getContract("EAS");
    schemaRegistry = await hre.ethers.getContract("SchemaRegistry");
    safeProxyFactory = await hre.ethers.getContract("SafeProxyFactory");
    safeSingleton = await hre.ethers.getContract("Safe");
    safeFallbackHandler = await hre.ethers.getContract("CompatibilityFallbackHandler");
  } else if (chainId && networkConfig[chainId]) {
    eas = await hre.ethers.getContractAt("EAS", networkConfig[chainId]["easContractAddress"]);
    schemaRegistry = await hre.ethers.getContractAt("SchemaRegistry", networkConfig[chainId]["schemaRegistryAddress"]);
    safeProxyFactory = await hre.ethers.getContractAt("SafeProxyFactory", networkConfig[chainId]["safeFactoryAddress"]);
    safeSingleton = await hre.ethers.getContractAt("Safe", networkConfig[chainId]["safeAddress"]);
    safeFallbackHandler = await hre.ethers.getContractAt(
      "CompatibilityFallbackHandler",
      networkConfig[chainId]["safeFallbackHandlerAddress"],
    );
  } else if (chainId) {
    throw new Error("No EAS contracts configured for this network.");
  } else {
    throw new Error("No chain ID found.");
  }

  await deploy("UserRegistry", {
    from: deployer,
    // Contract constructor arguments
    args: [eas.address, schemaRegistry.address],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  const userRegistry = await hre.ethers.getContract("UserRegistry", deployer);

  await deploy("FarmRegistry", {
    from: deployer,
    // Contract constructor arguments
    args: [eas.address, schemaRegistry.address, userRegistry.address],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  const farmRegistry = await hre.ethers.getContract("FarmRegistry", deployer);

  await deploy("CommunityRegistry", {
    from: deployer,
    // Contract constructor arguments
    args: [
      eas.address,
      schemaRegistry.address,
      userRegistry.address,
      farmRegistry.address,
      safeProxyFactory.address,
      safeSingleton.address,
      safeFallbackHandler.address,
    ],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  const communityRegistry = await hre.ethers.getContract("CommunityRegistry", deployer);

  await deploy("TaskRegistry", {
    from: deployer,
    // Contract constructor arguments
    args: [eas.address, schemaRegistry.address, userRegistry.address, farmRegistry.address, communityRegistry.address],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // // Get the deployed contracts
  // const userRegistry = await hre.ethers.getContract("UserRegistry", deployer);
  // const communityRegistry = await hre.ethers.getContract("CommunityRegistry", deployer);

  // // Set up links between registry contracts
  // await userRegistry.setCommunityRegistry(communityRegistry.address);
  // await communityRegistry.setUserRegistry(userRegistry.address);
};

export default deployRegistryContracts;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags RegistryContracts
deployRegistryContracts.tags = ["RegistryContracts"];
