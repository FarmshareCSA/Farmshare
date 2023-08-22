import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { getRPCProviderOwner, getZeroDevSigner } from "@zerodevapp/sdk";
import NextNProgress from "nextjs-progressbar";
import { Toaster } from "react-hot-toast";
import { useDarkMode } from "usehooks-ts";
import { WagmiConfig, useAccount } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import Wrapper from "~~/components/Wrapper";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import type { Attestation } from "~~/services/eas/types";
import { getUserAttestationsForAddress } from "~~/services/eas/utils";
import { useGlobalState } from "~~/services/store/store";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { appChains } from "~~/services/web3/wagmiConnectors";
import { web3AuthInstance } from "~~/services/web3/wagmiConnectors";
import "~~/styles/globals.css";

const ScaffoldEthApp = ({ Component, pageProps }: AppProps) => {
  const price = useNativeCurrencyPrice();
  const setNativeCurrencyPrice = useGlobalState(state => state.setNativeCurrencyPrice);
  const setUserInfo = useGlobalState(state => state.setUserInfo);
  const setUserSmartAccount = useGlobalState(state => state.setUserSmartAccount);
  const setUserSigner = useGlobalState(state => state.setUserSigner);
  // This variable is required for initial client side rendering of correct theme for RainbowKit
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [userAttestations, setUserAttestations] = useState<Attestation[]>([]);
  const { isDarkMode } = useDarkMode();
  const { address, connector } = useAccount();

  const defaultProjectId = process.env.REACT_APP_ZERODEV_PROJECT_ID || "ec01b08b-f7a8-4f47-924d-0a1b1879a468";

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const userSmartAccount = useGlobalState(state => state.userSmartAccount);
  const userRegistration = useGlobalState(state => state.userRegistration);
  const [userRegIsNull, setUserRegIsNull] = useState(userRegistration == null);
  const setUserRegistration = useGlobalState(state => state.setUserRegistration);

  const userRegistrationSchemaEncoder = new SchemaEncoder(
    "address account,string name,bytes32 emailHash,string location,uint8 role",
  );

  const userUpdateSchemaEncoder = new SchemaEncoder(
    "address newAccount,string newName,bytes32 newEmailHash,string newLocation,uint8 newRole",
  );

  useEffect(() => {
    if (price > 0) {
      setNativeCurrencyPrice(price);
    }
  }, [setNativeCurrencyPrice, price]);

  useEffect(() => {
    setIsDarkTheme(isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        if (web3AuthInstance) {
          const userInfo = await web3AuthInstance.getUserInfo();
          console.log(userInfo);
          setUserInfo(userInfo);
        }
      } catch (error) {
        console.error(error);
      }
    };
    getUserInfo();
  }, [connector, setUserInfo]);

  useEffect(() => {
    const tryZeroDevSigner = async () => {
      if (web3AuthInstance && address) {
        const tmpSigner = await getZeroDevSigner({
          projectId: defaultProjectId,
          owner: getRPCProviderOwner(web3AuthInstance.provider),
        });
        setUserSigner(tmpSigner);
        const tmpAddress = await tmpSigner.getAddress();
        if (tmpAddress) {
          setUserSmartAccount(tmpAddress);
        }
      }
    };
    tryZeroDevSigner();
  }, [address, defaultProjectId, setUserSigner, setUserSmartAccount]);

  return (
    mounted && (
      <WagmiConfig config={wagmiConfig}>
        <NextNProgress />
        <RainbowKitProvider
          chains={appChains.chains}
          avatar={BlockieAvatar}
          theme={isDarkTheme ? darkTheme() : lightTheme()}
        >
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="relative flex flex-col flex-1">
              <Wrapper>
                <Component {...pageProps} />
              </Wrapper>
            </main>
            <Footer />
          </div>
          <Toaster />
        </RainbowKitProvider>
      </WagmiConfig>
    )
  );
};

export default ScaffoldEthApp;
