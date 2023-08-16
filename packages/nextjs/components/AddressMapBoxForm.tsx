import React from "react";
import { useState } from "react";
import { InputBase } from "./scaffold-eth";
import { AddressAutofill } from "@mapbox/search-js-react";

const MAPBOX_TOKEN = "pk.eyJ1IjoidW1hcjk2IiwiYSI6ImNsbDl5ZHBxcTBocjgzcG56aXZrMzUzNWkifQ.ysIeMTq4U_kJpQSniYOmCA";

export const AddressMapBoxForm = () => {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");

  const [postalCode, setPostalCode] = useState("");

  const handleCountry = (e: any) => {
    setCountry(e.toUpperCase());
  };

  return (
    <form className="flex flex-col gap-3">
      <AddressAutofill accessToken={MAPBOX_TOKEN}>
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
