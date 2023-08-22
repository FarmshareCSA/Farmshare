import { useEffect, useState } from "react";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import type { NextPage } from "next";
import invariant from "tiny-invariant";
import CommunityCard from "~~/components/CommunityCard";
import { CommunityRegistrationForm } from "~~/components/CommunityRegistrationForm";
import FarmCard from "~~/components/FarmCard";
import { MetaHeader } from "~~/components/MetaHeader";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { Community } from "~~/services/eas/customSchemaTypes";
import { Attestation } from "~~/services/eas/types";
import { getAllAttestationsForSchema, getAttestation } from "~~/services/eas/utils";

const getCommunity = async (uid: string) => {
  const attestation = await getAttestation(uid);
  invariant(attestation, "Attestation not found");
  const communitySchemaEncoder = new SchemaEncoder(
    "string name,string description,string city,string state,string country,string postalCode,string websiteURL,string imageURL",
  );
  const decodedData = communitySchemaEncoder.decodeData(attestation.data);

  return {
    uid: attestation.id,
    name: decodedData[0].value.value.toString(),
    description: decodedData[1].value.value.toString(),
    city: decodedData[2].value.value.toString(),
    state: decodedData[3].value.value.toString(),
    country: decodedData[4].value.value.toString(),
    postalCode: decodedData[5].value.value.toString(),
    websiteURL: decodedData[6].value.value.toString(),
    imageURL: decodedData[7].value.value.toString(),
  } as Community;
};

const Farms: NextPage = () => {
  const [communities, setCommunities] = useState<Community[]>([]);

  const { data: communitySchemaUID } = useScaffoldContractRead({
    contractName: "CommunityRegistry",
    functionName: "registrationSchemaUID",
  });

  useEffect(() => {
    const getCommunityAttestations = async () => {
      if (communitySchemaUID) {
        const tmpAttestations = await getAllAttestationsForSchema(communitySchemaUID);
        const tmpCommunities: Community[] = [];
        for (let i = 0; i < tmpAttestations.length; i++) {
          tmpCommunities.push(await getCommunity(tmpAttestations[i].id));
        }
        setCommunities(tmpCommunities);
      }
    };
    getCommunityAttestations();
  });

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="grid grid-cols-3 gap-4">
          {communities.map(community => (
            <div key={community.uid}>
              <CommunityCard community={community} />
            </div>
          ))}
        </div>
        <div className="flex-grow bg-base-100 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <h3 className="text-center mb-8">
              <span className="block text-4xl font-bold">
                Don't see a community near you?
                <br />
                Create a new community!
              </span>
            </h3>
            <CommunityRegistrationForm />
          </div>
        </div>
      </div>
    </>
  );
};

export default Farms;
