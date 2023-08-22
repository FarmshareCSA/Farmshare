import * as React from "react";
import { Button, CardActionArea, CardActions } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { getRPCProviderOwner, getZeroDevSigner } from "@zerodevapp/sdk";
import NextNProgress from "nextjs-progressbar";
import { Toaster } from "react-hot-toast";
import { useDarkMode } from "usehooks-ts";
import { WagmiConfig, useAccount } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { appChains } from "~~/services/web3/wagmiConnectors";
import { web3AuthInstance } from "~~/services/web3/wagmiConnectors";
import { getUserAttestationsForAddress } from "~~/services/eas/utils";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import type { Attestation } from "~~/services/eas/types";


export default function Wrapper(props: any) {

    const setNativeCurrencyPrice = useGlobalState(state => state.setNativeCurrencyPrice);
    const setUserInfo = useGlobalState(state => state.setUserInfo);
    const setUserSmartAccount = useGlobalState(state => state.setUserSmartAccount);
    const setUserSigner = useGlobalState(state => state.setUserSigner);

    const userSmartAccount = useGlobalState(state => state.userSmartAccount);
    const userRegistration = useGlobalState(state => state.userRegistration);
    const [userRegIsNull, setUserRegIsNull] = useState(userRegistration == null);
    const setUserRegistration = useGlobalState(state => state.setUserRegistration);
    const [userAttestations, setUserAttestations] = useState<Attestation[]>([]);
    const { address, connector } = useAccount();
  
    const userRegistrationSchemaEncoder = new SchemaEncoder(
      "address account,string name,bytes32 emailHash,string location,uint8 role",
    );
  
    const userUpdateSchemaEncoder = new SchemaEncoder(
      "address newAccount,string newName,bytes32 newEmailHash,string newLocation,uint8 newRole",
    );
  
    const { data: registrationSchemaUID } = useScaffoldContractRead({
      contractName: "UserRegistry",
      functionName: "registrationSchemaUID",
    });
  
    const { data: updateSchemaUID } = useScaffoldContractRead({
      contractName: "UserRegistry",
      functionName: "updateSchemaUID",
    });

    React.useEffect(() => {
        const getUserAttestations = async () => {
          let tmpAttestations = await getUserAttestationsForAddress(
            userSmartAccount ? userSmartAccount : address ? address : "",
            updateSchemaUID ? updateSchemaUID : "",
          );
          if (tmpAttestations.length == 0) {
            tmpAttestations = await getUserAttestationsForAddress(
              userSmartAccount ? userSmartAccount : address ? address : "",
              registrationSchemaUID ? registrationSchemaUID : "",
            );
          }
          setUserAttestations(tmpAttestations);
          if (tmpAttestations.length > 0) {
            // Found initial user record
            console.log("Found user registration...");
            const decodedData = userRegistrationSchemaEncoder.decodeData(tmpAttestations[0].data);
            setUserRegistration({
              uid: tmpAttestations[0].id,
              account: decodedData[0].value.value.toString(),
              name: decodedData[1].value.value.toString(),
              emailHash: decodedData[2].value.value.toString(),
              location: decodedData[3].value.value.toString(),
              role: Number(decodedData[4].value.value),
            });
            setUserRegIsNull(false);
          } else {
            console.log("Did not find user registration");
            setUserRegistration(null);
          }
        };
        getUserAttestations();
        console.log("User registration UID: %s", userRegistration?.uid);
      }, [
        address,
        registrationSchemaUID,
        setUserRegistration,
        updateSchemaUID,
        userRegIsNull,
        userRegistration?.uid,
        userRegistrationSchemaEncoder,
        userSmartAccount,
      ]);
  
  return (
    <React.Fragment>
        {props.children}
    </React.Fragment>
  );
}
