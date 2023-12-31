import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { FarmRegistrationForm } from "~~/components/FarmRegistrationForm";
import { MetaHeader } from "~~/components/MetaHeader";
import { UpdateUserForm } from "~~/components/UpdateUserForm";
import { UserRegistrationForm } from "~~/components/UserRegistrationForm";
import { UserSkillsForm } from "~~/components/UserSkillsForm";
import { UserRole } from "~~/services/eas/customSchemaTypes";
import { useGlobalState } from "~~/services/store/store";

const User: NextPage = () => {
  const { address } = useAccount();
  const userInfo = useGlobalState(state => state.userInfo);
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
                <UserSkillsForm />
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
        </div>
      </div>
    </>
  );
};

export default User;
