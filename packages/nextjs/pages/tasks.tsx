import Link from "next/link";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React from "react";
import moment from "moment";
import Grid from '@mui/material/Grid'
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card'
import { CardActionArea } from '@mui/material';
import CardMedia from '@mui/material/CardMedia';
import {useState,useEffect} from 'react'
import TaskCard from "~~/components/TaskCard";
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Modal from '@mui/material/Modal';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

let counter = 0
const sampleTasks = [
    {
      id: 1,
      title: "Harvest Apples",
      startTime: moment().unix(),
      endTime: moment().add(1,'hour').unix(),
      image: "https://rose-miniature-buzzard-757.mypinata.cloud/ipfs/QmYVvxE7Z5h8oioJ5oq9Rmp7TDPBzCZ1TD7oB3JtbPz3B5?_gl=1*ypq8i3*_ga*Mjg4MzM0Mzc4LjE2OTIzODkzNzU.*_ga_5RMPXG14TE*MTY5MjM4OTM3NS4xLjEuMTY5MjM4OTQyNy44LjAuMA..",
      reward: 100
    },
    {
      id: 2,
      title: "Pick Blueberries",
      startTime: moment().unix(),
      endTime: moment().add(1,'hour').unix(),
      image: "https://rose-miniature-buzzard-757.mypinata.cloud/ipfs/QmYbX8wLRHnv89ohqnv8gMguayMueP3htEFWLWXGVyA4wM?_gl=1*1ftzse5*_ga*Mjg4MzM0Mzc4LjE2OTIzODkzNzU.*_ga_5RMPXG14TE*MTY5MjQxMDQwNS4zLjEuMTY5MjQxMDc3Mi42MC4wLjA.",
      reward: 100
    },
    {
      id: 3,
      title: "Pick Strawberries",
      startTime: moment().unix(),
      endTime: moment().add(1,'hour').unix(),
      image: "https://rose-miniature-buzzard-757.mypinata.cloud/ipfs/QmeG29rLGxPwxpLcW57jnyPetqcz2T52DTV7scJkSMViL6?_gl=1*1caqoqa*_ga*Mjg4MzM0Mzc4LjE2OTIzODkzNzU.*_ga_5RMPXG14TE*MTY5MjQxMDQwNS4zLjEuMTY5MjQxMDc3Mi42MC4wLjA.",
      reward: 100
    },
    {
      id: 4,
      title: "Deliver Tomatoes",
      startTime: moment().unix(),
      endTime: moment().add(1,'hour').unix(),
      image: "https://rose-miniature-buzzard-757.mypinata.cloud/ipfs/QmPyq1U6WNJLJ7GTdZLtgUAjZyLDCKA2zHSrwcJ6TbuRyo?_gl=1*1caqoqa*_ga*Mjg4MzM0Mzc4LjE2OTIzODkzNzU.*_ga_5RMPXG14TE*MTY5MjQxMDQwNS4zLjEuMTY5MjQxMDc3Mi42MC4wLjA.",
      reward: 120
    },
    {
      id: 5,
      title: "Harvest Apples",
      startTime: moment().unix(),
      endTime: moment().add(1,'hour').unix(),
      image: "https://rose-miniature-buzzard-757.mypinata.cloud/ipfs/QmdcTBSjZVwFVy1BdcQm5iL2YqjtfwmSyaQgfPyc5v1h1X?_gl=1*1caqoqa*_ga*Mjg4MzM0Mzc4LjE2OTIzODkzNzU.*_ga_5RMPXG14TE*MTY5MjQxMDQwNS4zLjEuMTY5MjQxMDc3Mi42MC4wLjA.",
      reward: 100
    },
    {
      id: 6,
      title: "Pick Blueberries",
      startTime: moment().unix(),
      endTime: moment().add(1,'hour').unix(),
      image:"https://rose-miniature-buzzard-757.mypinata.cloud/ipfs/QmPpTAwNM2zRobp9SVkNZuAAVbTd5iWkqmKa9pPDwcGoqz?_gl=1*1caqoqa*_ga*Mjg4MzM0Mzc4LjE2OTIzODkzNzU.*_ga_5RMPXG14TE*MTY5MjQxMDQwNS4zLjEuMTY5MjQxMDc3Mi42MC4wLjA.",
      reward: 100
    },
    {
      id: 7,
      title: "Pick Strawberries",
      startTime: moment().unix(),
      endTime: moment().add(1,'hour').unix(),
      image: "https://rose-miniature-buzzard-757.mypinata.cloud/ipfs/QmeG29rLGxPwxpLcW57jnyPetqcz2T52DTV7scJkSMViL6?_gl=1*1caqoqa*_ga*Mjg4MzM0Mzc4LjE2OTIzODkzNzU.*_ga_5RMPXG14TE*MTY5MjQxMDQwNS4zLjEuMTY5MjQxMDc3Mi42MC4wLjA.",
      reward: 100
    },
    {
      id: 8,
      title: "Deliver Tomatoes",
      startTime: moment().unix(),
      endTime: moment().add(1,'hour').unix(),
      image: "https://rose-miniature-buzzard-757.mypinata.cloud/ipfs/QmYVvxE7Z5h8oioJ5oq9Rmp7TDPBzCZ1TD7oB3JtbPz3B5?_gl=1*ypq8i3*_ga*Mjg4MzM0Mzc4LjE2OTIzODkzNzU.*_ga_5RMPXG14TE*MTY5MjM4OTM3NS4xLjEuMTY5MjM4OTQyNy44LjAuMA..",
      reward: 120
    },
    {
      id: 9,
      title: "Harvest Apples",
      startTime: moment().unix(),
      endTime: moment().add(1,'hour').unix(),
      image: "https://rose-miniature-buzzard-757.mypinata.cloud/ipfs/QmYbX8wLRHnv89ohqnv8gMguayMueP3htEFWLWXGVyA4wM?_gl=1*1ftzse5*_ga*Mjg4MzM0Mzc4LjE2OTIzODkzNzU.*_ga_5RMPXG14TE*MTY5MjQxMDQwNS4zLjEuMTY5MjQxMDc3Mi42MC4wLjA.",
      reward: 100
    },
    {
      id: 10,
      title: "Pick Blueberries",
      startTime: moment().unix(),
      endTime: moment().add(1,'hour').unix(),
      image:"https://rose-miniature-buzzard-757.mypinata.cloud/ipfs/QmPpTAwNM2zRobp9SVkNZuAAVbTd5iWkqmKa9pPDwcGoqz?_gl=1*1caqoqa*_ga*Mjg4MzM0Mzc4LjE2OTIzODkzNzU.*_ga_5RMPXG14TE*MTY5MjQxMDQwNS4zLjEuMTY5MjQxMDc3Mi42MC4wLjA.",
      reward: 100
    },
    {
      id: 11,
      title: "Pick Strawberries",
      startTime: moment().unix(),
      endTime: moment().add(1,'hour').unix(),
      image: "https://rose-miniature-buzzard-757.mypinata.cloud/ipfs/QmeG29rLGxPwxpLcW57jnyPetqcz2T52DTV7scJkSMViL6?_gl=1*1caqoqa*_ga*Mjg4MzM0Mzc4LjE2OTIzODkzNzU.*_ga_5RMPXG14TE*MTY5MjQxMDQwNS4zLjEuMTY5MjQxMDc3Mi42MC4wLjA.",
      reward: 100
    },
    {
      id: 12,
      title: "Deliver Tomatoes",
      startTime: moment().unix(),
      endTime: moment().add(1,'hour').unix(),
      image:"https://rose-miniature-buzzard-757.mypinata.cloud/ipfs/QmPpTAwNM2zRobp9SVkNZuAAVbTd5iWkqmKa9pPDwcGoqz?_gl=1*1caqoqa*_ga*Mjg4MzM0Mzc4LjE2OTIzODkzNzU.*_ga_5RMPXG14TE*MTY5MjQxMDQwNS4zLjEuMTY5MjQxMDc3Mi42MC4wLjA.",
      reward: 120
    },
    {
      id: 13,
      title: "Harvest Apples",
      startTime: moment().unix(),
      endTime: moment().add(1,'hour').unix(),
      image: "https://rose-miniature-buzzard-757.mypinata.cloud/ipfs/QmYbX8wLRHnv89ohqnv8gMguayMueP3htEFWLWXGVyA4wM?_gl=1*1ftzse5*_ga*Mjg4MzM0Mzc4LjE2OTIzODkzNzU.*_ga_5RMPXG14TE*MTY5MjQxMDQwNS4zLjEuMTY5MjQxMDc3Mi42MC4wLjA.",
      reward: 100
    },
    {
      id: 14,
      title: "Pick Blueberries",
      startTime: moment().unix(),
      endTime: moment().add(1,'hour').unix(),
      image: "https://rose-miniature-buzzard-757.mypinata.cloud/ipfs/QmYVvxE7Z5h8oioJ5oq9Rmp7TDPBzCZ1TD7oB3JtbPz3B5?_gl=1*ypq8i3*_ga*Mjg4MzM0Mzc4LjE2OTIzODkzNzU.*_ga_5RMPXG14TE*MTY5MjM4OTM3NS4xLjEuMTY5MjM4OTQyNy44LjAuMA..",
      reward: 100
    },
    {
      id: 15,
      title: "Pick Strawberries",
      startTime: moment().unix(),
      endTime: moment().add(1,'hour').unix(),
      image:"https://rose-miniature-buzzard-757.mypinata.cloud/ipfs/QmPpTAwNM2zRobp9SVkNZuAAVbTd5iWkqmKa9pPDwcGoqz?_gl=1*1caqoqa*_ga*Mjg4MzM0Mzc4LjE2OTIzODkzNzU.*_ga_5RMPXG14TE*MTY5MjQxMDQwNS4zLjEuMTY5MjQxMDc3Mi42MC4wLjA.",
      reward: 100
    },
    {
      id: 16,
      title: "Deliver Tomatoes",
      startTime: moment().unix(),
      endTime: moment().add(1,'hour').unix(),
      image: "https://rose-miniature-buzzard-757.mypinata.cloud/ipfs/QmeG29rLGxPwxpLcW57jnyPetqcz2T52DTV7scJkSMViL6?_gl=1*1caqoqa*_ga*Mjg4MzM0Mzc4LjE2OTIzODkzNzU.*_ga_5RMPXG14TE*MTY5MjQxMDQwNS4zLjEuMTY5MjQxMDc3Mi42MC4wLjA.",
      reward: 120
    }
]

