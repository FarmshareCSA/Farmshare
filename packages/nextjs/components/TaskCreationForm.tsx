import { ChangeEvent, useState } from "react";
import Image from "next/image";
import { Spinner } from "./Spinner";
import { InputBase } from "./scaffold-eth";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { FormControlLabel, Switch, TextField } from "@mui/material";
import { Buffer } from "buffer";
import { create } from "ipfs-http-client";
import moment from "moment";
import invariant from "tiny-invariant";
import { useNetwork } from "wagmi";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";
import { contracts } from "~~/utils/scaffold-eth/contract";

export const TaskCreationForm = ({ communityUID, onClose }: any) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState(moment().format("yyyy-MM-DDThh:mm"));
  const [endTime, setEndTime] = useState(moment().add(7, "day").format("yyyy-MM-DDThh:mm"));
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { chain } = useNetwork();
  const signer = useGlobalState(state => state.userSigner);
  const userRegistration = useGlobalState(state => state.userRegistration);
  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;

  /* configure Infura IPFS auth settings */
  const projectId = "2TcFlGWq8noGJV2ylEnCVpqCr30";
  const projectSecret = "9223442241ffe73e4c965a24b685c35a";
  const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

  /* create the IPFS client */
  const client = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: auth,
    },
  });

  const { data: schemaUID } = useScaffoldContractRead({
    contractName: "TaskRegistry",
    functionName: "taskCreationSchemaUID",
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
  const schemaEncoder = new SchemaEncoder(
    "bytes32 communityUID,string name,string description,address creator,uint256 startTime,uint256 endTime,bool recurring,uint256 frequency,string imageURL",
  );

  const handleImage = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files == null) return;
    const file = e.target.files[0];
    try {
      const added = await client.add(file);
      const url = `https://infura-ipfs.io/ipfs/${added.path}`;
      setImageUrl(url);
      console.log("IPFS URI: ", url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const handleSubmit = async () => {
    if(!communityUID){
      notification.error("You must select a community to create a task");
    } else {
      setSubmitting(true);
      try {
        invariant(signer, "Signer must be defined");
        eas.connect(signer as any);
        const address = await signer.getAddress();
        const userUID = userRegistration?.uid;
        invariant(userUID && userUID != "0x0", "user must be registered");
        invariant(schemaUID, "schema UID must be defined");
        const encodedData = schemaEncoder.encodeData([
          { name: "communityUID", value: communityUID, type: "bytes32" },
          { name: "name", value: name, type: "string" },
          { name: "description", value: description, type: "string" },
          { name: "creator", value: address, type: "address" },
          { name: "startTime", value: moment(startTime).unix(), type: "uint256" },
          { name: "endTime", value: moment(endTime).unix(), type: "uint256" },
          { name: "recurring", value: recurring, type: "bool" },
          { name: "frequency", value: frequency, type: "uint256" },
          { name: "imageURL", value: imageUrl, type: "string" },
        ]);

        const tx = await eas.attest({
          schema: schemaUID,
          data: {
            recipient: address,
            expirationTime: BigInt(0),
            revocable: false,
            data: encodedData,
            refUID: communityUID,
          },
        });

        const newAttestationUID = await tx.wait();

        console.log("New attestation UID:", newAttestationUID);

        setSubmitting(false);
        notification.success("You successfully added a task");
        onClose(false);
      } catch (error: any) {
        console.error("⚡️ ~ file: RegistrationForm.tsx:handleSubmit ~ error", error);
        notification.error(error.toString());
        setSubmitting(false);
    }
  }
  };

  return (
    <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
      <TextField
        label="Task Name"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Harvest Apples"
        InputProps={{
          startAdornment: (
            <span className="self-center cursor-pointer text-xl font-semibold px-3 text-accent">
              <Image src="/nametag.png" alt="name tag" width={40} height={40} />
            </span>
          ),
        }}
      />
      <TextField
        label="Task Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        multiline
        placeholder="Spend an afternoon picking apples with friends at Apple Pond Farm"
        InputProps={{
          startAdornment: <span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">📝</span>,
        }}
      />
      <TextField
        id="start-time"
        label="Start Time"
        type="datetime-local"
        value={startTime}
        defaultValue={startTime}
        onChange={e => setStartTime(e.target.value)}
        // className={"flex border-2 border-base-300 bg-base-200 rounded-full text-accent"}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        id="end-time"
        label="End Time"
        type="datetime-local"
        value={endTime}
        defaultValue={endTime}
        onChange={e => setEndTime(e.target.value)}
        // className={"flex border-2 border-base-300 bg-base-200 rounded-full text-accent"}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <FormControlLabel
        control={<Switch checked={recurring} onChange={e => setRecurring(e.target.checked)} name="recurring" />}
        label="Recurring"
      />
      {recurring && (
        <TextField
          id="frequency"
          label="Frequency (days)"
          type="number"
          value={frequency}
          onChange={e => setFrequency(parseInt(e.target.value))}
          InputProps={{
            inputProps: { min: 1 },
            startAdornment: (
              <span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">📆</span>
            ),
          }}
        />
      )}
      <div className={`flex border-2 border-base-300 bg-base-200 rounded-full text-accent`}>
        <span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">📷</span>
        <input
          name="image"
          type="file"
          accept="image/*"
          className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400"
          onChange={e => handleImage(e)}
        />
      </div>
      {imageUrl && (
        <div>
          <img src={imageUrl} width="600px" />
          {/* <a href={imageUrl} target="_blank">{imageUrl}</a> */}
        </div>
      )}
      <button className={`btn btn-secondary btn-sm`} disabled={writeDisabled || submitting} onClick={handleSubmit}>
        {submitting ? <Spinner /> : "Create Task 📝"}
      </button>
    </div>
  );
};
