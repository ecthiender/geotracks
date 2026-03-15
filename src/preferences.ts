export type AltitudeUnit = "feet" | "meters";
export type DistanceSpeedUnit = "kilometers" | "miles";

export interface Preferences {
  altitude: AltitudeUnit;
  distance_speed: DistanceSpeedUnit;
}

export const DEFAULT_PREFERENCES: Preferences = {
  altitude: "meters",
  distance_speed: "kilometers",
};
