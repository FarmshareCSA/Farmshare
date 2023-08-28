import React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import AddIcon from "@mui/icons-material/Add";
import { CardActionArea, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Fab from "@mui/material/Fab";
import Grid from "@mui/material/Grid";
import Modal from "@mui/material/Modal";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import moment from "moment";
import type { NextPage } from "next";
import invariant from "tiny-invariant";
import { number } from "zod";
import { MetaHeader } from "~~/components/MetaHeader";
import TaskCard from "~~/components/TaskCard";
import { TaskCreationForm } from "~~/components/TaskCreationForm";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { Task, TaskReward } from "~~/services/eas/customSchemaTypes";
import { getTasksForCommunity } from "~~/services/eas/utils";
import { useGlobalState } from "~~/services/store/store";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function getRandomEvenNumber(min: number, max: number) {
  const range = (max - min + 1) / 2;
  const randomEven = Math.floor(Math.random() * range) * 2 + min;
  return randomEven;
}

const displayTasks = (taskList: Task[]) => {
  let tasksDisplay = <React.Fragment></React.Fragment>;
  const tasks: any[] = [];
  let counter = 0;
  const numberOfTasks = taskList.length;
  taskList.forEach((task, i) => {
    const width = getRandomEvenNumber(2, 6);
    // console.log('width',width)
    if (counter >= 12) {
      counter = 0;
    }
    if (task.completed) {
    } else if (i === numberOfTasks - 1) {
      tasks.push(
        <Grid key={task.uid} xs={12 - counter} sx={{ padding: "5px" }}>
          <TaskCard
            uid={task.uid}
            title={task.name}
            description={task.description}
            creator={task.creator}
            startTime={task.startTime}
            endTime={task.endTime}
            rewards={task.rewards}
            applicants={task.applicants}
            started={task.started}
            completed={task.completed}
            startedByUserUID={task.userUID}
            startedByUserAddress={task.userAddress}
            image={task.imageURL}
          />
        </Grid>,
      );
    } else if (counter + width <= 12) {
      counter = counter + width;
      tasks.push(
        <Grid key={task.uid} xs={width} sx={{ padding: "5px" }}>
          <TaskCard
            uid={task.uid}
            title={task.name}
            description={task.description}
            creator={task.creator}
            startTime={task.startTime}
            endTime={task.endTime}
            rewards={task.rewards}
            applicants={task.applicants}
            started={task.started}
            completed={task.completed}
            startedByUserUID={task.userUID}
            startedByUserAddress={task.userAddress}
            image={task.imageURL}
          />
        </Grid>,
      );
    } else {
      tasks.push(
        <Grid key={task.uid} xs={12 - counter} sx={{ padding: "5px" }}>
          <TaskCard
            uid={task.uid}
            title={task.name}
            description={task.description}
            creator={task.creator}
            startTime={task.startTime}
            endTime={task.endTime}
            rewards={task.rewards}
            applicants={task.applicants}
            started={task.started}
            completed={task.completed}
            startedByUserUID={task.userUID}
            startedByUserAddress={task.userAddress}
            image={task.imageURL}
          />
        </Grid>,
      );
      counter = 12;
    }
  });

  tasksDisplay = (
    <React.Fragment>
      <Grid container spacing={2}>
        {...tasks}
      </Grid>
    </React.Fragment>
  );
  return tasksDisplay;
};

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

const Tasks: NextPage = () => {
  const searchParams = useSearchParams();
  let [tasks, setTasks] = useState<any>([]);
  let [open, setOpen] = useState<any>(false);
  const [community, setCommunity] = useState("");
  const communities = useGlobalState(state => state.communities);
  const userRegistration = useGlobalState(state => state.userRegistration);
  const userSigner = useGlobalState(state => state.userSigner);
  let communityUID = searchParams.get("community");

  const { data: taskSchemaUID } = useScaffoldContractRead({
    contractName: "TaskRegistry",
    functionName: "taskCreationSchemaUID",
  });

  const { data: rewardSchemaUID } = useScaffoldContractRead({
    contractName: "TaskRegistry",
    functionName: "taskFundedSchemaUID",
  });

  const { data: applicationSchemaUID } = useScaffoldContractRead({
    contractName: "TaskRegistry",
    functionName: "taskApplicationSchemaUID",
  });

  const { data: startedSchemaUID } = useScaffoldContractRead({
    contractName: "TaskRegistry",
    functionName: "taskStartedSchemaUID",
  });

  const { data: completedSchemaUID } = useScaffoldContractRead({
    contractName: "TaskRegistry",
    functionName: "taskCompletedSchemaUID",
  });

  const rewardSchemaEncoder = new SchemaEncoder(
    "address tokenAddress,bool isErc1155,bool isErc20,uint256 amount,uint256 tokenId,string tokenName",
  );

  const taskSchemaEncoder = new SchemaEncoder(
    "bytes32 communityUID,string name,string description,address creator,uint256 startTime,uint256 endTime,bool recurring,uint256 frequency,string imageURL",
  );

  const applicationSchemaEncoder = new SchemaEncoder("bytes32 taskUID,bytes32 userUID,bytes32[] skillUIDs");
  const startedSchemaEncoder = new SchemaEncoder("bytes32 taskUID,bytes32 userUID,uint256 startTimestamp");
  const completedSchemaEncoder = new SchemaEncoder("bytes32 taskUID,bytes32 userUID,uint256 completeTimestamp");
  const userSchemaEncoder = new SchemaEncoder(
    "address account,string name,bytes32 emailHash,string location,uint8 role",
  );

  useEffect(() => {
    if (communities && communityUID) {
      communities.forEach(comm => {
        if (comm.uid == communityUID) {
          setCommunity(comm.uid);
        }
      });
    }
    getTasks();
  }, [communityUID, taskSchemaUID, community, open, userRegistration]);

  const getTasks = async () => {

    if (taskSchemaUID && rewardSchemaUID && applicationSchemaUID && startedSchemaUID && completedSchemaUID) {
      const taskList = await getTasksForCommunity(
        community,
        taskSchemaUID,
        rewardSchemaUID,
        applicationSchemaUID,
        startedSchemaUID,
        completedSchemaUID,
        taskSchemaEncoder,
        rewardSchemaEncoder,
        applicationSchemaEncoder,
        startedSchemaEncoder,
        userSchemaEncoder,
      );
      console.log("Found %s tasks for community %s", taskList.length, community);
      setTasks(displayTasks(taskList));
    }
  };

  const handleChange = (event: SelectChangeEvent<typeof community>) => {
    const {
      target: { value },
    } = event;
    setCommunity(value);
  };

  return (
    <React.Fragment>
      <Box style={{ backgroundColor: "#F9FFF1" }}>
        {communities && (
          <div className="flex items-left flex-col flex-grow pt-5 pb-5">
            <div className="px-5">
              <Select label="Select a Community" value={community} onChange={handleChange}>
                {communities.map(community => (
                  <MenuItem key={community.uid} value={community.uid}>
                    {community.name}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>
        )}
        <Grid container sx={{ padding: "5px" }}>
          {tasks}
          <Fab
            onClick={() => {
              setOpen(true);
            }}
            color="primary"
            aria-label="add"
            style={{ backgroundColor: "#0E76FD", zIndex: "2", position: "sticky", left: "10px", bottom: "100px" }}
          >
            <AddIcon />
          </Fab>
        </Grid>
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
            <TaskCreationForm communityUID={community} onClose={setOpen} getTasks={getTasks} />
          </Box>
        </Modal>
      </Box>
    </React.Fragment>
  );
};

export default Tasks;
