import * as React from "react";
import { Button, CardActionArea, CardActions } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";

export default function FarmCard({ farm }: any) {
  const { description, img, title, websiteURL } = farm?.properties;
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardMedia component="img" height="140" image={img} alt="Image Not Found" />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {title || "No Title"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description || "No Description"}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size="small" color="primary" href={websiteURL}>
          Visit Website
        </Button>
      </CardActions>
    </Card>
  );
}
