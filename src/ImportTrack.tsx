/// Import a track file from the user into the app

export default function WgImportTrack({ onUpload }: { onUpload: any }) {
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
