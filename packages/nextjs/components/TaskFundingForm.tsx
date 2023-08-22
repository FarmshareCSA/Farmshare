import { ChangeEvent, useState } from "react";
import Image from "next/image";
import { Spinner } from "./Spinner";
import { InputBase } from "./scaffold-eth";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { FormControlLabel, MenuItem, Select, Switch, TextField } from "@mui/material";
import moment from "moment";
import invariant from "tiny-invariant";
import { useNetwork } from "wagmi";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { UserRole } from "~~/services/eas/customSchemaTypes";
import { useGlobalState } from "~~/services/store/store";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";
import { contracts } from "~~/utils/scaffold-eth/contract";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export const TaskFundingForm = ({ taskUID, onClose }: any) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState(moment().format("yyyy-MM-DDThh:mm"));
  const [endTime, setEndTime] = useState(moment().add(7, "day").format("yyyy-MM-DDThh:mm"));
  const [submitting, setSubmitting] = useState(false);
  const { chain } = useNetwork();
  const signer = useGlobalState(state => state.userSigner);
  const userRegistration = useGlobalState(state => state.userRegistration);
  const [fundWithShares, setFundWithShares] = useState(
    userRegistration?.role == UserRole.Farmer || userRegistration?.role == UserRole.Manager,
  );
  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;

  const erc20s = [
    {
      name: "USDC",
      address: "0x853154e2A5604E5C74a2546E2871Ad44932eB92C",
    },
    {
      name: "WETH",
      address: "0x4200000000000000000000000000000000000006",
    },
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      invariant(signer, "Signer must be defined");

      setSubmitting(false);
      notification.success("You successfully funded a task");
      onClose(false);
    } catch (error: any) {
      console.error("⚡️ ~ file: TaskFundingForm.tsx:handleSubmit ~ error", error);
      notification.error(error.toString());
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
      {userRegistration?.role == UserRole.Farmer || userRegistration?.role == UserRole.Manager ? (
        <FormControlLabel
          control={
            <Switch
              checked={fundWithShares}
              onChange={e => setFundWithShares(e.target.checked)}
              name="fundWithShares"
            />
          }
          label="Fund with farm shares"
        />
      ) : (
        <Select
          labelId="select-multiple-chip-label"
          id="select-multiple-chip"
          // value={selectedSkills}
          // onChange={handleChange}
          MenuProps={MenuProps}
        >
          {erc20s.map(erc20 => (
            <MenuItem key={erc20.address} value={erc20.address}>
              {erc20.name}
            </MenuItem>
          ))}
        </Select>
      )}
      {/* <TextField
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
      /> */}
      <button className={`btn btn-secondary btn-sm`} disabled={writeDisabled || submitting} onClick={handleSubmit}>
        {submitting ? <Spinner /> : "Create Task 📝"}
      </button>
    </div>
  );
};
