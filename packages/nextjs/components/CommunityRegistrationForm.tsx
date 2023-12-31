import { ChangeEvent, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Spinner } from "./Spinner";
import { InputBase } from "./scaffold-eth";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { Buffer } from "buffer";
import { create } from "ipfs-http-client";
import invariant from "tiny-invariant";
import { useNetwork } from "wagmi";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";
import { contracts } from "~~/utils/scaffold-eth/contract";
import { getAllAttestationsForSchema, getAttestation, getUserAttestationsForAddress } from "~~/services/eas/utils";
import { Community } from "~~/services/eas/customSchemaTypes";

const AddressMapBoxForm = dynamic(() => import("~~/components/AddressMapBoxForm"), {
  ssr: false,
});

export const CommunityRegistrationForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [streetAddress, setStreetAddress] = useState("Search here: we only store city, state, country & postal code");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { chain } = useNetwork();
  const signer = useGlobalState(state => state.userSigner);
  const userRegistration = useGlobalState(state => state.userRegistration);
  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;
  const setCommunities= useGlobalState(state => state.setCommunities);

  /* configure Infura IPFS auth settings */
  const projectId = "2TcFlGWq8noGJV2ylEnCVpqCr30";
  const projectSecret = "9223442241ffe73e4c965a24b685c35a";
  const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

  /* create the IPFS client */
  const client = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: auth,
    },
  });

  const { data: communitySchemaUID } = useScaffoldContractRead({
    contractName: "CommunityRegistry",
    functionName: "registrationSchemaUID",
  });

  const { data: schemaUID } = useScaffoldContractRead({
    contractName: "CommunityRegistry",
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
  const schemaEncoder = new SchemaEncoder(
    "string name,string description,string city,string state,string country,string postalCode,string websiteURL,string imageURL",
  );

  const handleImage = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files == null) return;
    const file = e.target.files[0];
    try {
      const added = await client.add(file);
      const url = `https://infura-ipfs.io/ipfs/${added.path}`;
      setImageUrl(url);
      console.log("IPFS URI: ", url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

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

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      invariant(signer, "Signer must be defined");
      eas.connect(signer as any);
      const address = await signer.getAddress();
      const userUID = userRegistration?.uid;
      invariant(userUID && userUID != "0x0", "user must be registered");
      invariant(schemaUID, "schema UID must be defined");
      const encodedData = schemaEncoder.encodeData([
        { name: "name", value: name, type: "string" },
        { name: "description", value: description, type: "string" },
        { name: "city", value: city, type: "string" },
        { name: "state", value: state, type: "string" },
        { name: "country", value: country, type: "string" },
        { name: "postalCode", value: postalCode, type: "string" },
        { name: "websiteURL", value: website, type: "string" },
        { name: "imageURL", value: imageUrl, type: "string" },
      ]);

      const tx = await eas.attest({
        schema: schemaUID,
        data: {
          recipient: address,
          expirationTime: BigInt(0),
          revocable: false,
          data: encodedData,
        },
      });

      const newAttestationUID = await tx.wait();

      console.log("New attestation UID:", newAttestationUID);
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
      setSubmitting(false);
      notification.success("You successfully registered your community!");
      // window.location.reload();
    } catch (error: any) {
      console.error("⚡️ ~ file: CommunityRegistrationForm.tsx:handleSubmit ~ error", error);
      notification.error(error.toString());
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
      <InputBase
        value={name}
        onChange={e => setName(e)}
        placeholder="Catskills Farming Community"
        prefix={
          <span className="self-center cursor-pointer text-xl font-semibold px-3 text-accent">
            <Image src="/nametag.png" alt="name tag" width={40} height={40} />
          </span>
        }
      />
      <InputBase
        value={description}
        onChange={e => setDescription(e)}
        placeholder="A description of the community"
        prefix={<span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">📝</span>}
      />
      <InputBase
        value={website}
        onChange={e => setWebsite(e)}
        placeholder="Community website (optional)"
        prefix={<span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">🌐</span>}
      />
      <AddressMapBoxForm
        address={streetAddress}
        setAddress={setStreetAddress}
        city={city}
        setCity={setCity}
        state={state}
        setState={setState}
        country={country}
        setCountry={setCountry}
        postalCode={postalCode}
        setPostalCode={setPostalCode}
      />
      <div className={`flex border-2 border-base-300 bg-base-200 rounded-full text-accent`}>
        <span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">📷</span>
        <input
          name="image"
          type="file"
          accept="image/*"
          className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400"
          onChange={e => handleImage(e)}
        />
      </div>
      {imageUrl && (
        <div>
          <img src={imageUrl} width="600px" />
          {/* <a href={imageUrl} target="_blank">{imageUrl}</a> */}
        </div>
      )}
      <button className={`btn btn-secondary btn-sm`} disabled={writeDisabled || submitting} onClick={handleSubmit}>
        {submitting ? <Spinner /> : "Register 📝"}
      </button>
    </div>
  );
};
