import { useState } from "react";

import type { PDP, TrackInfo } from "./lib";
import WgTrackInfo from "./TrackInfo";
import WgProfileGraph from "./ProfileGraph";
import WgImportTrack from "./ImportTrack";

export default function WgTrackInfoManager({
  trackInfo,
  profileData,
  handleFileUpload,
  setHoveredPDP,
}: {
  trackInfo: TrackInfo;
  profileData: PDP[];
  handleFileUpload: any;
  setHoveredPDP: any;
}) {
  const [trackInfoWindow, setTrackInfoWindow] = useState({
    x: 20,
    y: 20,
    width: 300,
    height: 350,
    isVisible: true,
  });

  const [profileWindow, setProfileWindow] = useState({
    x: 20,
    y: 20,
    width: 600,
    height: 400,
    isVisible: false,
  });

  return (
    <>
      <WgImportTrack onUpload={handleFileUpload} />
      <div
        style={{
          position: "absolute",
          top: 100,
          right: 10,
          zIndex: 10,
          background: "white",
          opacity: 0.85,
          color: "black",
          padding: "10px",
          borderRadius: "4px",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <button
          style={{
            width: "30px",
            height: "30px",
            border: "none",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.85)",
            color: "rgba(0, 0, 0, 0.6)",
            fontSize: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              "0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.06)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            backdropFilter: "blur(10px)",
            outline: "none",
            marginRight: 7,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
            e.currentTarget.style.color = "rgba(0, 0, 0, 0.8)";
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = `
              0 4px 16px rgba(0, 0, 0, 0.15),
              0 2px 8px rgba(0, 0, 0, 0.10);`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.85)";
            e.currentTarget.style.color = "rgba(0, 0, 0, 0.6)";
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = `
              0 2px 8px rgba(0, 0, 0, 0.12),
              0 1px 4px rgba(0, 0, 0, 0.06);`;
          }}
          title="Toggle Track Info"
          onClick={() =>
            setTrackInfoWindow({
              ...trackInfoWindow,
              isVisible: !trackInfoWindow.isVisible,
            })
          }
        >
          🛈
        </button>

        <button
          style={{
            width: "30px",
            height: "30px",
            border: "none",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.85)",
            color: "rgba(0, 0, 0, 0.6)",
            fontSize: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `
              0 2px 8px rgba(0, 0, 0, 0.12),
              0 1px 4px rgba(0, 0, 0, 0.06)`,
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            backdropFilter: "blur(10px)",
            outline: "none",
            marginLeft: 8,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
            e.currentTarget.style.color = "rgba(0, 0, 0, 0.8)";
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = `
              0 4px 16px rgba(0, 0, 0, 0.15),
              0 2px 8px rgba(0, 0, 0, 0.10)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.85)";
            e.currentTarget.style.color = "rgba(0, 0, 0, 0.6)";
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = `
              0 2px 8px rgba(0, 0, 0, 0.12),
              0 1px 4px rgba(0, 0, 0, 0.06)`;
          }}
          title="Toggle Profile Graph"
          onClick={() =>
            setProfileWindow({
              ...profileWindow,
              isVisible: !profileWindow.isVisible,
            })
          }
        >
          📈
        </button>
      </div>
      <WgTrackInfo
        trackInfo={trackInfo}
        trackInfoWindow={trackInfoWindow}
        setTrackInfoWindow={setTrackInfoWindow}
      />
      <WgProfileGraph
        profileData={profileData}
        profileWindow={profileWindow}
        setProfileWindow={setProfileWindow}
        setHoveredPDP={setHoveredPDP}
      />
    </>
  );
}
