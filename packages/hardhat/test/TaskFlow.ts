import { expect } from "chai";
import { ethers } from "hardhat";
import {
  UserRegistry,
  FarmRegistry,
  TaskRegistry,
  FarmShareTokens,
  CommunityRegistry,
  EAS,
  WETH9,
} from "../typechain-types";
import { deployProtocol } from "./helpers/DeployProtocol";
import { Signer } from "ethers";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { expectAttestation, expectFailedAttestation } from "./helpers/EAS";
import { FarmRecordStructOutput } from "../typechain-types/contracts/FarmRegistry";
import { CommunityStructOutput } from "../typechain-types/contracts/CommunityRegistry";
import { now } from "moment";
import { TaskStructOutput } from "../typechain-types/contracts/TaskRegistry";
import { parseEther } from "ethers/lib/utils";

describe("FarmShare task flow", function () {
  let deployer: Signer;
  let farmer: Signer;
  let user: Signer;
  let easContract: EAS;
  let userRegistryContract: UserRegistry;
  let farmRegistryContract: FarmRegistry;
  let communityRegistryContract: CommunityRegistry;
  let taskRegistryContract: TaskRegistry;
  let farmShareTokensContract: FarmShareTokens;
  let wethContract: WETH9;

  before(async () => {
    [deployer, farmer, user] = await ethers.getSigners();
  });

  beforeEach(async () => {
    // Deploy contracts
    let { eas, userRegistry, farmRegistry, communityRegistry, taskRegistry, farmShareTokens, weth } =
      await deployProtocol();
    easContract = eas;
    userRegistryContract = userRegistry;
    farmRegistryContract = farmRegistry;
    communityRegistryContract = communityRegistry;
    taskRegistryContract = taskRegistry;
    farmShareTokensContract = farmShareTokens;
    wethContract = weth;
  });

  describe("Construction", () => {
    it("Initializes contracts correctly", async () => {
      const deployerAddress = await deployer.getAddress();
      expect(await userRegistryContract.owner()).to.equal(deployerAddress);
      expect(await farmRegistryContract.owner()).to.equal(deployerAddress);
      expect(await farmRegistryContract.userRegistry()).to.equal(userRegistryContract.address);
      expect(await communityRegistryContract.owner()).to.equal(deployerAddress);
      expect(await communityRegistryContract.userRegistry()).to.equal(userRegistryContract.address);
      expect(await communityRegistryContract.farmRegistry()).to.equal(farmRegistryContract.address);
      expect(await taskRegistryContract.owner()).to.equal(deployerAddress);
      expect(await taskRegistryContract.userRegistry()).to.equal(userRegistryContract.address);
      expect(await taskRegistryContract.farmRegistry()).to.equal(farmRegistryContract.address);
      expect(await taskRegistryContract.communityRegistry()).to.equal(communityRegistryContract.address);
      expect(await taskRegistryContract.shareTokens()).to.equal(farmShareTokensContract.address);
      expect(await farmShareTokensContract.userRegistry()).to.equal(userRegistryContract.address);
      expect(await farmShareTokensContract.farmRegistry()).to.equal(farmRegistryContract.address);
      expect(await farmShareTokensContract.taskRegistry()).to.equal(taskRegistryContract.address);
    });
  });

  describe("User Registrations", () => {
    let userRegistrationSchemaUID: string;
    let userUID: string;
    let farmerUID: string;
    const userSchemaEncoder = new SchemaEncoder(
      "address account,string name,bytes32 emailHash,string location,uint8 role",
    );

    beforeEach(async () => {
      userRegistrationSchemaUID = await userRegistryContract.registrationSchemaUID();
      let encodedData = userSchemaEncoder.encodeData([
        { name: "account", value: await user.getAddress(), type: "address" },
        { name: "name", value: "Alice User", type: "string" },
        {
          name: "emailHash",
          value: "0x0102030405060708091011121314151617181920212223242526272829303132",
          type: "bytes32",
        },
        { name: "location", value: "", type: "string" },
        { name: "role", value: "1", type: "uint8" },
      ]);
      let { uid: _userUID } = await expectAttestation(
        easContract,
        userRegistrationSchemaUID,
        {
          recipient: await user.getAddress(),
          expirationTime: BigInt(0),
          data: encodedData,
        },
        { from: user },
      );
      userUID = _userUID;
      const userRecord = await userRegistryContract.userRecordByUID(userUID);
      expect(userRecord.account).to.equal(await user.getAddress());
      expect(userRecord.name).to.equal("Alice User");
      encodedData = userSchemaEncoder.encodeData([
        { name: "account", value: await farmer.getAddress(), type: "address" },
        { name: "name", value: "Bob Farmer", type: "string" },
        {
          name: "emailHash",
          value: "0x0001020304050607080910111213141516171819202122232425262728293031",
          type: "bytes32",
        },
        { name: "location", value: "", type: "string" },
        { name: "role", value: "4", type: "uint8" },
      ]);
      let { uid: _farmerUID } = await expectAttestation(
        easContract,
        userRegistrationSchemaUID,
        {
          recipient: await farmer.getAddress(),
          expirationTime: BigInt(0),
          data: encodedData,
        },
        { from: farmer },
      );
      farmerUID = _farmerUID;
      const farmerRecord = await userRegistryContract.userRecordByUID(farmerUID);
      expect(farmerRecord.account).to.equal(await farmer.getAddress());
      expect(farmerRecord.name).to.equal("Bob Farmer");
    });

    it("Does not allow the user to register again with the same address", async () => {
      userRegistrationSchemaUID = await userRegistryContract.registrationSchemaUID();
      let encodedData = userSchemaEncoder.encodeData([
        { name: "account", value: await user.getAddress(), type: "address" },
        { name: "name", value: "Alice User", type: "string" },
        {
          name: "emailHash",
          value: "0x0102030405060708091011121314151617181920212223242526272829303132",
          type: "bytes32",
        },
        { name: "location", value: "", type: "string" },
        { name: "role", value: "1", type: "uint8" },
      ]);
      await expectFailedAttestation(
        easContract,
        userRegistrationSchemaUID,
        {
          recipient: await user.getAddress(),
          expirationTime: BigInt(0),
          data: encodedData,
        },
        { from: user },
        "User already registered",
      );
    });

    describe("Farm Registration", () => {
      let farmRegistrationSchemaUID: string;
      let farmUID: string;
      let farmRecord: FarmRecordStructOutput;
      const farmSchemaEncoder = new SchemaEncoder(
        "bytes32 ownerUID,string name,string description,string streetAddress,string city,string state,string country,string postalCode,string latAndLong,string websiteUrl,string imageUrl",
      );

      beforeEach(async () => {
        farmRegistrationSchemaUID = await farmRegistryContract.registrationSchemaUID();
        let encodedData = farmSchemaEncoder.encodeData([
          { name: "ownerUID", value: farmerUID, type: "bytes32" },
          { name: "name", value: "Bob's Farm", type: "string" },
          { name: "description", value: "Bob's Farm description", type: "string" },
          { name: "streetAddress", value: "123 Farm St.", type: "string" },
          { name: "city", value: "Farmville", type: "string" },
          { name: "state", value: "CA", type: "string" },
          { name: "country", value: "US", type: "string" },
          { name: "postalCode", value: "90210", type: "string" },
          { name: "latAndLong", value: "37.7868,-122.405", type: "string" },
          { name: "websiteUrl", value: "https://bob.farm", type: "string" },
          { name: "imageUrl", value: "https://bob.farm/image.png", type: "string" },
        ]);
        let { uid: _farmUID } = await expectAttestation(
          easContract,
          farmRegistrationSchemaUID,
          {
            recipient: await farmer.getAddress(),
            expirationTime: BigInt(0),
            data: encodedData,
          },
          { from: farmer },
        );
        farmUID = _farmUID;
        farmRecord = await farmRegistryContract.farmRecordByUID(farmUID);
      });

      it("Stores the farm record correctly", async () => {
        expect(farmRecord.farmOwner).to.equal(await farmer.getAddress());
        expect(farmRecord.farmName).to.equal("Bob's Farm");
        expect(farmRecord.description).to.equal("Bob's Farm description");
        expect(farmRecord.streetAddress).to.equal("123 Farm St.");
        expect(farmRecord.city).to.equal("Farmville");
        expect(farmRecord.state).to.equal("CA");
        expect(farmRecord.country).to.equal("US");
        expect(farmRecord.postalCode).to.equal("90210");
        expect(farmRecord.latAndLong).to.equal("37.7868,-122.405");
        expect(farmRecord.websiteUrl).to.equal("https://bob.farm");
        expect(farmRecord.imageUrl).to.equal("https://bob.farm/image.png");
      });

      it("Retrieves the farm record correctly", async () => {
        let farmRecord2 = await farmRegistryContract.farmRecordByOwnerAddress(await farmer.getAddress());
        expect(farmRecord2.farmOwner).to.equal(farmRecord.farmOwner);
        expect(farmRecord2.farmName).to.equal(farmRecord.farmName);
        let farmRecord3 = await farmRegistryContract.farmRecordByName("Bob's Farm");
        expect(farmRecord3.farmOwner).to.equal(farmRecord.farmOwner);
        expect(farmRecord3.farmName).to.equal(farmRecord.farmName);
      });

      it("Does not allow another farm registration with the same name", async () => {
        farmRegistrationSchemaUID = await farmRegistryContract.registrationSchemaUID();
        let encodedData = farmSchemaEncoder.encodeData([
          { name: "ownerUID", value: farmerUID, type: "bytes32" },
          { name: "name", value: "Bob's Farm", type: "string" },
          { name: "description", value: "Bob's Farm description", type: "string" },
          { name: "streetAddress", value: "123 Farm St.", type: "string" },
          { name: "city", value: "Farmville", type: "string" },
          { name: "state", value: "CA", type: "string" },
          { name: "country", value: "US", type: "string" },
          { name: "postalCode", value: "90210", type: "string" },
          { name: "latAndLong", value: "37.7868,-122.405", type: "string" },
          { name: "websiteUrl", value: "https://bob.farm", type: "string" },
          { name: "imageUrl", value: "https://bob.farm/image.png", type: "string" },
        ]);
        await expect(
          expectAttestation(
            easContract,
            farmRegistrationSchemaUID,
            {
              recipient: await farmer.getAddress(),
              expirationTime: BigInt(0),
              data: encodedData,
            },
            { from: farmer },
          ),
        ).to.be.revertedWith("Farm name already registered");
      });

      it("Does not allow a farm to register without a name", async () => {
        let encodedData = farmSchemaEncoder.encodeData([
          { name: "ownerUID", value: farmerUID, type: "bytes32" },
          { name: "name", value: "", type: "string" },
          { name: "description", value: "Bob's Farm description", type: "string" },
          { name: "streetAddress", value: "123 Farm St.", type: "string" },
          { name: "city", value: "Farmville", type: "string" },
          { name: "state", value: "CA", type: "string" },
          { name: "country", value: "US", type: "string" },
          { name: "postalCode", value: "90210", type: "string" },
          { name: "latAndLong", value: "37.7868,-122.405", type: "string" },
          { name: "websiteUrl", value: "https://bob.farm", type: "string" },
          { name: "imageUrl", value: "https://bob.farm/image.png", type: "string" },
        ]);
        await expect(
          expectAttestation(
            easContract,
            farmRegistrationSchemaUID,
            {
              recipient: await farmer.getAddress(),
              expirationTime: BigInt(0),
              data: encodedData,
            },
            { from: farmer },
          ),
        ).to.be.revertedWith("Farm name cannot be empty");
      });

      it("Does not allow Alice to register a farm as a non-farmer", async () => {
        let encodedData = farmSchemaEncoder.encodeData([
          { name: "ownerUID", value: userUID, type: "bytes32" },
          { name: "name", value: "Alice's Farm", type: "string" },
          { name: "description", value: "Alice's Farm description", type: "string" },
          { name: "streetAddress", value: "123 Farm St.", type: "string" },
          { name: "city", value: "Farmville", type: "string" },
          { name: "state", value: "CA", type: "string" },
          { name: "country", value: "US", type: "string" },
          { name: "postalCode", value: "90210", type: "string" },
          { name: "latAndLong", value: "37.7868,-122.405", type: "string" },
          { name: "websiteUrl", value: "https://alice.farm", type: "string" },
          { name: "imageUrl", value: "https://alice.farm/image.png", type: "string" },
        ]);
        await expect(
          expectAttestation(
            easContract,
            farmRegistrationSchemaUID,
            {
              recipient: await farmer.getAddress(),
              expirationTime: BigInt(0),
              data: encodedData,
            },
            { from: farmer },
          ),
        ).to.be.revertedWith("User must be a farmer");
      });

      it("Sets authorizedFarmerOrManager correctly", async () => {
        expect(await farmRegistryContract.authorizedFarmerOrManager(farmUID, await farmer.getAddress())).to.be.true;
        expect(await farmRegistryContract.authorizedFarmerOrManager(farmUID, await user.getAddress())).to.be.false;
      });

      describe("Community Registration", () => {
        let communityRegistrationSchemaUID: string;
        let memberSchemaUID: string;
        let communityUID: string;
        let community: CommunityStructOutput;
        const communitySchemaEncoder = new SchemaEncoder(
          "string name,string description,string city,string state,string country,string postalCode,string websiteURL,string imageURL",
        );
        const memberSchemaEncoder = new SchemaEncoder("bytes32 userUID,uint8 memberRole");

        beforeEach(async () => {
          communityRegistrationSchemaUID = await communityRegistryContract.registrationSchemaUID();
          memberSchemaUID = await communityRegistryContract.memberSchemaUID();
          let encodedData = communitySchemaEncoder.encodeData([
            { name: "name", value: "Farmville Community", type: "string" },
            { name: "description", value: "Farmville Community description", type: "string" },
            { name: "city", value: "Farmville", type: "string" },
            { name: "state", value: "CA", type: "string" },
            { name: "country", value: "US", type: "string" },
            { name: "postalCode", value: "90210", type: "string" },
            { name: "websiteURL", value: "https://community.farm", type: "string" },
            { name: "imageURL", value: "https://community.farm/image.png", type: "string" },
          ]);
          let { uid: _communityUID } = await expectAttestation(
            easContract,
            communityRegistrationSchemaUID,
            {
              recipient: await farmer.getAddress(),
              revocable: false,
              expirationTime: BigInt(0),
              data: encodedData,
            },
            { from: farmer },
          );
          communityUID = _communityUID;
          community = await communityRegistryContract.communityByUID(communityUID);
          encodedData = memberSchemaEncoder.encodeData([
            { name: "userUID", value: farmerUID, type: "bytes32" },
            { name: "memberRole", value: "4", type: "uint8" },
          ]);
          await expectAttestation(
            easContract,
            memberSchemaUID,
            {
              recipient: await farmer.getAddress(),
              revocable: true,
              refUID: communityUID,
              expirationTime: BigInt(0),
              data: encodedData,
            },
            { from: farmer },
          );
        });

        it("Stores the community record correctly", async () => {
          expect(community.name).to.equal("Farmville Community");
          expect(community.description).to.equal("Farmville Community description");
          expect(community.city).to.equal("Farmville");
          expect(community.state).to.equal("CA");
          expect(community.country).to.equal("US");
          expect(community.postalCode).to.equal("90210");
          expect(community.websiteUrl).to.equal("https://community.farm");
          expect(community.imageUrl).to.equal("https://community.farm/image.png");
        });

        it("Creates a community treasury correctly", async () => {
          const tx = await communityRegistryContract.createTreasury(communityUID, [await farmer.getAddress()]);
          const txReceipt = await tx.wait();
          expect(txReceipt.events?.length).to.equal(4);
          if (txReceipt.events && txReceipt.events.length == 4 && txReceipt.events[3].args) {
            const treasuryUID = await communityRegistryContract.treasuryUIDByCommunityUID(communityUID);
            const treasuryAddress = await communityRegistryContract.communityTreasuryByName(community.name);
            expect(txReceipt.events[3].args[0]).to.equal(treasuryUID);
            expect(txReceipt.events[3].args[1]).to.equal(community.name);
            expect(txReceipt.events[3].args[2]).to.equal(communityUID);
            expect(txReceipt.events[3].args[3]).to.equal(treasuryAddress);
            expect(txReceipt.events[3].args[4][0]).to.equal(await farmer.getAddress());
          }
        });

        describe("Community Task Management", async () => {
          let taskCreationSchemaUID: string;
          let taskFundedSchemaUID: string;
          let taskApplicationSchemaUID: string;
          let taskStartedSchemaUID: string;
          let taskCompletedSchemaUID: string;
          let taskUID: string;
          let rewardUID: string;
          let task: TaskStructOutput;
          const taskSchemaEncoder = new SchemaEncoder(
            "bytes32 communityUID,string name,string description,address creator,uint256 startTime,uint256 endTime,bool recurring,uint256 frequency,string imageURL",
          );
          const fundedSchemaEncoder = new SchemaEncoder(
            "address tokenAddress,bool isErc1155,bool isErc20,uint256 amount,uint256 tokenId,string tokenName",
          );
          const applicationSchemaEncoder = new SchemaEncoder("bytes32 taskUID,bytes32 userUID,bytes32[] skillUIDs");
          const startedSchemaEncoder = new SchemaEncoder("bytes32 taskUID,bytes32 userUID,uint256 startTimestamp");
          const completedSchemaEncoder = new SchemaEncoder("bytes32 taskUID,bytes32 userUID,uint256 completeTimestamp");

          beforeEach(async () => {
            taskCreationSchemaUID = await taskRegistryContract.taskCreationSchemaUID();
            taskFundedSchemaUID = await taskRegistryContract.taskFundedSchemaUID();
            taskApplicationSchemaUID = await taskRegistryContract.taskApplicationSchemaUID();
            taskStartedSchemaUID = await taskRegistryContract.taskStartedSchemaUID();
            taskCompletedSchemaUID = await taskRegistryContract.taskCompletedSchemaUID();

            // Create task
            let encodedData = taskSchemaEncoder.encodeData([
              { name: "communityUID", value: communityUID, type: "bytes32" },
              { name: "name", value: "Delivery", type: "string" },
              { name: "description", value: "Task description", type: "string" },
              { name: "creator", value: await farmer.getAddress(), type: "address" },
              { name: "startTime", value: now(), type: "uint256" },
              { name: "endTime", value: now() + 7 * 86400, type: "uint256" },
              { name: "recurring", value: false, type: "bool" },
              { name: "frequency", value: 0, type: "uint256" },
              { name: "imageURL", value: "https://bob.farm/delivery.png", type: "string" },
            ]);
            let { uid: _taskUID } = await expectAttestation(
              easContract,
              taskCreationSchemaUID,
              {
                recipient: await farmer.getAddress(),
                revocable: false,
                expirationTime: BigInt(0),
                data: encodedData,
              },
              { from: farmer },
            );
            taskUID = _taskUID;
            task = await taskRegistryContract.taskByUID(taskUID);
          });

          it("Creates and funds a task with farm shares", async () => {
            // Fund task
            const tx = await taskRegistryContract.connect(farmer).fundTaskWithFarmShares(taskUID, farmUID, 1 * 1e2);
            const txReceipt = await tx.wait();
            expect(txReceipt.events?.length).to.equal(3);
            if (txReceipt.events && txReceipt.events.length == 3 && txReceipt.events[2].args) {
              expect(txReceipt.events[2].args[0]).to.equal(taskUID);
              expect(txReceipt.events[2].args[2]).to.equal(farmShareTokensContract.address);
              expect(txReceipt.events[2].args[3]).to.be.true;
              expect(txReceipt.events[2].args[5]).to.equal(100);
              expect(txReceipt.events[2].args[6]).to.equal(farmUID);
              rewardUID = txReceipt.events[2].args[1];
              expect(await taskRegistryContract.taskRewardUIDsByTaskUID(taskUID, 0)).to.equal(rewardUID);
              expect(await farmShareTokensContract.balanceOf(taskRegistryContract.address, farmUID)).to.equal(100);
            }
          });

          it("Creates and funds a task with WETH", async () => {
            // Get WETH
            let tx = await wethContract.connect(user).deposit({ value: parseEther("1") });
            let txReceipt = await tx.wait();
            expect(await wethContract.balanceOf(await user.getAddress())).to.equal(parseEther("1"));
            // Approve TaskRegistry
            await (await wethContract.connect(user).approve(taskRegistryContract.address, parseEther("1"))).wait();
            expect(await wethContract.allowance(await user.getAddress(), taskRegistryContract.address)).to.equal(
              parseEther("1"),
            );
            // Fund task
            tx = await taskRegistryContract
              .connect(user)
              .fundTaskWithERC20(taskUID, wethContract.address, parseEther("1"));
            txReceipt = await tx.wait();
            expect(txReceipt.events?.length).to.equal(3);
            if (txReceipt.events && txReceipt.events.length == 3 && txReceipt.events[2].args) {
              expect(txReceipt.events[2].args[0]).to.equal(taskUID);
              expect(txReceipt.events[2].args[2]).to.equal(wethContract.address);
              expect(txReceipt.events[2].args[4]).to.be.true;
              expect(txReceipt.events[2].args[5]).to.equal(parseEther("1"));
              expect(txReceipt.events[2].args[7]).to.equal("Wrapped Ether");
              rewardUID = txReceipt.events[2].args[1];
              expect(await taskRegistryContract.taskRewardUIDsByTaskUID(taskUID, 0)).to.equal(rewardUID);
              expect(await wethContract.balanceOf(taskRegistryContract.address)).to.equal(parseEther("1"));
            }
          });

          it("Does not allow anyone to fake funding a task", async () => {
            let encodedData = fundedSchemaEncoder.encodeData([
              { name: "tokenAddress", value: farmShareTokensContract.address, type: "address" },
              { name: "isErc1155", value: true, type: "bool" },
              { name: "isErc20", value: false, type: "bool" },
              { name: "amount", value: 100, type: "uint256" },
              { name: "tokenId", value: farmUID, type: "uint256" },
              { name: "tokenName", value: "Bob's Farm Shares", type: "string" },
            ]);
            await expectFailedAttestation(
              easContract,
              taskFundedSchemaUID,
              {
                recipient: await user.getAddress(),
                expirationTime: BigInt(0),
                data: encodedData,
              },
              { from: user },
              "Only task registry contract can attest to funding rewards",
            );
          });

          it("Allows users to apply for the task", async () => {
            let encodedData = applicationSchemaEncoder.encodeData([
              { name: "taskUID", value: taskUID, type: "bytes32" },
              { name: "userUID", value: userUID, type: "bytes32" },
              { name: "skillUIDs", value: [], type: "bytes32[]" },
            ]);
            await expectAttestation(
              easContract,
              taskApplicationSchemaUID,
              {
                recipient: await user.getAddress(),
                expirationTime: BigInt(0),
                data: encodedData,
              },
              { from: user },
            );
            expect(await taskRegistryContract.taskApplicantsByTaskUID(taskUID, 0)).to.equal(await user.getAddress());
          });

          it("Does not allow anyone except task creator to mark task as started/completed", async () => {
            let encodedData = startedSchemaEncoder.encodeData([
              { name: "taskUID", value: taskUID, type: "bytes32" },
              { name: "userUID", value: userUID, type: "bytes32" },
              { name: "startTimestamp", value: now(), type: "uint256" },
            ]);
            expect(await userRegistryContract.userRegistrations(await user.getAddress())).to.equal(userUID);
            await expectFailedAttestation(
              easContract,
              taskStartedSchemaUID,
              {
                recipient: await user.getAddress(),
                revocable: false,
                expirationTime: BigInt(0),
                data: encodedData,
              },
              { from: user },
              "Only task creator can attest that their task has been started",
            );
            encodedData = completedSchemaEncoder.encodeData([
              { name: "taskUID", value: taskUID, type: "bytes32" },
              { name: "userUID", value: userUID, type: "bytes32" },
              { name: "completeTimestamp", value: now(), type: "uint256" },
            ]);
            await expectFailedAttestation(
              easContract,
              taskCompletedSchemaUID,
              {
                recipient: await user.getAddress(),
                revocable: false,
                expirationTime: BigInt(0),
                data: encodedData,
              },
              { from: user },
              "Only task creator can attest that their task has been completed",
            );
          });

          it("Allows task creator to mark task as started/completed, and pays out tokens", async () => {
            // Fund task with farm shares
            await (await taskRegistryContract.connect(farmer).fundTaskWithFarmShares(taskUID, farmUID, 1 * 1e2)).wait();
            expect(await farmShareTokensContract.balanceOf(taskRegistryContract.address, farmUID)).to.equal(100);
            // Fund task with WETH
            await (await wethContract.connect(farmer).deposit({ value: parseEther("1") })).wait();
            await (await wethContract.connect(farmer).approve(taskRegistryContract.address, parseEther("1"))).wait();
            await (
              await taskRegistryContract
                .connect(farmer)
                .fundTaskWithERC20(taskUID, wethContract.address, parseEther("1"))
            ).wait();
            expect(await wethContract.balanceOf(taskRegistryContract.address)).to.equal(parseEther("1"));
            // Attest to task started
            let encodedData = startedSchemaEncoder.encodeData([
              { name: "taskUID", value: taskUID, type: "bytes32" },
              { name: "userUID", value: userUID, type: "bytes32" },
              { name: "startTimestamp", value: now(), type: "uint256" },
            ]);
            await expectAttestation(
              easContract,
              taskStartedSchemaUID,
              {
                recipient: await user.getAddress(),
                revocable: false,
                expirationTime: BigInt(0),
                data: encodedData,
              },
              { from: farmer },
            );
            expect(await taskRegistryContract.taskStatusByUID(taskUID)).to.equal(2);
            expect(await farmShareTokensContract.balanceOf(taskRegistryContract.address, farmUID)).to.equal(100);
            // Attest to task completed
            encodedData = completedSchemaEncoder.encodeData([
              { name: "taskUID", value: taskUID, type: "bytes32" },
              { name: "userUID", value: userUID, type: "bytes32" },
              { name: "completeTimestamp", value: now(), type: "uint256" },
            ]);
            await expectAttestation(
              easContract,
              taskCompletedSchemaUID,
              {
                recipient: await user.getAddress(),
                revocable: false,
                expirationTime: BigInt(0),
                data: encodedData,
              },
              { from: farmer },
            );
            expect(await taskRegistryContract.taskStatusByUID(taskUID)).to.equal(3);
            // Check payout
            expect(await farmShareTokensContract.balanceOf(taskRegistryContract.address, farmUID)).to.equal(0);
            expect(await farmShareTokensContract.balanceOf(await user.getAddress(), farmUID)).to.equal(100);
            expect(await wethContract.balanceOf(taskRegistryContract.address)).to.equal(0);
            expect(await wethContract.balanceOf(await user.getAddress())).to.equal(parseEther("1"));
          });
        });
      });
    });
  });
});