function getRandomEvenNumber(min, max) {
  const range = (max - min + 1) / 2;
  const randomEven = Math.floor(Math.random() * range) * 2 + min;
  return randomEven;
}



const displayTasks = ()=>{
  let tasksDisplay = <React.Fragment></React.Fragment>
  const tasks: any[] = []
  let counter = 0
  const numberOfTasks = sampleTasks.length;
  sampleTasks.forEach((task,i)=>{
    const width =  getRandomEvenNumber(2,6)
    // console.log('width',width)
    if(counter>=12){
      counter = 0
    }
    if(i===numberOfTasks-1){
      tasks.push(<Grid key={task.id} xs={12-counter} sx={{padding:"5px"}} >
          <TaskCard title={task.title} startTime={task.startTime} endTime={task.endTime} rewards={task.reward} image={task.image}/>
      </Grid>) 
    }
    else 
    if(counter + width <=12){
      counter = counter +  width
      tasks.push(<Grid key={task.id} xs={width}sx={{padding:"5px"}} >
          <TaskCard title={task.title} startTime={task.startTime} endTime={task.endTime} rewards={task.reward} image={task.image}/>
      </Grid>)
    } else {
    
      tasks.push(<Grid key={task.id} xs={12-counter} sx={{padding:"5px"}} >
          <TaskCard title={task.title} startTime={task.startTime} endTime={task.endTime} rewards={task.reward} image={task.image}/>
      </Grid>)
        counter = 12
    }
  })

  tasksDisplay = <React.Fragment>
    <Grid container spacing={2}>
    {...tasks}
    </Grid>
  </React.Fragment>
  return tasksDisplay;
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};


const Tasks: NextPage = () => {

  let [tasks,setTasks] = useState<any>([])
  let [open,setOpen] = useState<any>(false)

  useEffect(()=>{
    setTasks(displayTasks())

  },[])
  
    return (
<React.Fragment>
<Box style={{backgroundColor: '#F9FFF1',}}>
  <Grid container sx={{padding:"5px"}} >
    {tasks}
    <Fab onClick={()=>{setOpen(true)}} color="primary" aria-label="add" style={{backgroundColor:"#0E76FD", zIndex: "2", position:"sticky", left:"10px",bottom:"100px"}}>
        <AddIcon />
    </Fab>
  </Grid>
  <Modal
  open={open}
  onClose={()=>{setOpen(false)}}
  aria-labelledby="modal-modal-title"
  aria-describedby="modal-modal-description"
>
  <Box sx={style}>
    <Typography id="modal-modal-title" variant="h6" component="h2">
      Create Task
    </Typography>
  </Box>
</Modal>   
</Box>
</React.Fragment>
    );
};

export default Tasks;
