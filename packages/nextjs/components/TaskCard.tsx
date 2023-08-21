import * as React from "react";
import { useEffect, useState } from "react";
import { Button, CardActionArea, CardActions } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import moment from "moment";

export default function TaskCard({
  title,
  startTime,
  endTime,
  rewards,
  image,
}: {
  title: any;
  startTime: any;
  endTime: any;
  rewards: any;
  image: any;
}) {
  let [showDetails, setShowDetails] = useState<any>(false);
  let [content, setContent] = useState<any>(<React.Fragment></React.Fragment>);

  React.useEffect(() => {
    if (!showDetails) {
      setContent(
        <Card sx={{ height: "350px", borderRadius: "20px" }}>
          <CardActionArea style={{ height: "100%" }} onClick={() => setShowDetails(true)}>
            <CardMedia component="img" sx={{ height: "60%" }} image={image} alt="green iguana" />
            <CardContent sx={{ height: "40%" }}>
              <Typography gutterBottom variant="body2" component="div">
                {moment.unix(startTime).format("MMM D, YYYY, HH:mmA") +
                  " - " +
                  moment.unix(endTime).format("MMM D, YYYY, HH:mmA")}
              </Typography>
              <Typography variant="h6" color="black" sx={{ fontWeight: "bold" }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {"Reward: " + rewards}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>,
      );
    } else {
      setContent(
        <Card sx={{ height: "350px", borderRadius: "20px", backgroundColor: "#545454" }}>
          <CardContent>
            <Typography sx={{ fontSize: 14 }} color="white" gutterBottom>
              {moment.unix(startTime).format("MMM D, YYYY, HH:mmA") +
                " - " +
                moment.unix(endTime).format("MMM D, YYYY, HH:mmA")}
            </Typography>
            <Typography variant="h5" color="white" component="div">
              {title}
            </Typography>
            <Typography variant="body2" color="white">
              {"Reward: " + rewards}
            </Typography>
          </CardContent>
          <CardActions>
            <Button variant="contained" style={{ backgroundColor: "rgb(46, 125, 50)" }}>
              Apply for Task
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
        </Card>,
      );
    }
  }, [showDetails]);

  return <React.Fragment>{content}</React.Fragment>;
}
