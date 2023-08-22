import React from "react";
import { InputBase } from "./scaffold-eth";
import { AddressAutofill } from "@mapbox/search-js-react";

// const REACT_APP_MAPBOX_API_KEY = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || "";
const REACT_APP_MAPBOX_API_KEY =
  "pk.eyJ1IjoidW1hcjk2IiwiYSI6ImNsbDl5ZHBxcTBocjgzcG56aXZrMzUzNWkifQ.ysIeMTq4U_kJpQSniYOmCA";

export const AddressMapBoxForm = ({
  address,
  setAddress,
  city,
  setCity,
  state,
  setState,
  country,
  setCountry,
  postalCode,
  setPostalCode,
}: {
  address: string;
  setAddress: (newAddress: string) => void;
  city: string;
  setCity: (newCity: string) => void;
  state: string;
  setState: (newState: string) => void;
  country: string;
  setCountry: (newCountry: string) => void;
  postalCode: string;
  setPostalCode: (newPostalCode: string) => void;
}) => {
  const handleCountry = (e: any) => {
    setCountry(e.toUpperCase());
  };

  return (
    <form className="flex flex-col gap-3">
      <AddressAutofill accessToken={REACT_APP_MAPBOX_API_KEY}>
        <InputBase
          value={address}
          onChange={e => setAddress(e)}
          placeholder="123 Main St."
          prefix={<span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">📍</span>}
          autoComplete="address-line1"
        />
      </AddressAutofill>
      <InputBase
        value={city}
        onChange={e => setCity(e)}
        placeholder="Farmtown"
        prefix={<span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">🎡</span>}
        autoComplete="address-level2"
      />
      <InputBase
        value={state}
        onChange={e => setState(e)}
        placeholder="NY"
        prefix={<span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">🏛️</span>}
        autoComplete="address-level1"
      />
      <InputBase
        value={country}
        onChange={handleCountry}
        placeholder="US"
        prefix={<span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">🏔️</span>}
        autoComplete="country"
      />
      <InputBase
        value={postalCode}
        onChange={e => setPostalCode(e)}
        placeholder="12345"
        prefix={<span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">⛱️</span>}
        autoComplete="postal-code"
      />
    </form>
  );
};

export default AddressMapBoxForm;
