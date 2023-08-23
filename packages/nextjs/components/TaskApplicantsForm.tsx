import { useEffect, useState } from "react";
import { Spinner } from "./Spinner";
import { TokenBalance } from "./scaffold-eth/TokenBalance";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { Button, FormControlLabel, MenuItem, Select, Switch, TextField } from "@mui/material";
import { Contract } from "ethers";
import moment from "moment";
import invariant from "tiny-invariant";
import { parseEther } from "viem";
import { useNetwork, useWalletClient } from "wagmi";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { TaskApplicant, UserRole } from "~~/services/eas/customSchemaTypes";
import { getUserAttestationsForAddress } from "~~/services/eas/utils";
import { useGlobalState } from "~~/services/store/store";
import { walletClientToSigner } from "~~/services/web3/ethers";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";
import { contracts } from "~~/utils/scaffold-eth/contract";

export const TaskApplicantsForm = ({
  taskUID,
  applicants,
  onClose,
}: {
  taskUID: string;
  applicants: TaskApplicant[];
  onClose: (open: boolean) => void;
}) => {
  const [submitting, setSubmitting] = useState(false);
  const { chain } = useNetwork();
  const signer = useGlobalState(state => state.userSigner);
  const userRegistration = useGlobalState(state => state.userRegistration);

  const { data: schemaUID } = useScaffoldContractRead({
    contractName: "TaskRegistry",
    functionName: "taskStartedSchemaUID",
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
  const eas = new EAS(easAddress);

  // Initialize SchemaEncoder with the schema string
  const schemaEncoder = new SchemaEncoder("bytes32 taskUID,bytes32 userUID,uint256 startTimestamp");

  const handleSubmit = async (address: string, userUID: string, userName: string) => {
    setSubmitting(true);
    try {
      invariant(signer, "Signer must be defined");
      eas.connect(signer as any);
      invariant(userUID && userUID != "0x0", "user must be registered");
      invariant(schemaUID, "schema UID must be defined");
      const encodedData = schemaEncoder.encodeData([
        { name: "taskUID", value: taskUID, type: "bytes32" },
        { name: "userUID", value: userUID, type: "bytes32" },
        { name: "startTimestamp", value: moment().unix(), type: "uint256" },
      ]);

      const tx = await eas.attest({
        schema: schemaUID,
        data: {
          recipient: address,
          expirationTime: BigInt(0),
          revocable: false,
          data: encodedData,
          refUID: taskUID,
        },
      });

      const newAttestationUID = await tx.wait();

      console.log("New attestation UID:", newAttestationUID);

      setSubmitting(false);
      notification.success(`You successfully assigned the task to ${userName}`);
      onClose(false);
    } catch (error: any) {
      console.error("⚡️ ~ file: RegistrationForm.tsx:handleSubmit ~ error", error);
      notification.error(error.toString());
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
      {applicants.map(applicant => {
        return (
          <button
            className={`btn btn-primary btn-sm`}
            key={applicant.userUID}
            onClick={() => handleSubmit(applicant.userAddress, applicant.userUID, applicant.userName)}
          >
            {submitting ? <Spinner /> : applicant.userName}
          </button>
        );
      })}
      <button
        className={`btn btn-secondary btn-sm`}
        onClick={() => {
          onClose(false);
        }}
      >
        {submitting ? <Spinner /> : "Cancel"}
      </button>
    </div>
  );
};
