/// The main core module to have all the core concepts, types, functions, algorithms etc.

import { bbox, type AllGeoJSON } from "@turf/turf";
import { length, lineString, distance, point } from "@turf/turf";
import type { Viewport, MapViewState } from "@deck.gl/core";
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Position,
} from "geojson";
import type { DistanceSpeedUnit } from "./Preferences";

export interface Track {
  data: DataArray[];
  waypoints: Waypoint[];
  start?: Position;
  end?: Position;
  startView: MapViewState;
  name?: string;
  desc?: string;
  duration?: number;
  length?: number;
  timestamp?: Date;
  createTime?: Date;
  profileData: PDP[];
}

export interface PDP {
  distance: number;
  elevation: number;
  timestamp: Date;
}

export interface TrackInfo {
  name?: string;
  desc?: string;
  duration?: number;
  length?: number;
  timestamp?: Date;
  createTime?: Date;
}

export interface DataArray {
  path: Position[];
  timestamps: string[];
}

export interface Waypoint {
  position: Position;
  name?: string;
  desc?: string[];
  time?: Date;
}

export interface StartEnd {
  start: Position;
  end: Position;
}

export function processGeoJSON(
  geojson: FeatureCollection<Geometry | null, GeoJsonProperties>,
): Track {
  let tracks: DataArray[] = [];
  const waypoints: Waypoint[] = [];
  let trackInfo = {};
  let start = undefined;
  let end = undefined;

  geojson.features.forEach((f: Feature<Geometry | null, GeoJsonProperties>) => {
    if (!f.geometry) return;

    if (f.geometry.type === "LineString") {
      // console.log("feat LineString", f);
      trackInfo = makeTrackInfo(f);
      tracks.push({
        path: f.geometry.coordinates,
        timestamps: f.properties!.coordinateProperties.times,
      });
    }

    if (f.geometry.type === "MultiLineString") {
      // console.log("feat MultiLineString", f);
      trackInfo = makeTrackInfo(f);
      tracks.push({ path: [], timestamps: [] });
      f.geometry.coordinates.forEach((line: Position[], idx: number) => {
        tracks[0].path = tracks[0].path.concat(line);
        tracks[0].timestamps = tracks[0].timestamps.concat(
          f.properties?.coordinateProperties.times[idx],
        );
      });
    }

    if (f.geometry.type === "Point") {
      // console.log("feat Point", f);
      let desc = [""];
      if (f.properties?.hasOwnProperty("desc")) {
        desc = f.properties.desc.split("\n");
      } else if (f.properties?.hasOwnProperty("description")) {
        desc = f.properties?.description.split("\n");
      }
      waypoints.push({
        position: f.geometry.coordinates,
        name: f.properties?.name,
        desc,
        time: parseDate(f.properties?.time),
      });
    }
  });

  if (tracks.length) {
    start = tracks[0].path[0];
    end = tracks[0].path[tracks[0].path.length - 1];
  }

  // remove null geometries before bbox
  const bounds = bbox(geojson as AllGeoJSON);
  const [minX, minY, maxX, maxY] = bounds;

  let startView = {
    longitude: (minX + maxX) / 2,
    latitude: (minY + maxY) / 2,
    zoom: 5,
  };

  const profile: PDP[] = [];
  let cumDist = 0;
  tracks.forEach((t) => {
    // Sample data for performance (every 10th point)
    t.path.forEach((p, j) => {
      profile.push({
        distance: cumDist,
        elevation: p[2],
        timestamp: parseDate(t.timestamps[j]),
      });
      // Distance to next point
      if (j < t.path.length - 1) {
        const segDist = distance(point(t.path[j]), point(t.path[j + 1]));
        cumDist += segDist;
      }
    });
  });
  // sample the data for performance
  const sampled = profile.filter((_t, i) => i % 10 === 0);

  return {
    data: tracks,
    waypoints,
    start,
    end,
    startView,
    profileData: sampled,
    ...trackInfo,
  };
}

function makeTrackInfo(
  f: Feature<Geometry | null, GeoJsonProperties>,
): TrackInfo {
  const name = f.properties?.name;
  const desc = f.properties?.desc;
  const length = parseFloat(f.properties?.geotracker_length);
  const duration = parseFloat(f.properties?.geotracker_duration);
  const timestamp = parseDate(f.properties?.time);
  const createTime = parseDate(f.properties?.geotracker_creationtime);
  return {
    name,
    desc,
    length,
    duration,
    timestamp,
    createTime,
  };
}

export function nearestPoint(
  path: number[][],
  coord: number[],
  viewport: Viewport,
): { pos: Position; idx: number } | null {
  const [cx, cy] = viewport.project(coord);

  let minDist = Infinity;
  let nearest = null;

  path.forEach((p, i) => {
    const [px, py] = viewport.project(p);

    const dx = px - cx;
    const dy = py - cy;
    const dist = dx * dx + dy * dy;

    if (dist < minDist) {
      minDist = dist;
      nearest = { pos: p, idx: i };
    }
  });
  return nearest;
}

export function calculateDistance(
  nearest: { pos: Position; idx: number },
  object: any,
  unit: DistanceSpeedUnit,
): number {
  const pathLine = lineString(object.path.slice(0, nearest.idx + 1)); // Segment to nearest
  const distFromStart = length(pathLine, { units: unit });
  return distFromStart;
}

// Instant speed between prev/next points
export function calculateInstantSpeed(
  nearest: { pos: Position; idx: number },
  object: any,
  unit: DistanceSpeedUnit,
): number | null {
  let speed = null;
  if (nearest.idx > 0 && nearest.idx < object.timestamps.length - 1) {
    const prevTime = parseDate(object.timestamps[nearest.idx - 1]);
    const nextTime = parseDate(object.timestamps[nearest.idx]);
    const distSeg = distance(
      point(nearest.pos),
      point(object.path[nearest.idx - 1]),
      { units: unit },
    );
    const timeSegHrs =
      (nextTime.getTime() - prevTime.getTime()) / (1000 * 60 * 60);
    speed = timeSegHrs > 0 ? distSeg / timeSegHrs : 0;
  }
  return speed;
}

export function parseDate(d: string): Date {
  return new Date(Date.parse(d));
}
