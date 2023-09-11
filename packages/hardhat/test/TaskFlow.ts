import { expect } from "chai";
import { ethers } from "hardhat";
import { UserRegistry, FarmRegistry, TaskRegistry, FarmShareTokens, CommunityRegistry, EAS } from "../typechain-types";
import { deployProtocol } from "./helpers/DeployProtocol";
import { Signer } from "ethers";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { expectAttestation, expectFailedAttestation } from "./helpers/EAS";
import { FarmRecordStructOutput } from "../typechain-types/contracts/FarmRegistry";

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

  before(async () => {
    [deployer, farmer, user] = await ethers.getSigners();
  });

  beforeEach(async () => {
    // Deploy contracts
    let { eas, userRegistry, farmRegistry, communityRegistry, taskRegistry, farmShareTokens } = await deployProtocol();
    easContract = eas;
    userRegistryContract = userRegistry;
    farmRegistryContract = farmRegistry;
    communityRegistryContract = communityRegistry;
    taskRegistryContract = taskRegistry;
    farmShareTokensContract = farmShareTokens;
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

      describe("Task Management", () => {});
    });
  });
});
