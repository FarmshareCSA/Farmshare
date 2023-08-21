import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { getRPCProviderOwner, getZeroDevSigner } from "@zerodevapp/sdk";
import NextNProgress from "nextjs-progressbar";
import { Toaster } from "react-hot-toast";
import { useDarkMode } from "usehooks-ts";
import { WagmiConfig, useAccount } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
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
  const { isDarkMode } = useDarkMode();
  const { address, connector } = useAccount();

  const defaultProjectId = process.env.REACT_APP_ZERODEV_PROJECT_ID || "ec01b08b-f7a8-4f47-924d-0a1b1879a468";

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
  }, [connector]);

  useEffect(() => {
    const tryZeroDevSigner = async () => {
      if (web3AuthInstance && address) {
        const tmpSigner = await getZeroDevSigner({
          projectId: defaultProjectId,
          owner: getRPCProviderOwner(web3AuthInstance.provider),
        });
        setUserSigner(tmpSigner);
        console.log(tmpSigner);
        const tmpAddress = await tmpSigner.getAddress();
        console.log("Smart account address: %s", tmpAddress);
        if (tmpAddress) {
          setUserSmartAccount(tmpAddress);
        }
      }
    };
    tryZeroDevSigner();
  }, [web3AuthInstance]);

  return (
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
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
        <Toaster />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default ScaffoldEthApp;
