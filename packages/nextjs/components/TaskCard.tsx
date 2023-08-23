import * as React from "react";
import { useEffect, useState } from "react";
import { TaskFundingForm } from "./TaskFundingForm";
import { Box, Button, CardActionArea, CardActions, Modal } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import moment from "moment";
// import style from "styled-jsx/style";
import { TaskReward } from "~~/services/eas/customSchemaTypes";
import { useGlobalState } from "~~/services/store/store";

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
  const userAddress = useGlobalState(state => state.userSmartAccount);
  let [showDetails, setShowDetails] = useState<any>(false);
  let [content, setContent] = useState<any>(<React.Fragment></React.Fragment>);

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
                    <span key={index}>
                      {reward.amount} {reward.tokenName}
                    </span>
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
                    <span key={index}>
                      {reward.amount} {reward.tokenName}
                    </span>
                  ))}
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button variant="contained" style={{ backgroundColor: "rgb(46, 125, 50)" }}>
                Apply
              </Button>
              <Button
                variant="contained"
                style={{ backgroundColor: "rgb(46, 125, 50)" }}
                onClick={() => {
                  setOpen(true);
                }}
              >
                Fund
              </Button>
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
        </>,
      );
    }
  }, [showDetails, open]);

  return <React.Fragment>{content}</React.Fragment>;
}
