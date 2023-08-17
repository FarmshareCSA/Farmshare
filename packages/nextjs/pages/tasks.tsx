import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import moment from "moment";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const sampleTasks = [
  {
    id: 1,
    title: "Harvest Apples",
    startTime: moment(),
    endTime: moment().add(1, "hour"),
    reward: 100,
  },
  {
    id: 1,
    title: "Pick Blueberries",
    startTime: moment(),
    endTime: moment().add(1, "hour"),
    reward: 100,
  },
  {
    id: 1,
    title: "Pick Strawberries",
    startTime: moment(),
    endTime: moment().add(1, "hour"),
    reward: 100,
  },
  {
    id: 1,
    title: "Deliver Tomatoes",
    startTime: moment(),
    endTime: moment().add(1, "hour"),
    reward: 120,
  },
];

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const card = (title: any, startTime: any, endTime: any, rewards: any) => (
  <div>
    <CardContent>
      <Typography variant="h5" component="div">
        {title}
      </Typography>
      <Typography sx={{ mb: 1.5 }} color="text.secondary">
        {startTime.format("h:mm a")} - {endTime.format("h:mm a")}
      </Typography>
      <Typography variant="body2">{"Reward: " + rewards}</Typography>
    </CardContent>
    <CardActions>
      <Button size="small">Details</Button>
    </CardActions>
  </div>
);

const Farms: NextPage = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" variant="fullWidth">
          <Tab label="Today" {...a11yProps(0)} />
          <Tab label="Tommorow" {...a11yProps(1)} />
          <Tab label={moment().add(2, "days").format("MMMM DD")} {...a11yProps(2)} />
          <Tab label={moment().add(3, "days").format("MMMM DD")} {...a11yProps(3)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        {sampleTasks.map(task => (
          <Card variant="outlined" style={{ marginBottom: "1rem" }}>
            {card(task.title, task.startTime, task.endTime, task.reward)}
          </Card>
        ))}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        {sampleTasks.map(task => (
          <Card variant="outlined" style={{ marginBottom: "1rem" }}>
            {card(task.title, task.startTime, task.endTime, task.reward)}
          </Card>
        ))}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        {sampleTasks.map(task => (
          <Card variant="outlined" style={{ marginBottom: "1rem" }}>
            {card(task.title, task.startTime, task.endTime, task.reward)}
          </Card>
        ))}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        {sampleTasks.map(task => (
          <Card variant="outlined" style={{ marginBottom: "1rem" }}>
            {card(task.title, task.startTime, task.endTime, task.reward)}
          </Card>
        ))}
      </CustomTabPanel>
    </Box>
  );
};

export default Farms;
