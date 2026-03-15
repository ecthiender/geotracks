import type { TrackInfo } from "./lib";
import { FloatingWindow } from "./libui";

const HEADER_NAME = "📊 Track Info";

export default function WgTrackInfo({
  trackInfo,
  trackInfoWindow,
  setTrackInfoWindow,
}: {
  trackInfo: TrackInfo;
  trackInfoWindow: any;
  setTrackInfoWindow: any;
}) {
  if (trackInfo.name) {
    return (
      <FloatingWindow
        floatingWinProps={trackInfoWindow}
        setFloatingWinProps={setTrackInfoWindow}
        headerTitle={HEADER_NAME}
      >
        <div
          style={{
            padding: "0 10px",
            height: "calc(100% - 20px)",
            overflow: "auto",
          }}
        >
          {trackInfo.name && (
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                Name
              </div>
              <div style={{ fontWeight: 600, fontSize: "16px" }}>
                {trackInfo.name}
              </div>
            </div>
          )}

          {trackInfo.desc && (
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                Description
              </div>
              <div style={{ fontSize: "14px", lineHeight: 1.5 }}>
                {trackInfo.desc}
              </div>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              fontSize: "14px",
            }}
          >
            <div>
              <div
                style={{
                  color: "#6b7280",
                  fontSize: "12px",
                  marginBottom: "2px",
                }}
              >
                Distance
              </div>
              <div style={{ fontWeight: 600 }}>
                {Math.ceil(trackInfo.length! / 1000)} km
              </div>
            </div>
            <div>
              <div
                style={{
                  color: "#6b7280",
                  fontSize: "12px",
                  marginBottom: "2px",
                }}
              >
                Duration
              </div>
              <div style={{ fontWeight: 600 }}>
                {trackInfo.duration &&
                  durationMillisecondsToHumanReadable(trackInfo.duration)}
              </div>
            </div>
            {trackInfo.createTime && (
              <div style={{ gridColumn: "1 / -1" }}>
                <div
                  style={{
                    color: "#6b7280",
                    fontSize: "12px",
                    marginBottom: "2px",
                  }}
                >
                  Start Time
                </div>
                <div style={{ fontWeight: 500 }}>
                  {trackInfo.createTime.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </FloatingWindow>
    );
  }
}

function durationMillisecondsToHumanReadable(duration: number): string {
  const [hr, min] = durationMillisecondsToHrMin(duration);
  return `${hr} hr ${Math.round(min)} min`;
}

function durationMillisecondsToHrMin(duration: number): [number, number] {
  const x = duration / 1000;
  const y = x / 60.0;
  const hr = Math.trunc(y / 60.0);
  const min = y % 60.0;
  return [hr, min];
}
