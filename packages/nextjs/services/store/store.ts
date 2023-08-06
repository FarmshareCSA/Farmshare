import create from "zustand";
import { OpenloginUserInfo } from "@web3auth/openlogin-adapter";

/**
 * Zustand Store
 *
 * You can add global state to the app using this useGlobalState, to get & set
 * values from anywhere in the app.
 *
 * Think about it as a global useState.
 */

type TGlobalState = {
  nativeCurrencyPrice: number;
  setNativeCurrencyPrice: (newNativeCurrencyPriceState: number) => void;
  userInfo: Partial<OpenloginUserInfo> | null;
  setUserInfo: (newUserInfo: Partial<OpenloginUserInfo>) => void;
};

export const useGlobalState = create<TGlobalState>(set => ({
  nativeCurrencyPrice: 0,
  setNativeCurrencyPrice: (newValue: number): void => set(() => ({ nativeCurrencyPrice: newValue })),
  userInfo: null,
  setUserInfo: (newUserInfo: Partial<OpenloginUserInfo>): void => set(() => ({ userInfo: newUserInfo })),
}));
