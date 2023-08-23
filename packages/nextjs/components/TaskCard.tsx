import * as React from "react";
import { useEffect, useState } from "react";
import { TaskFundingForm } from "./TaskFundingForm";
import { Box, Button, CardActionArea, CardActions, Modal } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import moment from "moment";
import { useNetwork } from "wagmi";
// import style from "styled-jsx/style";
import { TaskReward } from "~~/services/eas/customSchemaTypes";
import { useGlobalState } from "~~/services/store/store";
import { getTaskApplicationsByTaskID } from "~~/services/eas/utils";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { getAttestation } from "~~/services/eas/utils";
import { contracts } from "~~/utils/scaffold-eth/contract";

export default function TaskCard({
  uid,
  title,
  description,
  creator,
  startTime,
  endTime,
  rewards,
  image,
}: {
  uid: string;
  title: string;
  description: string;
  creator: string;
  startTime: number;
  endTime: number;
  rewards: TaskReward[];
  image: string;
}) {
  const [open, setOpen] = useState(false);
  const [openApplications, setOpenApplications] = useState(false);
  const userAddress = useGlobalState(state => state.userSmartAccount);
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

  const { data: taskApplicationSchemaUID } = useScaffoldContractRead({
    contractName: "TaskRegistry",
    functionName: "taskApplicationSchemaUID",
  });

  const getUserAttestations = async () => {
    const Users = []
    for( const application of applications) {
      Users.push(getAttestation(application.userUID));
    }
    setUsersWhoApplied(Users);
  };

  React.useEffect(() => {
    if (userAddress === creator) {
      getUserAttestations()
    }
  }, [applications]);
  const farmSharesAddress =
    chain && contracts
      ? contracts[chain.id]?.[0]?.["contracts"]?.["FarmShares"]
        ? contracts[chain.id]?.[0]?.["contracts"]?.["FarmShares"].address
        : "0xFF2d8417c275F06e69392C08B6b4292D556409f5"
      : "0xFF2d8417c275F06e69392C08B6b4292D556409f5";

  React.useEffect(() => {
    if (!showDetails) {
      setContent(
        <Card sx={{ height: "450px", borderRadius: "20px" }}>
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
          <Card sx={{ height: "450px", borderRadius: "20px", backgroundColor: "#545454" }}>
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
            {userAddress !== creator &&
            <Button variant="contained" style={{ backgroundColor: "rgb(46, 125, 50)" }}
            onClick={() => {
              //create an attestation with the taskApplicationSchema here
            }}
            >
                Apply
              </Button>
            }
              <Button
                variant="contained"
                style={{ backgroundColor: "rgb(46, 125, 50)" }}
                onClick={() => {
                  setOpen(true);
                }}
              >
                Fund
              </Button>
              {userAddress === creator && <Button
                variant="contained"
                style={{ backgroundColor: "rgb(46, 125, 50)" }}
                onClick={async () => {
                  const applications = await getTaskApplicationsByTaskID(uid,taskApplicationSchemaUID as string);
                  setApplications(applications);
                  setOpenApplications(true);
                }}
              >
                Accept Applicants
              </Button>}
              {userAddress === creator && taskAccepted ? <Button
                variant="contained"
                style={{ backgroundColor: "rgb(46, 125, 50)" }}
                onClick={()=>{}
                  // create one last attestation using the taskCompletedSchema here
                }
              >
                Complete
              </Button>
              : null
              }
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
            open={open}
            onClose={() => {
              setOpen(false);
            }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Create Task
              </Typography>
              <TaskFundingForm taskUID={uid} onClose={setOpen} />
            </Box>
          </Modal>
          <Modal
            open={openApplications}
            onClose={() => {
              setOpenApplications(false);
            }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                {
                  usersWhoApplied.map((user: any) => {
                    return <Button key={user.account} variant="contained" onClick={()=>{
                      //create an attestation with the taskStartedSchema here
                    }}>{user.name} </Button>
                  })
                }
              </Typography>
              <TaskFundingForm taskUID={uid} onClose={setOpenApplications} />
            </Box>
          </Modal>
        </>,
      );
    }
  }, [showDetails, open,]);

  return <React.Fragment>{content}</React.Fragment>;
}
