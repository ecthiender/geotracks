/// Import a track file from the user into the app

interface WgImportTrackProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function WgImportTrack({ onUpload }: WgImportTrackProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 10,
        background: "white",
        color: "black",
        padding: "10px",
        borderRadius: "4px",
      }}
    >
      <div style={{ marginBottom: "6px" }}>
        {" "}
        Upload a GPX/KML file to visualize{" "}
      </div>
      <input type="file" accept=".gpx,.kml" onChange={onUpload} />
    </div>
  );
}
