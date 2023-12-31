// AddressValidationForm.js
import React, { useState } from "react";
import { InputBase } from "./scaffold-eth";
import { Client } from "@googlemaps/google-maps-services-js";

const { REACT_APP_GMAPS_API_KEY } = process.env;
// const REACT_APP_GMAPS_API_KEY = "AIzaSyA_Hgokq2qwvhF8chsX3JHwd9IJbg68qMU";
// console.log(REACT_APP_GMAPS_API_KEY);

const AddressValidationForm = () => {
  const [location, setLocation] = useState("");
  const [validationMessage, setValidationMessage] = useState("");

  const validateAddress = async () => {
    const client = new Client();
    try {
      const response = await client.geocode({
        params: {
          address: location,
          components: "country:US",
          key: REACT_APP_GMAPS_API_KEY || "NO KEY",
        },
      });

      if (response.data.status === "OK") {
        const formattedAddress = response.data.results[0].formatted_address;
        setValidationMessage(`Valid address: ${formattedAddress}`);
      } else {
        setValidationMessage("Invalid address");
      }
    } catch (error) {
      console.error(error);
      setValidationMessage("Error occurred while validating the address");
    }
  };

  return (
    <div>
      {/* <input type="text" placeholder="Enter address" value={address} onChange={e => setAddress(e.target.value)} /> */}
      <InputBase
        value={location}
        onChange={e => setLocation(e)}
        // placeholder="123 Main St., Farmtown, NY"
        placeholder={"123 Main St., Farmtown, NY" || "NO KEY"}
        prefix={<span className="self-center cursor-pointer text-xl font-semibold px-4 text-accent">📍</span>}
      />
      <button onClick={validateAddress}>Validate Address</button>
      <p>{validationMessage}</p>
    </div>
  );
};

export default AddressValidationForm;
