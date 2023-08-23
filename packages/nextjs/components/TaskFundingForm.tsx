import { useEffect, useState } from "react";
import { Spinner } from "./Spinner";
import { TokenBalance } from "./scaffold-eth/TokenBalance";
import { FormControlLabel, MenuItem, Select, Switch, TextField } from "@mui/material";
import { Contract } from "ethers";
import moment from "moment";
import invariant from "tiny-invariant";
import { parseEther } from "viem";
import { useNetwork, useWalletClient } from "wagmi";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { UserRole } from "~~/services/eas/customSchemaTypes";
import { getUserAttestationsForAddress } from "~~/services/eas/utils";
import { useGlobalState } from "~~/services/store/store";
import { walletClientToSigner } from "~~/services/web3/ethers";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";
import { contracts } from "~~/utils/scaffold-eth/contract";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export const TaskFundingForm = ({ taskUID, onClose }: any) => {
  const [amount, setAmount] = useState(0);
  const [farmUID, setFarmUID] = useState<`0x${string}`>("0x0");
  const [token, setToken] = useState("0x4200000000000000000000000000000000000006");
  const [startTime, setStartTime] = useState(moment().format("yyyy-MM-DDThh:mm"));
  const [endTime, setEndTime] = useState(moment().add(7, "day").format("yyyy-MM-DDThh:mm"));
  const [submitting, setSubmitting] = useState(false);
  const { chain } = useNetwork();
  let signer = useGlobalState(state => state.userSigner);
  const account = useGlobalState(state => state.userSmartAccount);
  const userRegistration = useGlobalState(state => state.userRegistration);
  const [fundWithShares, setFundWithShares] = useState(
    userRegistration?.role == UserRole.Farmer || userRegistration?.role == UserRole.Manager,
  );
  const { data: walletClient } = useWalletClient();

  const taskRegistry =
    chain && contracts
      ? contracts[chain.id]?.[0]?.["contracts"]?.["TaskRegistry"]
        ? contracts[chain.id]?.[0]?.["contracts"]?.["TaskRegistry"].address
        : "0x39959bfCFBE21E2BE590f4a3EB2Fbe2403Af32cB"
      : "0x39959bfCFBE21E2BE590f4a3EB2Fbe2403Af32cB";

  const farmSharesAddress =
    chain && contracts
      ? contracts[chain.id]?.[0]?.["contracts"]?.["FarmShares"]
        ? contracts[chain.id]?.[0]?.["contracts"]?.["FarmShares"].address
        : "0xFF2d8417c275F06e69392C08B6b4292D556409f5"
      : "0xFF2d8417c275F06e69392C08B6b4292D556409f5";

  const farmSharesABI = [
    "function mint(address to, uint256 id, uint256 amount, bytes calldata data) public",
    "function balanceOf(address account, uint256 id) external view returns (uint256 balance)",
  ];

  const taskRegistryABI = [
    "function fundTaskWithFarmShares(bytes32 taskUID,bytes32 farmUID,uint amount) public",
    "function fundTaskWithERC20(bytes32 taskUID,address tokenAddress,uint amount) public returns (bytes32 taskFundedUID)",
  ];

  const erc20ApproveABI = [
    "function approve(address guy, uint wad) public returns (bool)",
    "function balanceOf(address account) public view returns (uint256)",
  ];

  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;

  const { data: farmSchemaUID } = useScaffoldContractRead({
    contractName: "FarmRegistry",
    functionName: "registrationSchemaUID",
  });

  const erc20s = [
    {
      name: "USDC",
      address: "0x4e2AA48F22718968D911DD65eDC5a9C59437dF3D",
    },
    {
      name: "WETH",
      address: "0x4200000000000000000000000000000000000006",
    },
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (!signer && walletClient) {
        signer = walletClientToSigner(walletClient);
      }
      invariant(signer, "Signer must be defined");
      if (fundWithShares) {
        console.log(
          `Mint args: to: ${taskRegistry} id: ${BigInt(farmUID)} amount: ${BigInt(amount)} taskUID: ${taskUID}`,
        );

        const taskRegistryContract = new Contract(taskRegistry, taskRegistryABI, signer);
        const receipt = await taskRegistryContract.fundTaskWithFarmShares(taskUID, farmUID, amount * 1e2);
        await receipt.wait();
        const farmSharesContract = new Contract(farmSharesAddress, farmSharesABI, signer);

        console.log(
          `TaskRegistry shares balance: ${await farmSharesContract.balanceOf(taskRegistry, BigInt(farmUID))}`,
        );
      } else {
        // Fund with ERC-20
        const erc20Contract = new Contract(token, erc20ApproveABI, signer);
        const erc20Amount = parseEther(amount.toString());
        const approveReceipt = await erc20Contract.approve(taskRegistry, erc20Amount);
        await approveReceipt.wait();
        const taskRegistryContract = new Contract(taskRegistry, taskRegistryABI, signer);
        const receipt = await taskRegistryContract.fundTaskWithERC20(taskUID, token, erc20Amount);
        await receipt.wait();
        console.log(`TaskRegistry shares balance: ${await erc20Contract.balanceOf(taskRegistry)}`);
      }
      setSubmitting(false);
      notification.success("You successfully funded a task");
      onClose(false);
    } catch (error: any) {
      console.error("⚡️ ~ file: TaskFundingForm.tsx:handleSubmit ~ error", error);
      notification.error(error.toString());
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const getFarmUID = async () => {
      if (farmSchemaUID && account) {
        const farmAttestations = await getUserAttestationsForAddress(account, farmSchemaUID);
        if (farmAttestations.length > 0) {
          const farmAttestation = farmAttestations[0];
          setFarmUID(farmAttestation.id);
        }
      }
    };
    if (userRegistration && (userRegistration.role == UserRole.Farmer || userRegistration.role == UserRole.Manager))
      getFarmUID();
  }, [farmSchemaUID, account, userRegistration]);

  return (
    <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
      {(userRegistration?.role == UserRole.Farmer || userRegistration?.role == UserRole.Manager) && (
        <FormControlLabel
          control={
            <Switch
              checked={fundWithShares}
              onChange={e => setFundWithShares(e.target.checked)}
              name="fundWithShares"
            />
          }
          label="Fund with farm shares"
        />
      )}
      {!fundWithShares && (
        <>
          <Select
            labelId="select-multiple-chip-label"
            id="select-multiple-chip"
            value={token}
            onChange={e => setToken(e.target.value)}
            MenuProps={MenuProps}
          >
            {erc20s.map(erc20 => (
              <MenuItem key={erc20.address} value={erc20.address}>
                {erc20.name}
              </MenuItem>
            ))}
          </Select>
          {account && <TokenBalance address={account} token={token} />}
        </>
      )}
      <TextField
        label="Amount"
        value={amount}
        type="number"
        onChange={e => setAmount(parseFloat(e.target.value))}
        placeholder="Token amount"
        inputProps={{
          step: "0.0001",
        }}
        InputProps={{
          startAdornment: <span className="self-center cursor-pointer text-xl font-semibold px-3 text-accent">💰</span>,
        }}
      />
      <button className={`btn btn-secondary btn-sm`} disabled={writeDisabled || submitting} onClick={handleSubmit}>
        {submitting ? <Spinner /> : "Fund Task 💸"}
      </button>
    </div>
  );
};
