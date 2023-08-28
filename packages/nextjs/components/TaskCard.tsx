import * as React from "react";
import { useEffect, useState } from "react";
import { Spinner } from "./Spinner";
import { TaskApplicantsForm } from "./TaskApplicantsForm";
import { TaskFundingForm } from "./TaskFundingForm";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { Box, Button, CardActionArea, CardActions, Modal } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Contract } from "ethers";
import moment from "moment";
import invariant from "tiny-invariant";
import { parseEther } from "viem";
import { useNetwork } from "wagmi";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
// import style from "styled-jsx/style";
import { TaskApplicant, TaskReward } from "~~/services/eas/customSchemaTypes";
import { getTaskApplicationsByTaskID, getUserAttestationsForAddress } from "~~/services/eas/utils";
import { getAttestation } from "~~/services/eas/utils";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";
import { contracts } from "~~/utils/scaffold-eth/contract";

export default function TaskCard({
  uid,
  title,
  description,
  creator,
  startTime,
  endTime,
  rewards,
  applicants,
  started,
  completed,
  startedByUserUID,
  startedByUserAddress,
  image,
}: {
  uid: string;
  title: string;
  description: string;
  creator: string;
  startTime: number;
  endTime: number;
  rewards: TaskReward[];
  applicants: TaskApplicant[];
  started: boolean;
  completed: boolean;
  startedByUserUID: string | null;
  startedByUserAddress: string | null;
  image: string;
}) {
  const [openFund, setOpenFund] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openApplications, setOpenApplications] = useState(false);
  const userRegistration = useGlobalState(state => state.userRegistration);
  const userAddress = useGlobalState(state => state.userSmartAccount);
  const signer = useGlobalState(state => state.userSigner);
  const { chain } = useNetwork();
  const [showDetails, setShowDetails] = useState<any>(false);
  const [content, setContent] = useState<any>(<React.Fragment></React.Fragment>);
  const [applications, setApplications] = useState<any>([]);
  const [usersWhoApplied, setUsersWhoApplied] = useState<any>([]);

  //Use this state to set if task is accepted
  let [taskAccepted, setTaskAccepted] = useState<any>(false);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  const erc20ABI = [
    "function transfer(address dst, uint wad) public returns (bool)",
    "function approve(address guy, uint wad) public returns (bool)",
    "function balanceOf(address account) public view returns (uint256)",
  ];

  const farmSharesAddress =
    chain && contracts
      ? contracts[chain.id]?.[0]?.["contracts"]?.["FarmShares"]
        ? contracts[chain.id]?.[0]?.["contracts"]?.["FarmShares"].address
        : "0xFF2d8417c275F06e69392C08B6b4292D556409f5"
      : "0xFF2d8417c275F06e69392C08B6b4292D556409f5";

  const farmSharesABI = ["function mint(address to, uint256 id, uint256 amount, bytes calldata data) public"];

  const { data: taskApplicationSchemaUID } = useScaffoldContractRead({
    contractName: "TaskRegistry",
    functionName: "taskApplicationSchemaUID",
  });

  const { data: taskCompletedSchemaUID } = useScaffoldContractRead({
    contractName: "TaskRegistry",
    functionName: "taskCompletedSchemaUID",
  });

  const { data: userSkillSchemaUID } = useScaffoldContractRead({
    contractName: "UserRegistry",
    functionName: "userSkillSchemaUID",
  });

  const getUserAttestations = async () => {
    const Users = [];
    for (const application of applications) {
      Users.push(getAttestation(application.userUID));
    }
    setUsersWhoApplied(Users);
  };

  React.useEffect(() => {
    if (userAddress === creator) {
      getUserAttestations();
    }
  }, [applications]);

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

  const applicationSchemaEncoder = new SchemaEncoder("bytes32 taskUID,bytes32 userUID,bytes32[] skillUIDs");
  const completedSchemaEncoder = new SchemaEncoder("bytes32 taskUID,bytes32 userUID,uint256 completeTimestamp");

  const handleApplication = async () => {
    setSubmitting(true);
    try {
      invariant(signer, "signer must be defined");
      invariant(userRegistration, "must be registered to apply");
      invariant(taskApplicationSchemaUID, "application schema UID must be defined");
      invariant(userSkillSchemaUID, "user skill schema UID must be defined");
      const userUID = userRegistration.uid;
      const address = await signer.getAddress();
      const userSkillAttestations = await getUserAttestationsForAddress(address, userSkillSchemaUID);
      const userSkillUIDs = userSkillAttestations.map(attestation => attestation.id);
      eas.connect(signer as any);
      const encodedData = applicationSchemaEncoder.encodeData([
        { name: "taskUID", value: uid, type: "bytes32" },
        { name: "userUID", value: userUID, type: "bytes32" },
        { name: "skillUIDs", value: userSkillUIDs, type: "bytes32[]" },
      ]);

      const tx = await eas.attest({
        schema: taskApplicationSchemaUID,
        data: {
          recipient: address,
          expirationTime: BigInt(0),
          revocable: false,
          data: encodedData,
          refUID: uid,
        },
      });

      const newAttestationUID = await tx.wait();

      console.log("New attestation UID:", newAttestationUID);
      notification.success("You successfully applied for a task");
      setSubmitting(false);
    } catch (error: any) {
      console.error("⚡️ ~ file: TaskCard.tsx:handleApplication ~ error", error);
      notification.error(error.toString());
      setSubmitting(false);
    }
  };

  const handleComplete = async (address: string | null, userUID: string | null) => {
    setSubmitting(true);
    try {
      invariant(signer, "signer must be defined");
      invariant(userRegistration, "must be registered to apply");
      invariant(taskCompletedSchemaUID, "application schema UID must be defined");
      invariant(address, "user address must be defined");
      invariant(userUID, "user UID must be defined");
      console.log(`Attesting that user w/ address ${address} and UID ${userUID} completed the task`);
      eas.connect(signer as any);
      const encodedData = completedSchemaEncoder.encodeData([
        { name: "taskUID", value: uid, type: "bytes32" },
        { name: "userUID", value: userUID, type: "bytes32" },
        { name: "completeTimestamp", value: moment().unix(), type: "uint256" },
      ]);

      const tx = await eas.attest(
        {
          schema: taskCompletedSchemaUID,
          data: {
            recipient: address,
            expirationTime: BigInt(0),
            revocable: false,
            data: encodedData,
            refUID: uid,
          },
        },
        {
          gasLimit: 15000000,
        },
      );

      console.log(await tx.tx.wait());
      const newAttestationUID = await tx.wait();

      console.log("New attestation UID:", newAttestationUID);

      const erc20Contract = new Contract("0x4200000000000000000000000000000000000006", erc20ABI, signer);
      const erc20Amount = parseEther("0.005");
      let receipt = await erc20Contract.transfer(address, erc20Amount);
      await receipt.wait();

      const farmSharesContract = new Contract(farmSharesAddress, farmSharesABI, signer);
      receipt = await farmSharesContract.mint(
        address,
        parseInt("0xe4400b6439dc8e5cda8e219cd579162e6453188f7d6a02545ae6587dd5d58ed7"),
        100,
        uid,
      );
      await receipt.wait();

      notification.success("You successfully marked the task as complete and paid out the rewards");
      setSubmitting(false);
    } catch (error: any) {
      console.error("⚡️ ~ file: TaskCard.tsx:handleComplete ~ error", error);
      notification.error(error.toString());
      setSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (!showDetails) {
      setContent(
        <Card sx={{ height: "650px", borderRadius: "20px" }}>
          <CardActionArea style={{ height: "100%" }} onClick={() => setShowDetails(true)}>
            <CardMedia component="img" sx={{ height: "60%" }} image={image} alt="green iguana" />
            <CardContent sx={{ height: "40%" }}>
              <Typography gutterBottom variant="body2" component="div">
                {moment.unix(startTime).format("MMM D, YYYY, hh:mmA") +
                  " - " +
                  moment.unix(endTime).format("MMM D, YYYY, hh:mmA")}
              </Typography>
              <Typography variant="h6" color="black" sx={{ fontWeight: "bold" }}>
                {title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {description}
              </Typography>
              {rewards.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Rewards: <br />{" "}
                  {rewards.map((reward, index) => (
                    <>
                      <span key={index}>
                        {reward.tokenName.endsWith(" Share") ? reward.amount / 1e2 : reward.amount / 1e18}{" "}
                        {reward.tokenName}
                      </span>
                      <br />
                    </>
                  ))}
                </Typography>
              )}
            </CardContent>
          </CardActionArea>
        </Card>,
      );
    } else {
      setContent(
        <>
          <Card sx={{ height: "650px", borderRadius: "20px", backgroundColor: "#545454" }}>
            <CardContent>
              <Typography sx={{ fontSize: 14 }} color="white" gutterBottom>
                {moment.unix(startTime).format("MMM D, YYYY, hh:mmA") +
                  " - " +
                  moment.unix(endTime).format("MMM D, YYYY, hh:mmA")}
              </Typography>
              <Typography variant="h5" color="white" component="div">
                {title}
              </Typography>
              <Typography variant="body1" color="white">
                {description}
              </Typography>
              {rewards.length > 0 && (
                <Typography variant="body2" color="white">
                  Rewards: <br />{" "}
                  {rewards.map((reward, index) => (
                    <>
                      <span key={index}>
                        {reward.tokenName.endsWith(" Share") ? reward.amount / 1e2 : reward.amount / 1e18}{" "}
                        {reward.tokenName}
                      </span>
                      <br />
                    </>
                  ))}
                </Typography>
              )}
            </CardContent>
            <CardActions>
              {userAddress !== creator && !started && (
                <Button
                  variant="contained"
                  style={{ backgroundColor: "rgb(46, 125, 50)" }}
                  onClick={handleApplication}
                  disabled={submitting}
                >
                  {submitting ? <Spinner /> : "Apply"}
                </Button>
              )}
              <Button
                variant="contained"
                style={{ backgroundColor: "rgb(46, 125, 50)" }}
                onClick={() => {
                  setOpenFund(true);
                }}
              >
                Fund
              </Button>
              {userAddress === creator && !started && (
                <Button
                  variant="contained"
                  style={{ backgroundColor: "rgb(46, 125, 50)" }}
                  // disabled={applicants.length == 0}
                  onClick={() => {
                    setOpenApplications(true);
                    console.log(`openApplications = ${openApplications}`);
                  }}
                >
                  {applicants.length > 0 ? "Accept Applicants" : "No Applicants Yet"}
                </Button>
              )}
              {userAddress === creator && started && (
                <Button
                  variant="contained"
                  disabled={submitting}
                  style={{ backgroundColor: "rgb(46, 125, 50)" }}
                  onClick={
                    () => {
                      handleComplete(startedByUserAddress, startedByUserUID);
                    }
                    // create one last attestation using the taskCompletedSchema here
                  }
                >
                  {submitting ? <Spinner /> : "Complete"}
                </Button>
              )}
              <Button
                variant="contained"
                style={{ backgroundColor: "rgb(46, 125, 50)" }}
                onClick={() => {
                  setShowDetails(false);
                }}
              >
                Close
              </Button>
            </CardActions>
          </Card>
          <Modal
            open={openFund}
            onClose={() => {
              setOpenFund(false);
            }}
            aria-labelledby="fund-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Typography id="fund-modal-title" variant="h6" component="h2">
                Fund Task
              </Typography>
              <TaskFundingForm taskUID={uid} onClose={setOpenFund} />
            </Box>
          </Modal>
          <Modal
            open={openApplications}
            onClose={() => {
              setOpenApplications(false);
            }}
            aria-labelledby="applicants-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Typography id="applicants-modal-title" variant="h6" component="h2">
                Task Applicants
              </Typography>
              <TaskApplicantsForm taskUID={uid} applicants={applicants} onClose={setOpenApplications} />
            </Box>
          </Modal>
        </>,
      );
    }
  }, [showDetails, openFund, openApplications]);

  return <React.Fragment>{content}</React.Fragment>;
}
