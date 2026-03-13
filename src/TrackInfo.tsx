import type { TrackInfo } from "./lib";

export default function WgTrackInfo({ trackInfo }: { trackInfo: TrackInfo }) {
  if (trackInfo.name && trackInfo.length && trackInfo.duration) {
    return (
      <div
        style={{
          position: "absolute",
          top: 100,
          right: 10,
          zIndex: 10,
          background: "white",
          color: "black",
          padding: "15px",
          borderRadius: "4px",
          minWidth: 200,
        }}
      >
        <div>
          {" "}
          <strong> {trackInfo.name} </strong>{" "}
        </div>
        <div> {trackInfo.desc} </div>
        <div>
          {" "}
          Distance: {trackInfo.length &&
            Math.ceil(trackInfo.length! / 1000)}{" "}
          km{" "}
        </div>
        <div>
          {" "}
          Time:{" "}
          {trackInfo.duration &&
            durationMillisecondsToHumanReadable(trackInfo.duration)}{" "}
        </div>
        <div> Start time: {trackInfo.createTime?.toLocaleString()} </div>
      </div>
    );
  } else {
    return null;
  }
}

function durationMillisecondsToHumanReadable(duration: number): string {
  let [hr, min] = durationMillisecondsToHrMin(duration);
  return `${hr} hr ${Math.round(min)} min`;
}

function durationMillisecondsToHrMin(duration: number): [number, number] {
  let x = duration / 1000;
  let y = x / 60.0;
  let hr = Math.trunc(y / 60.0);
  let min = y % 60.0;
  return [hr, min];
}
