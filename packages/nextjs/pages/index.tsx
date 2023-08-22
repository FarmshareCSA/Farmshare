import { useEffect, useState } from "react";
import Link from "next/link";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MapIcon, UserIcon, UserPlusIcon, UsersIcon } from "@heroicons/react/24/outline";
import { FarmRegistrationForm } from "~~/components/FarmRegistrationForm";
import { MetaHeader } from "~~/components/MetaHeader";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { UserRole } from "~~/services/eas/customSchemaTypes";
import type { Attestation } from "~~/services/eas/types";
import { getUserAttestationsForAddress } from "~~/services/eas/utils";
import { useGlobalState } from "~~/services/store/store";

const Home: NextPage = () => {
  const { address } = useAccount();
  const userInfo = useGlobalState(state => state.userInfo);
  const userSmartAccount = useGlobalState(state => state.userSmartAccount);
  const userRegistration = useGlobalState(state => state.userRegistration);
  const [userRegIsNull, setUserRegIsNull] = useState(userRegistration == null);
  const setUserRegistration = useGlobalState(state => state.setUserRegistration);
  const [userAttestations, setUserAttestations] = useState<Attestation[]>([]);

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

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true)
}, [])

  useEffect(() => {
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

  return ( mounted &&
    (<>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">FarmShare</span>
          </h1>
        </div>
        {address ? (
          userAttestations.length > 0 || userRegistration ? (
            <>
              <p className="text-center text-lg">
                Welcome back{userInfo && userInfo.name ? " " + userInfo.name.split(" ")[0] : ""}!
              </p>
              <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
                <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
                  <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
                    <UserIcon className="h-8 w-8 fill-secondary" />
                    <p>
                      View and manage your account using the{" "}
                      <Link href="/user" passHref className="link">
                        My Account
                      </Link>{" "}
                      tab.
                    </p>
                  </div>
                  <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
                    <UsersIcon className="h-8 w-8 fill-secondary" />
                    <p>
                      View ways to earn shares of food in your{" "}
                      <Link href="/tasks" passHref className="link">
                        Community Dashboard
                      </Link>
                    </p>
                  </div>
                  <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
                    <MapIcon className="h-8 w-8 fill-secondary" />
                    <p>
                      Explore and find local farms near you with the{" "}
                      <Link href="/farms" passHref className="link">
                        Farm Map
                      </Link>{" "}
                      tab.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
              <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
                <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
                  <UserPlusIcon className="h-8 w-8 fill-secondary" />
                  <p>
                    Sign up with FarmShare using the{" "}
                    <Link href="/user" passHref className="link">
                      Account Registration
                    </Link>{" "}
                    tab.
                  </p>
                </div>
              </div>
            </div>
          )
        ) : (
          <p className="text-center text-lg">
            Get started by logging in with your preferred social account, email, phone or wallet. Just hit <i>Log In</i>{" "}
            in the top-right corner!
          </p>
        )}
        {userRegistration && userRegistration.role == UserRole.Farmer && <FarmRegistrationForm />}
      </div>
    </>
  ));
};

export default Home;
