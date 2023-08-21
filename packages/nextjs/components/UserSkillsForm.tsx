import { useEffect, useState } from "react";
import { Spinner } from "./Spinner";
import { InputBase } from "./scaffold-eth";
import { AttestationRequestData, EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Theme, useTheme } from "@mui/material/styles";
import invariant from "tiny-invariant";
import { useNetwork } from "wagmi";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { getSkillUIDByName, getUserAttestationsForAddress } from "~~/services/eas/utils";
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

function getStyles(name: string, selected: readonly string[], theme: Theme) {
  return {
    fontWeight: selected.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium,
  };
}

export const UserSkillsForm = () => {
  const { chain } = useNetwork();
  const signer = useGlobalState(state => state.userSigner);
  const userRegistration = useGlobalState(state => state.userRegistration);
  const [skills, setSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [attestedSkills, setAttestedSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reload, setReload] = useState(false);
  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;
  const theme = useTheme();
  let skillName = "";

  const skillRecordSchemaEncoder = new SchemaEncoder("string skill");
  const userSkillSchemaEncoder = new SchemaEncoder("bytes32 skillUID,bytes32 userUID,string skillName");

  const { data: skillRecordSchemaUID } = useScaffoldContractRead({
    contractName: "UserRegistry",
    functionName: "skillRecordSchemaUID",
  });
  const { data: userSkillSchemaUID } = useScaffoldContractRead({
    contractName: "UserRegistry",
    functionName: "userSkillSchemaUID",
  });

  const userRegistryAddress =
    chain && contracts
      ? contracts[chain.id]?.[0]?.["contracts"]?.["UserRegistry"]?.address
      : "0x0000000000000000000000000000000000000000";

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

  useEffect(() => {
    const getSkillAttestations = async () => {
      let tmpAttestations = await getUserAttestationsForAddress(
        userRegistryAddress,
        skillRecordSchemaUID ? skillRecordSchemaUID : "",
      );
      if (tmpAttestations.length > 0) {
        // Found skill records
        const skillList: string[] = [];
        for (let i = 0; i < tmpAttestations.length; i++) {
          const decodedData = skillRecordSchemaEncoder.decodeData(tmpAttestations[i].data);
          skillList.push(decodedData[0].value.value.toString());
        }
        setSkills(skillList);
        // if (signer && userSkillSchemaUID) {
        //   const address = await signer.getAddress();
        //   tmpAttestations = await getUserAttestationsForAddress(address, userSkillSchemaUID);
        //   if (tmpAttestations.length > 0) {
        //     // Found user skill attestations
        //     const selectedList: string[] = [];
        //     for (let i = 0; i < tmpAttestations.length; i++) {
        //       const decodedData = userSkillSchemaEncoder.decodeData(tmpAttestations[i].data);
        //       const skillName = decodedData[2].value.value.toString();
        //       selectedList.push(skillName);
        //     }
        //     setSelectedSkills(selectedList);
        //   }
        // }
      } else {
        console.log("Did not find any skill records");
        setSkills([]);
      }
    };
    getSkillAttestations();
  }, [skills]);

  useEffect(() => {
    const getUserSkillAttestations = async () => {
      if (signer && userSkillSchemaUID) {
        const address = await signer.getAddress();
        const tmpAttestations = await getUserAttestationsForAddress(address, userSkillSchemaUID);
        if (tmpAttestations.length > 0) {
          // Found user skill attestations
          const selectedList: string[] = [];
          for (let i = 0; i < tmpAttestations.length; i++) {
            const decodedData = userSkillSchemaEncoder.decodeData(tmpAttestations[i].data);
            const skillName = decodedData[2].value.value.toString();
            selectedList.push(skillName);
          }
          setAttestedSkills(selectedList);
          if (selectedSkills.length == 0) {
            setSelectedSkills(selectedList);
          }
        }
      }
    };
    getUserSkillAttestations();
  });

  const handleChange = (event: SelectChangeEvent<typeof skills>) => {
    const {
      target: { value },
    } = event;
    setSelectedSkills(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value,
    );
  };

  const handleSubmitNewSkill = async () => {
    setSubmitting(true);
    try {
      invariant(signer, "Signer must be defined");
      eas.connect(signer as any);
      invariant(skillRecordSchemaUID, "schema UID must be defined");
      const encodedData = skillRecordSchemaEncoder.encodeData([{ name: "skill", value: newSkill, type: "string" }]);

      const tx = await eas.attest({
        schema: skillRecordSchemaUID,
        data: {
          recipient: userRegistryAddress,
          expirationTime: BigInt(0),
          revocable: false,
          data: encodedData,
        },
      });

      console.log(await tx.tx.wait());
      const newAttestationUID = await tx.wait();

      console.log("New attestation UID:", newAttestationUID);
      skills.push(newSkill);
      setNewSkill("");
      setSubmitting(false);
      notification.success("You successfully added a new skill for all to use!");
    } catch (error: any) {
      console.error("⚡️ ~ file: RegistrationForm.tsx:handleSubmit ~ error", error);
      notification.error(error.toString());
      setSubmitting(false);
    }
  };

  const handleSubmitSkills = async () => {
    setSubmitting(true);
    try {
      invariant(signer, "Signer must be defined");
      eas.connect(signer as any);
      const address = await signer.getAddress();
      invariant(userSkillSchemaUID, "schema UID must be defined");
      invariant(skillRecordSchemaUID, "schema UID must be defined");
      invariant(userRegistration, "user registration must be defined");
      const requests: AttestationRequestData[] = [];
      for (let i = 0; i < selectedSkills.length; i++) {
        skillName = selectedSkills[i];
        if (attestedSkills.includes(skillName)) continue;
        const skillRecordUID = await getSkillUIDByName(
          skillName,
          userRegistryAddress,
          skillRecordSchemaUID,
          skillRecordSchemaEncoder,
        );
        invariant(skillRecordUID, "skill record must be defined");
        const encodedData = userSkillSchemaEncoder.encodeData([
          { name: "skillUID", value: skillRecordUID, type: "bytes32" },
          { name: "userUID", value: userRegistration.uid, type: "bytes32" },
          { name: "skillName", value: skillName, type: "string" },
        ]);
        console.log("Attesting to skill %s (%s) for user %s", skillName, skillRecordUID, userRegistration.uid);
        requests.push({
          recipient: address,
          expirationTime: BigInt(0),
          revocable: true,
          data: encodedData,
          refUID: skillRecordUID,
        });

        // const tx = await eas.attest({
        //   schema: userSkillSchemaUID,
        //   data: {
        //     recipient: address,
        //     expirationTime: BigInt(0),
        //     revocable: true,
        //     data: encodedData,
        //     refUID: skillRecordUID,
        //   },
        // });
      }
      const tx = await eas.multiAttest([
        {
          schema: userSkillSchemaUID,
          data: requests,
        },
      ]);
      setSubmitting(false);
      notification.success("You successfully added your skills!");
    } catch (error: any) {
      console.error("⚡️ ~ file: RegistrationForm.tsx:handleSubmit ~ error", error);
      notification.error(error.toString());
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
      <p className="font-medium my-0 break-words">Your Skills</p>
      <FormControl>
        <InputLabel id="select-multiple-chip-label">Skills</InputLabel>
        <Select
          labelId="select-multiple-chip-label"
          id="select-multiple-chip"
          multiple
          value={selectedSkills}
          onChange={handleChange}
          input={<OutlinedInput id="select-multiple-chip" label="Skills" />}
          renderValue={selected => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map(value => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {skills.map(skill => (
            <MenuItem key={skill} value={skill} style={getStyles(skill, selectedSkills, theme)}>
              {skill}
            </MenuItem>
          ))}
        </Select>
        <button
          className={`btn btn-secondary btn-sm`}
          disabled={writeDisabled || submitting}
          onClick={handleSubmitSkills}
        >
          {submitting ? <Spinner /> : "Submit skills 🎯"}
        </button>
        <InputBase
          value={newSkill}
          onChange={e => setNewSkill(e)}
          placeholder="New skill type"
          prefix={<span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">💪</span>}
        />
        <button
          className={`btn btn-secondary btn-sm`}
          disabled={writeDisabled || submitting}
          onClick={handleSubmitNewSkill}
        >
          {submitting ? <Spinner /> : "Add new skill type 🎯"}
        </button>
      </FormControl>
    </div>
  );
};
