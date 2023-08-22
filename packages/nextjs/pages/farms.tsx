import { useEffect, useState } from "react";
import Link from "next/link";
import mapsData from "./sampleMapData.json";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import "mapbox-gl/dist/mapbox-gl.css";
import type { NextPage } from "next";
import { useNetwork } from "wagmi";
import FarmCard from "~~/components/FarmCard";
import { FarmRegistrationForm } from "~~/components/FarmRegistrationForm";
import MapDisplay from "~~/components/MapDisplay";
import { MetaHeader } from "~~/components/MetaHeader";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { Farm, UserRole } from "~~/services/eas/customSchemaTypes";
import { getAllAttestationsForSchema } from "~~/services/eas/utils";
import { useGlobalState } from "~~/services/store/store";
import { contracts } from "~~/utils/scaffold-eth/contract";

const samepleFarms = {
  features: [
    {
      properties: {
        title: "Red Rooster's Farm",
        description:
          "Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all continents except Antarctica",
        img: "https://live.staticflickr.com/65535/50881797506_176f3d534f_z.jpg",
      },
    },
    {
      properties: {
        title: "Red Rooster's Farm",
        description:
          "Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all continents except Antarctica",
        img: "https://live.staticflickr.com/65535/50881797506_176f3d534f_z.jpg",
      },
    },
    {
      properties: {
        title: "Red Rooster's Farm",
        description:
          "Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all continents except Antarctica",
        img: "https://live.staticflickr.com/65535/50881797506_176f3d534f_z.jpg",
      },
    },
    {
      properties: {
        title: "Red Rooster's Farm",
        description:
          "Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all continents except Antarctica",
        img: "https://live.staticflickr.com/65535/50881797506_176f3d534f_z.jpg",
      },
    },
    {
      properties: {
        title: "Red Rooster's Farm",
        description:
          "Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all continents except Antarctica",
        img: "https://live.staticflickr.com/65535/50881797506_176f3d534f_z.jpg",
      },
    },
  ],
};

const Farms: NextPage = () => {
  const hasMapData = "features" in mapsData;
  const geoJson = hasMapData ? mapsData : samepleFarms;
  const sampleKeys = [...Array(geoJson?.features?.length).keys()].map(i => i + 1);

  const userRegistration = useGlobalState(state => state.userRegistration);
  const smartAccount = useGlobalState(state => state.userSmartAccount);
  const [userFarmIsRegistered, setUserFarmIsRegistered] = useState(false);
  const [farms, setFarms] = useState<Farm[]>([]);
  const { chain } = useNetwork();

  const { data: farmSchemaUID } = useScaffoldContractRead({
    contractName: "FarmRegistry",
    functionName: "registrationSchemaUID",
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
  const farmSchemaEncoder = new SchemaEncoder(
    "bytes32 ownerUID,string name,string description,string streetAddress,string city,string state,string country,string postalCode,string latAndLong,string websiteUrl,string imageUrl",
  );

  useEffect(() => {
    const getFarmRegistrations = async () => {
      if (farmSchemaUID && userRegistration) {
        const farmAttestations = await getAllAttestationsForSchema(farmSchemaUID);
        const farmList: Farm[] = [];
        farmAttestations.forEach(attestation => {
          const decodedData = farmSchemaEncoder.decodeData(attestation.data);
          if (decodedData[0].value.value == userRegistration.uid) setUserFarmIsRegistered(true);
          farmList.push({
            uid: attestation.id,
            owner: decodedData[0].value.value.toString(),
            name: decodedData[1].value.value.toString(),
            description: decodedData[2].value.value.toString(),
            streetAddress: decodedData[3].value.value.toString(),
            city: decodedData[4].value.value.toString(),
            state: decodedData[5].value.value.toString(),
            country: decodedData[6].value.value.toString(),
            postalCode: decodedData[7].value.value.toString(),
            latAndLong: decodedData[8].value.value.toString(),
            websiteURL: decodedData[9].value.value.toString(),
            imageURL: decodedData[10].value.value.toString(),
          });
        });
        setFarms(farmList);
      }
    };
    getFarmRegistrations();
  }, [farmSchemaUID, userFarmIsRegistered]);

  return (
    <>
      <MetaHeader />
      <MapDisplay geoJson={geoJson} />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">FarmShare</span>
          </h1>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {geoJson?.features.map((farm, idx) => (
            <div key={sampleKeys[idx]}>
              <FarmCard farm={farm} />
            </div>
          ))}
        </div>
        <div className="flex-grow bg-base-100 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            {userRegistration && userRegistration.role == UserRole.Farmer && !userFarmIsRegistered && (
              <>
                <h3 className="text-center mb-8">
                  <span className="block text-4xl font-bold">
                    🚜 <br />
                    Ready to register your farm?
                  </span>
                </h3>
                <FarmRegistrationForm onSubmit={setUserFarmIsRegistered} />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Farms;
