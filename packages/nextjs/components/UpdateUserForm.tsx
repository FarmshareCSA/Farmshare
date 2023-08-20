import { useState } from "react";
import Image from "next/image";
import { Spinner } from "./Spinner";
import { InputBase } from "./scaffold-eth";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import invariant from "tiny-invariant";
import { keccak256, stringToBytes } from "viem";
import { useNetwork } from "wagmi";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { UserRegistration } from "~~/services/eas/customSchemaTypes";
import { useGlobalState } from "~~/services/store/store";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";
import { contracts } from "~~/utils/scaffold-eth/contract";

export const UpdateUserForm = () => {
  const userInfo = useGlobalState(state => state.userInfo);
  const signer = useGlobalState(state => state.userSigner);
  const userRegistration = useGlobalState(state => state.userRegistration);
  const setUserRegistration = useGlobalState(state => state.setUserRegistration);
  const [name, setName] = useState(userRegistration?.name || "");
  const [email, setEmail] = useState(userInfo?.email || "");
  const [location, setLocation] = useState(userRegistration?.location || "");
  const [role, setRole] = useState(userRegistration?.role.toString() || "");
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { chain } = useNetwork();
  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;

  const { data: schemaUID } = useScaffoldContractRead({
    contractName: "UserRegistry",
    functionName: "updateSchemaUID",
  });

  const easAddress =
    chain && contracts
      ? contracts[chain.id]?.[0]?.["contracts"]?.["EAS"]
        ? contracts[chain.id]?.[0]?.["contracts"]?.["EAS"]?.address
        : chain.name == "Sepolia"
        ? "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"
        : chain.name == "Base Goerli"
        ? "0xAcfE09Fd03f7812F022FBf636700AdEA18Fd2A7A"
        : "0x87A33bc39A49Bd3e50aa053Bee91a988A510ED6a"
      : "0xC2679fBD37d54388Ce493F1DB75320D236e1815e";
  if (!chain) {
    console.log("network.chain is undefined");
  }
  const eas = new EAS(easAddress);

  // Initialize SchemaEncoder with the schema string
  const schemaEncoder = new SchemaEncoder(
    "address newAccount,string newName,bytes32 newEmailHash,string newLocation,uint8 newRole",
  );

  const handleDiscard = async () => {
    invariant(userRegistration, "user registration must be defined");
    setName(userRegistration.name);
    setEmail(userInfo?.email || "");
    setLocation(userRegistration.location);
    setRole(userRegistration.role.toString());
    setEditing(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      invariant(signer, "Signer must be defined");
      eas.connect(signer as any);
      const address = await signer.getAddress();
      invariant(schemaUID, "schema UID must be defined");
      invariant(userRegistration, "user registration must be defined");
      const emailHash = keccak256(stringToBytes(email));
      const encodedData = schemaEncoder.encodeData([
        { name: "newAccount", value: address, type: "address" },
        { name: "newName", value: name, type: "string" },
        { name: "newEmailHash", value: emailHash, type: "bytes32" },
        { name: "newLocation", value: location, type: "string" },
        { name: "newRole", value: role, type: "uint8" },
      ]);

      const tx = await eas.attest({
        schema: schemaUID,
        data: {
          recipient: address,
          expirationTime: BigInt(0),
          revocable: false,
          data: encodedData,
          refUID: userRegistration.uid,
        },
      });

      console.log(await tx.tx.wait());
      const newAttestationUID = await tx.wait();

      console.log("New attestation UID:", newAttestationUID);
      const newUserRegistration: UserRegistration = {
        uid: userRegistration.uid,
        account: address,
        name: name,
        emailHash: emailHash,
        location: location,
        role: Number(role),
      };
      setUserRegistration(newUserRegistration);
      setSubmitting(false);
      setEditing(false);
      notification.success("You successfully updated your account");
    } catch (error: any) {
      console.error("⚡️ ~ file: RegistrationForm.tsx:handleSubmit ~ error", error);
      notification.error(error.toString());
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
        <p className="font-medium my-0 break-words">Account info</p>
        <InputBase
          value={name}
          onChange={e => setName(e)}
          placeholder="Jane T. Farmer"
          disabled={!editing}
          prefix={
            <span className="self-center cursor-pointer text-xl font-semibold px-3 text-accent">
              <Image src="/nametag.png" alt="name tag" width={40} height={40} />
            </span>
          }
        />
        <InputBase
          value={email}
          onChange={e => setEmail(e)}
          placeholder="janefarmer@gmail.com"
          disabled={!editing}
          prefix={<span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">📧</span>}
        />
        <InputBase
          value={location}
          onChange={e => setLocation(e)}
          placeholder="Your location (optional)"
          disabled={!editing}
          prefix={<span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">📍</span>}
        />
        <div className={`flex border-2 border-base-300 bg-base-200 rounded-full text-accent`}>
          <span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">🧑‍🌾</span>
          <select
            name="role"
            className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400"
            onChange={e => setRole(e.target.value)}
            disabled={!editing}
          >
            <option value="0">Select Role</option>
            <option value="1">Community Member</option>
            <option value="4">Farmer</option>
            <option value="3">Farm Manager</option>
            <option value="2">Donor</option>
          </select>
        </div>
        {editing ? (
          <>
            <button
              className={`btn btn-secondary btn-sm`}
              disabled={writeDisabled || submitting}
              onClick={handleSubmit}
            >
              {submitting ? <Spinner /> : "Submit 📝"}
            </button>
            <button
              className={`btn btn-secondary btn-sm`}
              disabled={writeDisabled || submitting}
              onClick={handleDiscard}
            >
              Discard Changes
            </button>
          </>
        ) : (
          <button
            className={`btn btn-secondary btn-sm`}
            disabled={writeDisabled || submitting}
            onClick={() => {
              setEditing(true);
            }}
          >
            {submitting ? <Spinner /> : "Edit 📝"}
          </button>
        )}
      </div>
    </>
  );
};
