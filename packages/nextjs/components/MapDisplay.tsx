import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

const REACT_APP_MAPBOX_API_KEY = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || "";

mapboxgl.accessToken = REACT_APP_MAPBOX_API_KEY;

export default function MapDisplay({ geoJson }: any) {
  const mapContainer = useRef(null);
  const map = useRef(null as any);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);

  const centerOnRandomFarm = geoJson => {
    const randIndex = Math.floor(Math.random() * geoJson["features"].length);
    map.current.flyTo({
      center: geoJson["features"][randIndex]["geometry"]["coordinates"],
    });
  };

  useEffect(() => {
    if (map.current) {
      return;
    } // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current || "",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });

    const addGeoJson = () => {
      // Add an image to use as a custom marker
      map.current.loadImage("https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png", function (error, image) {
        if (error) throw error;
        map.current.addImage("custom-marker", image);
        // Add a GeoJSON source with multiple points
        map.current.addSource("points", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: geoJson.features,
          },
        });
        // Add a symbol layer
        map.current.addLayer({
          id: "points",
          type: "symbol",
          source: "points",
          layout: {
            "icon-image": "custom-marker",
            // get the title name from the source's "title" property
            "text-field": ["get", "title"],
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 1.25],
            "text-anchor": "top",
          },
        });
        centerOnRandomFarm(geoJson);
      });
    };

    map.current.on("load", addGeoJson);
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });

  return (
    <div>
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
