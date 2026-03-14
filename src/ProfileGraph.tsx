import React, { useMemo } from "react";
import CanvasJSReact from "@canvasjs/react-charts";

import type { PDP } from "./lib";
import { FloatingWindow } from "./libui";

export default function WgProfileGraph({
  profileData,
  profileWindow,
  setProfileWindow,
}) {
  return (
    <FloatingWindow
      floatingWinProps={profileWindow}
      setFloatingWinProps={setProfileWindow}
      headerTitle={"📈 Elevation Profile"}
    >
      <MemoProfileGraph
        profileData={useMemo(() => profileData, [profileData.length])}
      />
    </FloatingWindow>
  );
}

interface ProfileGraphProps {
  profileData: PDP[];
  windowHeight?: number;
}

const CanvasJSChart = CanvasJSReact.CanvasJSChart;
const MemoProfileGraph = React.memo(ProfileGraph);

export function ProfileGraph({
  profileData,
  windowHeight = 400,
}: ProfileGraphProps) {
  if (!profileData.length) return null;

  const chartData = profileData.map((point) => ({
    x: point.distance,
    y: point.elevation,
    labelDist: `${point.distance.toFixed(1)}km`,
    labelElev: `${point.elevation.toFixed(1)}m`,
  }));

  const options = {
    animationEnabled: true,
    zoomEnabled: true,
    theme: "light2",
    title: {
      text: null, // Handled by parent
    },
    axisX: {
      title: "Distance (km)",
      titleFontSize: 14,
      labelFontSize: 12,
      gridThickness: 0.5,
      gridColor: "#f1f5f9",
      tickColor: "#e2e8f0",
    },
    axisY: {
      title: "Elevation (m)",
      titleFontSize: 14,
      labelFontSize: 12,
      suffix: "m",
      gridThickness: 0.5,
      gridColor: "#f1f5f9",
      tickColor: "#e2e8f0",
    },
    data: [
      {
        type: "splineArea",
        color: "rgba(59, 130, 246, 0.3)",
        lineColor: "#3b82f6",
        lineThickness: 3,
        markerType: "circle",
        markerSize: 4,
        dataPoints: chartData,
        toolTipContent: "{labelDist}<br/>📈 {labelElev}",
      },
    ],
  };

  return (
    <div
      style={{
        height: windowHeight,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h4 style={{ margin: 0, fontWeight: 600 }}>
          Elevation/Distance Profile
        </h4>
        <div style={{ fontSize: "14px", color: "#6b7280" }}>
          {profileData.length.toLocaleString()} pts •{" "}
          {profileData[profileData.length - 1].distance.toFixed(1)}km
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <CanvasJSChart options={options} />
      </div>
    </div>
  );
}
