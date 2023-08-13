import { useEffect, useState } from "react";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { FarmRegistrationForm } from "~~/components/FarmRegistrationForm";
import { MetaHeader } from "~~/components/MetaHeader";
import { UserRegistrationForm } from "~~/components/UserRegistrationForm";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { UserRole } from "~~/services/eas/customSchemaTypes";
import type { Attestation } from "~~/services/eas/types";
import { getUserAttestationsForAddress } from "~~/services/eas/utils";
import { useGlobalState } from "~~/services/store/store";
import { getZeroDevSigner, getRPCProviderOwner } from "@zerodevapp/sdk";
import { web3AuthInstance } from "~~/services/web3/wagmiConnectors";

const Home: NextPage = () => {
  const { address } = useAccount();
  const userInfo = useGlobalState(state => state.userInfo);
  const userSmartAccount = useGlobalState(state => state.userSmartAccount);
  const userRegistration = useGlobalState(state => state.userRegistration);
  const setUserRegistration = useGlobalState(state => state.setUserRegistration);
  const setUserSmartAccount = useGlobalState(state => state.setUserSmartAccount);
  const setUserSigner = useGlobalState(state => state.setUserSigner);
  const [userAttestations, setUserAttestations] = useState<Attestation[]>([]);
  const defaultProjectId = process.env.REACT_APP_ZERODEV_PROJECT_ID || 'ec01b08b-f7a8-4f47-924d-0a1b1879a468'

  const userSchemaEncoder = new SchemaEncoder(
    "address account,string name,bytes32 emailHash,string location,uint8 role",
  );

  const { data: schemaUID } = useScaffoldContractRead({
    contractName: "UserRegistry",
    functionName: "registrationSchemaUID",
  });

  useEffect(() => {
    const getUserAttestations = async () => {
      const tmpAttestations = await getUserAttestationsForAddress(
        userSmartAccount ? userSmartAccount : address ? address : "", 
        schemaUID ? schemaUID : ""
      );
      setUserAttestations(tmpAttestations);
      if (tmpAttestations.length > 0) {
        const decodedData = userSchemaEncoder.decodeData(tmpAttestations[0].data);
        setUserRegistration({
          account: decodedData[0].value.value.toString(),
          name: decodedData[1].value.value.toString(),
          emailHash: decodedData[2].value.value.toString(),
          location: decodedData[3].value.value.toString(),
          role: Number(decodedData[4].value.value),
        });
      } else {
        setUserRegistration(null);
      }
    };
    getUserAttestations();
  }, [address, userRegistration, userSmartAccount]);

  useEffect(() => {
    const tryZeroDevSigner = async () => {
      if (web3AuthInstance) {
        const tmpSigner = await getZeroDevSigner({
          projectId: defaultProjectId,
          owner: getRPCProviderOwner(web3AuthInstance.provider),
        })
        setUserSigner(tmpSigner);
        console.log(tmpSigner);
        const tmpAddress = await tmpSigner.getAddress()
        console.log("Smart account address: %s", tmpAddress)
        if (tmpAddress) {
          setUserSmartAccount(tmpAddress)
        }
      }
    };
    tryZeroDevSigner();
    
  }, [web3AuthInstance, address]);

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">FarmShare</span>
          </h1>
          {address ? (
            userAttestations.length > 0 || userRegistration ? (
              <p className="text-center text-lg">
                Welcome back{userInfo && userInfo.name ? " " + userInfo.name.split(" ")[0] : ""}!
              </p>
            ) : (
              <UserRegistrationForm />
            )
          ) : (
            <p className="text-center text-lg">
              Get started by logging in with your preferred social account, email, phone or wallet. Just hit{" "}
              <i>Log In</i> in the top-right corner!
            </p>
          )}
          {userRegistration && userRegistration.role == UserRole.Farmer && <FarmRegistrationForm />}
        </div>
      </div>
    </>
  );
};

export default Home;
