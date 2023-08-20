import { useEffect, useState } from "react";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { getRPCProviderOwner, getZeroDevSigner } from "@zerodevapp/sdk";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { FarmRegistrationForm } from "~~/components/FarmRegistrationForm";
import { MetaHeader } from "~~/components/MetaHeader";
import { UpdateUserForm } from "~~/components/UpdateUserForm";
import { UserRegistrationForm } from "~~/components/UserRegistrationForm";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { UserRole } from "~~/services/eas/customSchemaTypes";
import type { Attestation } from "~~/services/eas/types";
import { getUserAttestationsForAddress } from "~~/services/eas/utils";
import { useGlobalState } from "~~/services/store/store";
import { web3AuthInstance } from "~~/services/web3/wagmiConnectors";

const User: NextPage = () => {
  const { address } = useAccount();
  const userInfo = useGlobalState(state => state.userInfo);
  const userSigner = useGlobalState(state => state.userSigner);
  const userRegistration = useGlobalState(state => state.userRegistration);

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
            userRegistration ? (
              <>
                <p className="text-center text-lg">
                  Welcome back{userInfo && userInfo.name ? " " + userInfo.name.split(" ")[0] : ""}!
                </p>
                <UpdateUserForm />
              </>
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

export default User;
