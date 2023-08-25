import { utils, Wallet } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

// export default async function (hre: HardhatRuntimeEnvironment) {
//   // Private key of the account used to deploy
//   const wallet = new Wallet("<WALLET_PRIVATE_KEY>");

//   const { deployer } = await hre.getNamedAccounts();
//   const { deploy } = hre.deployments;

//   await deploy("AAFactory", {
//       from: deployer,
//       // Contract constructor arguments
//       args: [aaArtifact.bytecode],
//       log: true,
//       // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
//       // automatically mining the contract deployment transaction. There is no effect on live networks.
//       autoMine: true,
//     });
//     const registryContract = await ethers.getContract("SchemaRegistry");
    

//   // Getting the bytecodeHash of the account
//   const bytecodeHash = utils.hashBytecode(aaArtifact.bytecode);

//   const factory = await deployer.deploy(factoryArtifact, [bytecodeHash], undefined, [
//     // Since the factory requires the code of the multisig to be available,
//     // we should pass it here as well.
//     aaArtifact.bytecode,
//   ]);

//   console.log(`AA factory address: ${factory.address}`);
// }