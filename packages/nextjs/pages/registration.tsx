import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { RegistrationForm } from "~~/components/RegistrationForm";

const Register: NextPage = () => {
  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <RegistrationForm />
      </div>
    </>
  );
};

export default Register;
