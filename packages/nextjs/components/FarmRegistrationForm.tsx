import Image  from 'next/image';
import { ChangeEvent, useState } from "react";
import { InputBase } from "./scaffold-eth";
import { useNetwork } from "wagmi";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import invariant from "tiny-invariant";
import { contracts } from "~~/utils/scaffold-eth/contract";
import { useEthersSigner } from '~~/services/web3/ethers';
import { useScaffoldContractRead } from '~~/hooks/scaffold-eth';
import { create } from 'ipfs-http-client'
import { Buffer } from 'buffer'

export const FarmRegistrationForm = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [website, setWebsite] = useState("");
    const [country, setCountry] = useState("");
    const [state, setState] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const { chain } = useNetwork();
    const signer = useEthersSigner();
    const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;

    /* configure Infura IPFS auth settings */
    const projectId = "2TcFlGWq8noGJV2ylEnCVpqCr30";
    const projectSecret = "9223442241ffe73e4c965a24b685c35a";
    const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

    /* create the IPFS client */
    const client = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
            authorization: auth,
        },
    })

    const { data: schemaUID } = useScaffoldContractRead({
        contractName: "FarmRegistry",
        functionName: "registrationSchemaUID",
    });

    const easAddress =
    chain && contracts
      ? contracts[chain.id]?.[0]?.["contracts"]?.["EAS"]
        ? contracts[chain.id]?.[0]?.["contracts"]?.["EAS"]?.address
        : "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"
      : "0xC2679fBD37d54388Ce493F1DB75320D236e1815e";
    const eas = new EAS(easAddress);
    
    // Initialize SchemaEncoder with the schema string
    const schemaEncoder = new SchemaEncoder(
        "bytes32 ownerUID,string farmName,string description,string country,string state,string postalCode,string websiteUrl,string imageURL",
    );

    const handleImage = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files == null) return;
        const file = e.target.files[0]
        try {
          const added = await client.add(file)
          const url = `https://infura-ipfs.io/ipfs/${added.path}`
          setImageUrl(url)
          console.log("IPFS URI: ", url)
        } catch (error) {
          console.log('Error uploading file: ', error)
        } 
    }

    const handleSubmit = async () => {
        setLoading(true);
        try {
            invariant(signer, "Signer must be defined");
            eas.connect(signer);
            const address = await signer.getAddress()
            const { data: userUID } = useScaffoldContractRead({
                contractName: "UserRegistry",
                functionName: "userRegistrations",
                args: [address]
            });
            invariant(userUID && userUID != "0x0", "user must be registered")
            invariant(schemaUID, "schema UID must be defined");
            const encodedData = schemaEncoder.encodeData([
                { name: "ownerUID", value: userUID, type: "address" },
                { name: "farmName", value: name, type: "string" },
                { name: "description", value: description, type: "string" },
                { name: "country", value: country, type: "string" },
                { name: "state", value: state, type: "string" },
                { name: "postalCode", value: postalCode, type: "string" },
                { name: "websiteUrl", value: website, type: "string" },
                { name: "imageUrl", value: website, type: "string" },
              ]);
      
              const tx = await eas.attest({
                schema: schemaUID,
                data: {
                  recipient: address,
                  expirationTime: 0,
                  revocable: false,
                  data: encodedData,
                },
              });
      
              const newAttestationUID = await tx.wait();
      
              console.log("New attestation UID:", newAttestationUID);

            setLoading(false);
            notification.success("You successfully registered!")
        } catch (error: any) {
            console.error("⚡️ ~ file: RegistrationForm.tsx:handleSubmit ~ error", error);
            notification.error(error.toString())
            setLoading(false);
        }
        
    };
    
    return (
        <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
            <p className="font-medium my-0 break-words">Ready to register your farm?</p>
            <InputBase value={name} onChange={e => setName(e)} placeholder="Apple Pond Farm" prefix={
                <span className="self-center cursor-pointer text-xl font-semibold px-3 text-accent">
                    <Image src="/nametag.png" alt='name tag' width={40} height={40}/>
                </span>
            } />
            <InputBase value={description} onChange={e => setDescription(e)} placeholder="A description of my farm" prefix={
                <span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">📝</span>
            } />
            <InputBase value={website} onChange={e => setWebsite(e)} placeholder="www.applepondfarm.com" prefix={
                <span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">🌐</span>
            } />
            <InputBase value={country} onChange={e => setCountry(e)} placeholder="Canada" prefix={
                <span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">🇨🇦</span>
            } />
            <InputBase value={country} onChange={e => setState(e)} placeholder="Ontario" prefix={
                <span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">📍</span>
            } />
            <InputBase value={country} onChange={e => setState(e)} placeholder="M5A 1A4" prefix={
                <span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">✉️</span>
            } />
            <div className={`flex border-2 border-base-300 bg-base-200 rounded-full text-accent`}>
                <span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">📷</span>
                <input 
                    name='image' 
                    type='file'
                    accept='image/*'
                    className='input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400'
                    onChange={e => handleImage(e)}
                />
            </div>
            {
                imageUrl && (
                <div>
                    <img src={imageUrl} width="600px" />
                    {/* <a href={imageUrl} target="_blank">{imageUrl}</a> */}
                </div>
                )
            }
            <button
              className={`btn btn-secondary btn-sm`}
              disabled={writeDisabled || loading}
              onClick={handleSubmit}
            >
              Register 📝
            </button>
        </div>
    );
};
