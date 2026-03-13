import type { JSX } from "react";
import type { PDP } from "./lib";
import { FloatingWindow } from "./libui";

const headername = "📈 Elevation Profile";

export default function WgProfileGraph({
  profileData,
  profileWindow,
  setProfileWindow,
}: {
  profileData: PDP[];
  profileWindow: any;
  setProfileWindow: any;
}) {
  if (profileData.length > 0) {
    return (
      <FloatingWindow
        floatingWinProps={profileWindow}
        setFloatingWinProps={setProfileWindow}
        headerTitle={headername}
      >
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            height: 640,
            width: 720,
            border: "1px solid #ddd",
            borderRadius: 12,
            background: "white",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "15px",
              fontSize: "14px",
            }}
          >
            <span style={{ fontWeight: 600, color: "#1f2937" }}>
              📈 Elevation Profile
            </span>
            <span style={{ color: "#6b7280" }}>
              {profileData.length.toLocaleString()} pts •{" "}
              {profileData[profileData.length - 1].distance.toFixed(1)}km
            </span>
          </div>

          <svg
            viewBox="0 0 680 400"
            style={{ width: "100%", height: "640px", display: "block" }}
          >
            {/* Background grid */}
            <defs>
              <pattern
                id="grid"
                x="0"
                y="0"
                width="34"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 34 0 L 0 0 0 20"
                  fill="none"
                  stroke="#f8fafc"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect
              x="45"
              y="20"
              width="720"
              height="640"
              rx="4"
              fill="url(#grid)"
            />

            {/* Chart data */}
            <g transform="translate(45, 185)">
              {(() => {
                // FIXED: Proper bounds calculation
                const maxDist = profileData[profileData.length - 1].distance;
                const elevations = profileData.map((d) => d.elevation);
                const maxElev = Math.max(...elevations);
                const minElev = Math.min(...elevations);
                const elevRange = maxElev - minElev || 100;

                const points: { x: number; y: number }[] = [];

                // Calculate ALL points first
                profileData.forEach((point) => {
                  const x = (point.distance / maxDist) * 290; // 0 to 290px
                  const normalizedElev =
                    (point.elevation - minElev) / elevRange; // 0 to 1
                  const y = -normalizedElev * 160; // Flip Y: 0 (top) to -160 (bottom)
                  points.push({ x, y });
                });

                const elements: JSX.Element[] = [];

                // Draw lines between consecutive points
                for (let i = 1; i < points.length; i++) {
                  elements.push(
                    <line
                      key={`line-${i}`}
                      x1={points[i - 1].x}
                      y1={points[i - 1].y}
                      x2={points[i].x}
                      y2={points[i].y}
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />,
                  );
                }

                // Draw points
                profileData.forEach((point, i) => {
                  const { x, y } = points[i];
                  elements.push(
                    <g key={`point-${i}`}>
                      <circle
                        cx={x}
                        cy={y}
                        r="3.5"
                        fill={
                          i === 0
                            ? "#10b981"
                            : i === profileData.length - 1
                              ? "#ef4444"
                              : "#3b82f6"
                        }
                        stroke="white"
                        strokeWidth="2"
                      />
                      {/* Distance labels every ~10% */}
                      {i === 0 ||
                        i === profileData.length - 1 ||
                        (i > 5 &&
                          point.distance / maxDist >
                            0.1 * Math.floor(point.distance / maxDist) && (
                            <text
                              x={x}
                              y={5}
                              textAnchor="middle"
                              fontSize="10"
                              fill="#6b7280"
                              fontWeight="500"
                            >
                              {point.distance.toFixed(1)}
                            </text>
                          ))}
                    </g>,
                  );
                });

                return elements;
              })()}
            </g>

            {/* Axes */}
            <path
              d="M 45 185 L 45 25 L 335 25"
              stroke="#374151"
              strokeWidth="1.5"
              fill="none"
            />

            {/* Labels */}
            <text
              x="38"
              y="42"
              textAnchor="end"
              fontSize="12"
              fontWeight="600"
              fill="#1f2937"
              transform="rotate(-90 38 42)"
            >
              Elevation (m)
            </text>
            <text
              x="190"
              y="205"
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fill="#1f2937"
            >
              Distance (km)
            </text>

            {/* Corner labels */}
            <text x="52" y="42" fontSize="11" fill="#6b7280">
              Max
            </text>
            <text x="52" y="192" fontSize="11" fill="#6b7280">
              Min
            </text>
          </svg>
        </div>
      </FloatingWindow>
    );
  }
  return null;
}
