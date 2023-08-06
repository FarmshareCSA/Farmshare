import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { useAccount } from "wagmi";
import { getUserAttestationsForAddress } from "~~/services/eas/utils";
import { useState, useEffect } from "react";
import type {
  Attestation,
} from "~~/services/eas/types";
import { UserRegistrationForm } from "~~/components/UserRegistrationForm";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { UserRole } from "~~/services/eas/customSchemaTypes";
import { FarmRegistrationForm } from "~~/components/FarmRegistrationForm";

const Home: NextPage = () => {
  const { address } = useAccount();
  const userInfo = useGlobalState(state => state.userInfo);
  const userRegistration = useGlobalState(state => state.userRegistration);
  const setUserRegistration = useGlobalState(state => state.setUserRegistration);
  const [userAttestations, setUserAttestations] = useState<Attestation[]>([])

  const userSchemaEncoder = new SchemaEncoder(
    "address account,string name,string email,string phone,string location,uint8 role",
  );

  const { data: schemaUID } = useScaffoldContractRead({
    contractName: "UserRegistry",
    functionName: "registrationSchemaUID",
  });

  useEffect(() => {
    const getUserAttestations = async () => {
      const tmpAttestations = await getUserAttestationsForAddress(
        address ? address : "",
        schemaUID ? schemaUID : ""
      )
      setUserAttestations(tmpAttestations);
      if (tmpAttestations.length > 0) {
        const decodedData = userSchemaEncoder.decodeData(tmpAttestations[0].data);
        setUserRegistration({
          account: decodedData[0].value.value.toString(),
          name: decodedData[1].value.value.toString(),
          email: decodedData[2].value.value.toString(),
          phone: decodedData[3].value.value.toString(),
          location: decodedData[4].value.value.toString(),
          role: Number(decodedData[5].value.value)
        })
      }
    }
    getUserAttestations();
  }, [address, userRegistration])

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">FarmShare</span>
          </h1>
          { address ? 
            userAttestations.length > 0 || userRegistration ? (
              <p className="text-center text-lg">
                Welcome back{ userInfo && userInfo.name ? " " + userInfo.name.split(" ")[0] : ""}!
              </p>
            ) : (
              <UserRegistrationForm />
            )
          : (
            <p className="text-center text-lg">
              Get started by logging in with your preferred social account, email, phone or wallet. 
              Just hit <i>Log In</i> in the top-right corner!
            </p>
          ) }
          { userRegistration && userRegistration.role == UserRole.Farmer && <FarmRegistrationForm /> }
        </div>
      </div>
    </>
  );
};

export default Home;
