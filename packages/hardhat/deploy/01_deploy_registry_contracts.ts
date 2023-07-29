import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
// import { ethers, upgrades } from "hardhat";

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

  await deploy("UserRegistry", {
    from: deployer,
    // Contract constructor arguments
    args: [],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  await deploy("CommunityRegistry", {
    from: deployer,
    // Contract constructor arguments
    args: [],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contracts
  const userRegistry = await hre.ethers.getContract("UserRegistry", deployer);
  const communityRegistry = await hre.ethers.getContract("CommunityRegistry", deployer);

  // Set up links between registry contracts
  await userRegistry.setCommunityRegistry(communityRegistry.address);
  await communityRegistry.setUserRegistry(userRegistry.address);
};

export default deployRegistryContracts;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployRegistryContracts.tags = ["UserRegistry"];
