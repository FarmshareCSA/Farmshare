import Image  from 'next/image';
import { useState } from "react";
import { useGlobalState } from "~~/services/store/store";
import { InputBase } from "./scaffold-eth";
import { useNetwork } from "wagmi";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import invariant from "tiny-invariant";
import { contracts } from "~~/utils/scaffold-eth/contract";
import { useEthersSigner } from '~~/services/web3/ethers';
import { useScaffoldContractRead } from '~~/hooks/scaffold-eth';

export const RegistrationForm = () => {
    const userInfo = useGlobalState(state => state.userInfo);
    const [name, setName] = useState(userInfo?.name || "");
    const [email, setEmail] = useState(userInfo?.email || "");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(false);
    const { chain } = useNetwork();
    const signer = useEthersSigner();
    const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;

    const { data: schemaUID } = useScaffoldContractRead({
        contractName: "UserRegistry",
        functionName: "schemaUID",
    });

    const easAddress =
    chain && contracts
      ? contracts[chain.id][0]["contracts"]["EAS"]
        ? contracts[chain.id][0]["contracts"]["EAS"].address
        : "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"
      : "0xC2679fBD37d54388Ce493F1DB75320D236e1815e";
    if (chain) {
        console.log("EAS contract address on %s: %s", chain.name, easAddress);
    } else {
        console.log("network.chain is undefined");
    }
    const eas = new EAS(easAddress);
    
    // Initialize SchemaEncoder with the schema string
    const schemaEncoder = new SchemaEncoder(
        "address account,string name,string email,string phone,string location,uint8 role",
    );

    const handleSubmit = async () => {
        setLoading(true);
        try {
            invariant(signer, "Signer must be defined");
            eas.connect(signer);
            const address = await signer.getAddress()
            invariant(schemaUID, "schema UID must be defined");
            const encodedData = schemaEncoder.encodeData([
                { name: "account", value: address, type: "address" },
                { name: "name", value: name, type: "string" },
                { name: "email", value: email, type: "string" },
                { name: "phone", value: phone, type: "string" },
                { name: "location", value: location, type: "string" },
                { name: "role", value: role, type: "uint8" },
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
            <p className="font-medium my-0 break-words">Enter your info</p>
            <InputBase value={name} onChange={e => setName(e)} placeholder="Jane T. Farmer" prefix={
                <span className="self-center cursor-pointer text-xl font-semibold px-3 text-accent">
                    <Image src="/nametag.png" alt='name tag' width={40} height={40}/>
                </span>
            } />
            <InputBase value={email} onChange={e => setEmail(e)} placeholder="janefarmer@gmail.com" prefix={
                <span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">📧</span>
            } />
            <InputBase value={phone} onChange={e => setPhone(e)} placeholder="123-456-7890" prefix={
                <span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">☎️</span>
            } />
            <InputBase value={location} onChange={e => setLocation(e)} placeholder="123 Main St., Farmtown, NY" prefix={
                <span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">📍</span>
            } />
            <div className={`flex border-2 border-base-300 bg-base-200 rounded-full text-accent`}>
                <span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">🧑‍🌾</span>
                <select 
                    name='role' 
                    className='input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400'
                    onChange={e => setRole(e.target.value)}
                >
                    <option value=''>Select Role</option>
                    <option value='0'>Community Member</option>
                    <option value='3'>Farmer</option>
                    <option value='2'>Farm Manager</option>
                    <option value='1'>Donor</option>
                </select>
            </div>
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
