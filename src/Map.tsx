import { Map } from "react-map-gl/maplibre";
import DeckGL from "@deck.gl/react";
import type { LayersList, MapViewState, Viewport } from "@deck.gl/core";

import {
  calculateDistance,
  calculateInstantSpeed,
  nearestPoint,
  parseDate,
  type Waypoint,
} from "./lib";
import type { DistanceSpeedUnit, Preferences } from "./preferences";

export function WgMap({
  viewState,
  setViewState,
  layers,
  preferences,
}: {
  viewState: MapViewState;
  setViewState: any;
  layers: LayersList;
  preferences: Preferences;
}) {
  return (
    <DeckGL
      viewState={viewState}
      onViewStateChange={(e: any) => setViewState(e.viewState)}
      controller={true}
      layers={layers}
      getTooltip={(info) => {
        if (!info.object || !info.coordinate || !info.viewport) return null;
        return generateTooltip(
          info.object,
          info.coordinate,
          info.viewport,
          preferences,
        );
      }}
    >
      <Map
        mapStyle={{
          version: 8,
          sources: {
            satellite: {
              type: "raster",
              tiles: [
                "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
              ],
              tileSize: 256,
            },
            esri_labels: {
              type: "raster",
              tiles: [
                "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
              ],
              tileSize: 256,
            },
          },
          layers: [
            {
              id: "satellite",
              type: "raster",
              source: "satellite",
            },
            {
              id: "labels",
              type: "raster",
              source: "esri_labels",
            },
          ],
        }}
      />
    </DeckGL>
  );
}

type TooltipContent = { text: string } | { html: string } | null;

function generateTooltip(
  object: any,
  coord: number[],
  viewport: Viewport,
  preferences: Preferences,
): TooltipContent {
  if ("path" in object) {
    return generatePathTooltip(object, coord, viewport, preferences);
  } else if ("position" in object) {
    return generateWaypointTooltip(object);
  } else if ("t" in object) {
    return { html: capitalize(object.t).big() };
  }
  return null;
}

function generateWaypointTooltip(object: Waypoint): TooltipContent {
  let descs = "";
  if (object.desc?.length) {
    object.desc.forEach((d) => {
      descs += "<div>" + d + "</div>";
    });
  }
  return {
    html: `
      <div>
        <div><strong>${object.name ?? ""}</strong></div>
        <div> <strong> Timestamp: </strong> ${object.time?.toLocaleString() ?? ""} </div>
        <div> <strong> Description: </strong> </div>
        <div> ${descs} </div>
      </div>
      `.trim(),
  };
}

function generatePathTooltip(
  object: any,
  coord: number[],
  viewport: Viewport,
  preferences: Preferences,
): TooltipContent {
  const nearest = nearestPoint(object.path, coord, viewport);
  if (!nearest || nearest.pos.length < 3) return null;
  const [elevation, elevation_unit] =
    preferences.altitude == "meters"
      ? [nearest.pos[2], "m"]
      : [nearest.pos[2] * 3.28084, "ft"];
  const elev = parseFloat(elevation.toFixed(1)).toLocaleString();
  const timestamp = parseDate(object.timestamps[nearest.idx]);
  const dist = calculateDistance(
    nearest,
    object,
    preferences.distance_speed,
  ).toFixed(1);
  const speed = calculateInstantSpeed(
    nearest,
    object,
    preferences.distance_speed,
  )?.toFixed(1);
  const speed_unit = speedUnitDisplay(preferences.distance_speed);
  const dist_unit = distanceUnitDisplay(preferences.distance_speed);
  return {
    html: `
      <div> Time: ${timestamp.toLocaleTimeString()} <div>
      <div> Elevation: ${elev} ${elevation_unit} </div>
      <div> Speed: ${speed} ${speed_unit} <div>
      <div> Distance: ${dist} ${dist_unit} <div>
    `,
  };
}

function capitalize(s: string): string {
  if (s.length === 0) return "";
  return s[0].toUpperCase() + s.slice(1);
}

function speedUnitDisplay(s: DistanceSpeedUnit): string {
  return s === "miles" ? "mph" : "km/h";
}

function distanceUnitDisplay(s: DistanceSpeedUnit): string {
  return s === "miles" ? "miles" : "km";
}
