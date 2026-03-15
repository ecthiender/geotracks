import { useMemo, useState } from "react";
import { PathLayer, IconLayer, ScatterplotLayer } from "@deck.gl/layers";
import { gpx, kml } from "@tmcw/togeojson";
import type { LayersList } from "@deck.gl/core";

import {
  processGeoJSON,
  type DataArray,
  type PDP,
  type StartEnd,
  type TrackInfo,
  type Waypoint,
} from "./lib";
import {
  DEFAULT_PREFERENCES,
  type AltitudeUnit,
  type DistanceSpeedUnit,
  type Preferences,
} from "./preferences";
import WgPreferences from "./Preferences";
import { WgMap } from "./Map";
import WgTrackInfoManager from "./TrackInfoManager";

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 2,
};

export default function App() {
  const [paths, setPaths] = useState<DataArray[]>([]);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [trackInfo, setTrackInfo] = useState<TrackInfo>({});
  const [preferences, setPreferences] =
    useState<Preferences>(DEFAULT_PREFERENCES);
  const [startend, setStartEnd] = useState<StartEnd | null>(null);
  const [profileData, setProfileData] = useState<PDP[]>([]);
  const [hoveredPDP, setHoveredPDP] = useState<PDP | null>(null);

  // event handler function for file upload event
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    // check if file exists
    const file = e.target.files?.[0];
    if (!file) return;

    // create a file reader
    const reader = new FileReader();

    // attach the event handler to read file contents when loaded
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "text/xml");

      console.log("xml", xml);
      console.log("gpx", gpx(xml));
      let geojson;
      if (file.name.endsWith(".gpx")) geojson = gpx(xml);
      else if (file.name.endsWith(".kml")) geojson = kml(xml);
      else return;

      const track = processGeoJSON(geojson);
      if (track !== null) {
        if (track.start && track.end) {
          setStartEnd({
            start: track.start,
            end: track.end,
          });
        }

        const [minX, minY, maxX, maxY] = track.bounds;
        // todo: animate transition and set to deduced zoom
        const startView = {
          longitude: (minX + maxX) / 2,
          latitude: (minY + maxY) / 2,
          zoom: 5,
        };
        console.log("bounding box", track.bounds);

        setPaths(track.data);
        setWaypoints(track.waypoints);
        setViewState(startView);
        setTrackInfo({
          ...track,
        });
        setProfileData(track.profileData);
      } else {
        alert("Invalid or empty GPX/KML data");
      }
    };

    // trigger the file read action/event
    reader.readAsText(file);
  }

  function handlePreferencesChanged(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    if (event.target.name === "altitude") {
      setPreferences({
        ...preferences,
        altitude: event.target.value as AltitudeUnit,
      });
    } else if (event.target.name === "distance_speed") {
      setPreferences({
        ...preferences,
        distance_speed: event.target.value as DistanceSpeedUnit,
      });
    }
  }

  const layers = useMemo(
    () => makeLayers(paths, waypoints, startend, hoveredPDP),
    [paths, waypoints, startend, hoveredPDP],
  );

  return (
    <>
      <WgPreferences
        preferences={preferences}
        onChange={handlePreferencesChanged}
      />
      <WgTrackInfoManager
        trackInfo={trackInfo}
        profileData={profileData}
        handleFileUpload={handleFileUpload}
        setHoveredPDP={setHoveredPDP}
      />
      <WgMap
        viewState={viewState}
        setViewState={setViewState}
        layers={layers}
        preferences={preferences}
      />
    </>
  );
}

function makeLayers(
  paths: DataArray[],
  waypoints: Waypoint[],
  startend: StartEnd | null,
  hoveredPDP: PDP | null,
): LayersList {
  const layers = [];

  if (paths.length) {
    layers.push(
      // glow layer
      new PathLayer({
        id: "track-glow",
        data: paths,
        getPath: (d) => d.path,
        getWidth: 40,
        getColor: [147, 43, 198, 80],
        widthMinPixels: 8,
      }),
    );
    layers.push(
      // main track
      new PathLayer({
        id: "track",
        data: paths,
        getPath: (d) => d.path,
        getWidth: 10,
        getColor: [147, 43, 198],
        widthMinPixels: 3,
        pickable: true,
      }),
    );
  }

  if (waypoints.length) {
    // waypoints
    layers.push(
      new IconLayer({
        id: "waypoints",
        data: waypoints,
        getPosition: (d) => d.position,
        sizeScale: 8,
        getSize: 4,
        getColor: [125, 206, 255],
        pickable: true,
        iconAtlas:
          "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
        iconMapping:
          "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.json",
        getIcon: () => "marker",
      }),
    );
  }

  if (startend && startend.start) {
    layers.push(
      new IconLayer({
        id: "track-startend-marker",
        data: [
          { t: "start", val: startend.start },
          { t: "end", val: startend.end },
        ],
        getPosition: (d) => d.val,
        sizeScale: 8,
        getSize: 4,
        getColor: (d) => (d.t === "start" ? [43, 194, 54] : [200, 54, 43]),
        iconAtlas:
          "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
        iconMapping:
          "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.json",
        getIcon: () => "marker",
        pickable: true,
      }),
    );
  }

  if (hoveredPDP) {
    layers.push(
      new ScatterplotLayer({
        id: "profile-graph-sync-marker",
        data: [hoveredPDP],
        getPosition: (d) => d.position,
        getRadius: 10,
        radiusMinPixels: 6,
        getFillColor: [220, 240, 50],
      }),
    );
  }

  return layers;
}
