import { utils, Wallet } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
// import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// // load env file
// import dotenv from "dotenv";
// dotenv.config();

// // load wallet private key from env file
// const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

// if (!PRIVATE_KEY)
//   throw "⛔️ Private key not detected! Add it to the .env file!";

// export default async function (hre: HardhatRuntimeEnvironment) {
//   // The wallet that will deploy the token and the paymaster
//   // It is assumed that this wallet already has sufficient funds on zkSync
//   // ⚠️ Never commit private keys to file tracking history, or your account could be compromised.
//   const wallet = new Wallet(PRIVATE_KEY);
//   // The wallet that will receive ERC20 tokens
//   const emptyWallet = Wallet.createRandom();
//   console.log(`Empty wallet's address: ${emptyWallet.address}`);
//   console.log(`Empty wallet's private key: ${emptyWallet.privateKey}`);

//   const deployer = new Deployer(hre, wallet);

//   // Deploying the paymaster
//   const paymasterArtifact = await deployer.loadArtifact("MyPaymaster");
//   const paymaster = await deployer.deploy(paymasterArtifact);
//   console.log(`Paymaster address: ${paymaster.address}`);

//   // Supplying paymaster with ETH
//   await (
//     await deployer.zkWallet.sendTransaction({
//       to: paymaster.address,
//       value: ethers.utils.parseEther("0.03"),
//     })
//   ).wait();
// }