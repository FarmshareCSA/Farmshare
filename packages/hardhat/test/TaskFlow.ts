import { expect } from "chai";
import { ethers } from "hardhat";
import { UserRegistry, FarmRegistry, TaskRegistry, FarmShareTokens, CommunityRegistry, EAS } from "../typechain-types";
import { deployProtocol } from "./helpers/DeployProtocol";
import { Signer } from "ethers";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { expectAttestation } from "./helpers/EAS";

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
    let expirationTime: number;
    let userUID: string;
    let farmerUID: string;
    const userSchemaEncoder = new SchemaEncoder(
      "address account,string name,bytes32 emailHash,string location,uint8 role",
    );

    before(async () => {
      userRegistrationSchemaUID = await userRegistryContract.registrationSchemaUID();
      it("Allows the user and farmer to register", async () => {
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
        expect(farmerRecord.name).to.equal("Alice User");
      });
    });
  });
});
