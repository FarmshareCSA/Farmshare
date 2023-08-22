import Link from "next/link";
import mapsData from "./sampleMapData.json";
import "mapbox-gl/dist/mapbox-gl.css";
import type { NextPage } from "next";
import { BugAntIcon, MagnifyingGlassIcon, SparklesIcon } from "@heroicons/react/24/outline";
import FarmCard from "~~/components/FarmCard";
import MapDisplay from "~~/components/MapDisplay";
import { MetaHeader } from "~~/components/MetaHeader";

const samepleFarms = {
  features: [
    {
      properties: {
        title: "Red Rooster's Farm",
        description:
          "Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all continents except Antarctica",
        img: "https://live.staticflickr.com/65535/50881797506_176f3d534f_z.jpg",
      },
    },
    {
      properties: {
        title: "Red Rooster's Farm",
        description:
          "Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all continents except Antarctica",
        img: "https://live.staticflickr.com/65535/50881797506_176f3d534f_z.jpg",
      },
    },
    {
      properties: {
        title: "Red Rooster's Farm",
        description:
          "Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all continents except Antarctica",
        img: "https://live.staticflickr.com/65535/50881797506_176f3d534f_z.jpg",
      },
    },
    {
      properties: {
        title: "Red Rooster's Farm",
        description:
          "Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all continents except Antarctica",
        img: "https://live.staticflickr.com/65535/50881797506_176f3d534f_z.jpg",
      },
    },
    {
      properties: {
        title: "Red Rooster's Farm",
        description:
          "Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all continents except Antarctica",
        img: "https://live.staticflickr.com/65535/50881797506_176f3d534f_z.jpg",
      },
    },
  ],
};

const Farms: NextPage = () => {
  const hasMapData = "features" in mapsData;
  const geoJson = hasMapData ? mapsData : samepleFarms;
  const sampleKeys = [...Array(geoJson?.features?.length).keys()].map(i => i + 1);

  return (
    <>
      <MetaHeader />
      <MapDisplay geoJson={geoJson} />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">FarmShare</span>
          </h1>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {geoJson?.features.map((farm, idx) => (
            <div key={sampleKeys[idx]}>
              <FarmCard farm={farm} />
            </div>
          ))}
        </div>
        <div className="flex-grow bg-base-100 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contract
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <SparklesIcon className="h-8 w-8 fill-secondary" />
              <p>
                Experiment with{" "}
                <Link href="/example-ui" passHref className="link">
                  Example UI
                </Link>{" "}
                to build your own UI.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Farms;
