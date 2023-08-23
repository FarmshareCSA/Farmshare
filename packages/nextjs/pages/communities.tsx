import type { NextPage } from "next";
import CommunityCard from "~~/components/CommunityCard";
import { CommunityRegistrationForm } from "~~/components/CommunityRegistrationForm";
import { MetaHeader } from "~~/components/MetaHeader";
import { useGlobalState } from "~~/services/store/store";

const Communities: NextPage = () => {
  const communities= useGlobalState(state => state.communities);

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="grid grid-cols-3 gap-4">
          {communities &&
            communities.map(community => (
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

export default Communities;
