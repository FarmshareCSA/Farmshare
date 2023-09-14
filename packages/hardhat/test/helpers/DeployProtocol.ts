import { ethers } from "hardhat";
import {
  UserRegistry,
  FarmRegistry,
  CommunityRegistry,
  TaskRegistry,
  FarmShareTokens,
  EAS,
  SchemaRegistry,
  Safe,
  SafeProxyFactory,
  CompatibilityFallbackHandler,
  WETH9,
} from "../../typechain-types";

export const deployProtocol = async () => {
  const [deployer] = await ethers.getSigners();

  const userRegistryFactory = await ethers.getContractFactory("UserRegistry", deployer);
  const farmRegistryFactory = await ethers.getContractFactory("FarmRegistry", deployer);
  const communityRegistryFactory = await ethers.getContractFactory("CommunityRegistry", deployer);
  const taskRegistryFactory = await ethers.getContractFactory("TaskRegistry", deployer);
  const farmShareTokensFactory = await ethers.getContractFactory("FarmShareTokens", deployer);
  const easContractFactory = await ethers.getContractFactory("EAS", deployer);
  const schemaRegistryFactory = await ethers.getContractFactory("SchemaRegistry", deployer);
  const safeFactory = await ethers.getContractFactory("Safe", deployer);
  const safeProxyFactoryFactory = await ethers.getContractFactory("SafeProxyFactory", deployer);
  const safeFallbackHandlerFactory = await ethers.getContractFactory("CompatibilityFallbackHandler", deployer);
  const wethFactory = await ethers.getContractFactory("WETH9", deployer);

  // Deploy EAS contracts
  const schemaRegistry = (await schemaRegistryFactory.deploy()) as SchemaRegistry;
  const schemaRegistryAddress = schemaRegistry.address;
  const eas = (await easContractFactory.deploy(schemaRegistryAddress)) as EAS;
  const easAddress = eas.address;

  // Deploy Safe contracts
  const safeSingleton = (await safeFactory.deploy()) as Safe;
  const safeSingletonAddress = safeSingleton.address;
  const safeProxyFactory = (await safeProxyFactoryFactory.deploy()) as SafeProxyFactory;
  const safeProxyFactoryAddress = safeProxyFactory.address;
  const safeFallbackHandler = (await safeFallbackHandlerFactory.deploy()) as CompatibilityFallbackHandler;
  const safeFallbackHandlerAddress = safeFallbackHandler.address;

  // Deploy registries
  const userRegistry = (await userRegistryFactory.deploy(easAddress, schemaRegistryAddress)) as UserRegistry;
  const userRegistryAddress = userRegistry.address;

  const farmRegistry = (await farmRegistryFactory.deploy(
    easAddress,
    schemaRegistryAddress,
    userRegistryAddress,
  )) as FarmRegistry;
  const farmRegistryAddress = farmRegistry.address;

  const communityRegistry = (await communityRegistryFactory.deploy(
    easAddress,
    schemaRegistryAddress,
    userRegistryAddress,
    farmRegistryAddress,
    safeProxyFactoryAddress,
    safeSingletonAddress,
    safeFallbackHandlerAddress,
  )) as CommunityRegistry;
  const communityRegistryAddress = communityRegistry.address;

  const taskRegistry = (await taskRegistryFactory.deploy(
    easAddress,
    schemaRegistryAddress,
    userRegistryAddress,
    farmRegistryAddress,
    communityRegistryAddress,
  )) as TaskRegistry;
  const taskRegistryAddress = taskRegistry.address;

  // Deploy FarmShareTokens
  const farmShareTokens = (await farmShareTokensFactory.deploy(
    userRegistryAddress,
    farmRegistryAddress,
    taskRegistryAddress,
  )) as FarmShareTokens;
  const farmShareTokensAddress = farmShareTokens.address;

  await taskRegistry.setFarmShareTokens(farmShareTokensAddress);

  // Deploy WETH
  const weth = (await wethFactory.deploy()) as WETH9;

  return {
    schemaRegistry: schemaRegistry,
    eas: eas,
    userRegistry: userRegistry,
    farmRegistry: farmRegistry,
    communityRegistry: communityRegistry,
    taskRegistry: taskRegistry,
    farmShareTokens: farmShareTokens,
    weth: weth,
  };
};
