import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;
  const chainId = hre.network.config.chainId;

  if (developmentChains.includes(hre.network.name)) {
    await deploy("SafeProxyFactory", {
      from: deployer,
      args: [],
      log: true,
      deterministicDeployment: true,
    });

    await deploy("Safe", {
      from: deployer,
      args: [],
      log: true,
      deterministicDeployment: true,
    });

    await deploy("CompatibilityFallbackHandler", {
      from: deployer,
      args: [],
      log: true,
      deterministicDeployment: true,
    });
  }
};

deploy.tags = ["safe"];
export default deploy;
