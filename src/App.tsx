import { useState } from "react";
import { PathLayer, ScatterplotLayer, IconLayer } from "@deck.gl/layers";
import { gpx, kml } from "@tmcw/togeojson";
import type { LayersList } from "@deck.gl/core";

import WgTrackInfo from "./TrackInfo";
import WgPreferences, {
  DEFAULT_PREFERENCES,
  type AltitudeUnit,
  type DistanceSpeedUnit,
  type Preferences,
} from "./Preferences";
import { WgMap } from "./Map";
import {
  processGeoJSON,
  type DataArray,
  type StartEnd,
  type TrackInfo,
  type Waypoint,
} from "./lib";
import WgImportTrack from "./ImportTrack";

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
  const [startend, setStartEnd] = useState<StartEnd | undefined>(undefined);

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

      let geojson;
      if (file.name.endsWith(".gpx")) geojson = gpx(xml);
      else if (file.name.endsWith(".kml")) geojson = kml(xml);
      else return;

      const track = processGeoJSON(geojson);
      if (track.start && track.end) {
        setStartEnd({
          start: track.start,
          end: track.end,
        });
      }
      setPaths(track.data);
      setWaypoints(track.waypoints);
      setViewState(track.startView);
      setTrackInfo({
        ...track,
      });
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

  const layers = makeLayers(paths, waypoints, startend);

  return (
    <>
      <WgPreferences
        preferences={preferences}
        onChange={handlePreferencesChanged}
      />
      <WgImportTrack onUpload={handleFileUpload} />
      <WgTrackInfo trackInfo={trackInfo} />
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
  startend?: StartEnd,
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
        getColor: [255, 0, 0, 80],
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
        getColor: [255, 0, 0],
        widthMinPixels: 3,
        pickable: true,
      }),
    );
  }

  if (waypoints.length) {
    // waypoints
    layers.push(
      new ScatterplotLayer({
        id: "waypoints",
        data: waypoints,
        getPosition: (d) => d.position,
        getRadius: 30,
        radiusMinPixels: 4,
        getFillColor: [0, 200, 255],
        pickable: true,
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
        getColor: (d) => (d.t === "start" ? [120, 200, 180] : [220, 10, 200]),
        iconAtlas:
          "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
        iconMapping:
          "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.json",
        getIcon: () => "marker",
        pickable: true,
      }),
    );
  }
  return layers;
}
