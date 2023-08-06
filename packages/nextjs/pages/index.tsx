import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { useAccount } from "wagmi";
import { getUserAttestationsForAddress } from "~~/services/eas/utils";
import { useState, useEffect } from "react";
import type {
  Attestation,
} from "~~/services/eas/types";
import { UserRegistrationForm } from "~~/components/UserRegistrationForm";

const Home: NextPage = () => {
  const { address } = useAccount();
  const [userAttestations, setUserAttestations] = useState<Attestation[]>([])

  useEffect(() => {
    const getUserAttestations = async () => {
      setUserAttestations(await getUserAttestationsForAddress(address ? address : ""));
    }
    getUserAttestations();
  }, [address])

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
            userAttestations.length > 0 ? (
              <p className="text-center text-lg">
                Welcome back!
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
        </div>
      </div>
    </>
  );
};

export default Home;
