import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  const userRegistry = await hre.ethers.getContract("UserRegistry", deployer);
  const farmRegistry = await hre.ethers.getContract("FarmRegistry", deployer);
  const taskRegistry = await hre.ethers.getContract("TaskRegistry", deployer);

  await deploy("FarmShareTokens", {
    from: deployer,
    args: [userRegistry.address, farmRegistry.address, taskRegistry.address],
    log: true,
    deterministicDeployment: true,
  });

  await deploy("TestUSDC", {
    from: deployer,
    args: [],
    log: true,
    deterministicDeployment: true,
  });

  await deploy("WETH9", {
    from: deployer,
    args: [],
    log: true,
    deterministicDeployment: true,
  });

  const farmShareTokens = await hre.ethers.getContract("FarmShareTokens", deployer);
  await taskRegistry.setFarmShareTokens(farmShareTokens.address);
};

deploy.tags = ["tokens"];
export default deploy;
