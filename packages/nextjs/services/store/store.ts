import { UserRegistration } from "../eas/customSchemaTypes";
import { OpenloginUserInfo } from "@web3auth/openlogin-adapter";
import { Address } from "viem";
import create from "zustand";
import { JsonRpcSigner } from "@ethersproject/providers";
import { ZeroDevSigner } from "@zerodevapp/sdk";

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
  userRegistration: UserRegistration | null;
  setUserRegistration: (newRegistration: UserRegistration | null) => void;
  userSmartAccount: Address | null;
  setUserSmartAccount: (newAccount: Address | null) => void;
  userSigner: JsonRpcSigner | ZeroDevSigner | null;
  setUserSigner: (newSigner: JsonRpcSigner | ZeroDevSigner | null) => void;
};

export const useGlobalState = create<TGlobalState>(set => ({
  nativeCurrencyPrice: 0,
  setNativeCurrencyPrice: (newValue: number): void => set(() => ({ nativeCurrencyPrice: newValue })),
  userInfo: null,
  setUserInfo: (newUserInfo: Partial<OpenloginUserInfo>): void => set(() => ({ userInfo: newUserInfo })),
  userRegistration: null,
  setUserRegistration: (newRegistration: UserRegistration | null): void =>
    set(() => ({ userRegistration: newRegistration })),
  userSmartAccount: null,
  setUserSmartAccount: (newAccount: Address | null): void => set(() => ({ userSmartAccount: newAccount })),
  userSigner: null,
  setUserSigner: (newSigner: JsonRpcSigner | ZeroDevSigner | null): void => set(() => ({ userSigner: newSigner })),
}));
