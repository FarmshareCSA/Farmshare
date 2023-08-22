import * as React from "react";
import { Spinner } from "./Spinner";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { Button, CardActionArea, CardActions } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import invariant from "tiny-invariant";
import { useNetwork } from "wagmi";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { getCommunityMembershipAttestation, getUserAttestationsForAddress } from "~~/services/eas/utils";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";
import { contracts } from "~~/utils/scaffold-eth/contract";

export default function CommunityCard({ community }: any) {
  const { uid, name, description, imageURL } = community;
  const userRegistration = useGlobalState(state => state.userRegistration);
  const signer = useGlobalState(state => state.userSigner);
  const { chain } = useNetwork();
  const [joined, setJoined] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const { data: schemaUID } = useScaffoldContractRead({
    contractName: "CommunityRegistry",
    functionName: "memberSchemaUID",
  });

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

  // Initialize SchemaEncoder with the schema string
  const schemaEncoder = new SchemaEncoder("bytes32 userUID,uint8 memberRole");

  React.useEffect(() => {
    const checkCommunityMembership = async () => {
      if (userRegistration && signer && schemaUID) {
        const address = await signer.getAddress();
        const tmpAttestations = await getCommunityMembershipAttestation(address, uid, schemaUID);
        console.log("Found %s membership attestations", tmpAttestations.length);
        if (tmpAttestations.length > 0) setJoined(true);
      }
    };
    checkCommunityMembership();
  }, [userRegistration, signer, schemaUID, submitting]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      invariant(signer, "Signer must be defined");
      eas.connect(signer as any);
      const address = await signer.getAddress();
      invariant(userRegistration, "user must be registered");
      const userUID = userRegistration.uid;
      invariant(userUID && userUID != "0x0", "user must be registered");
      invariant(schemaUID, "schema UID must be defined");
      const encodedData = schemaEncoder.encodeData([
        { name: "userUID", value: userUID, type: "bytes32" },
        { name: "memberRole", value: userRegistration.role, type: "uint8" },
      ]);

      const tx = await eas.attest({
        schema: schemaUID,
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

      setSubmitting(false);
      notification.success("You successfully joined the community");
    } catch (error: any) {
      console.error("⚡️ ~ file: RegistrationForm.tsx:handleSubmit ~ error", error);
      notification.error(error.toString());
      setSubmitting(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardMedia component="img" height="140" image={imageURL} alt="Image Not Found" />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {name || "No Title"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description || "No Description"}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size="small" color="primary" onClick={handleSubmit} disabled={joined}>
          {submitting ? <Spinner /> : joined ? "Joined" : "Join Community"}
        </Button>
      </CardActions>
    </Card>
  );
}
