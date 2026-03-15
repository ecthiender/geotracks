import type { Preferences } from "./preferences";

export default function WgPreferences({
  preferences,
  onChange,
}: {
  preferences: Preferences;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 10,
        minWidth: 200,
        background: "white",
        color: "black",
        padding: "15px",
        borderRadius: "4px",
      }}
    >
      <h3 style={{ textAlign: "left" }}> Preferences </h3>
      <div>
        <div>
          <b> Altitude </b> &nbsp;
          <form style={{ display: "inline" }}>
            <label>
              <input
                type="radio"
                name="altitude"
                value="meters"
                checked={preferences.altitude === "meters"}
                onChange={onChange}
              />
              Meters
            </label>
            &nbsp;
            <label>
              <input
                type="radio"
                name="altitude"
                value="feet"
                checked={preferences.altitude === "feet"}
                onChange={onChange}
              />
              Feet
            </label>
          </form>
        </div>
        <div>
          <b> Distance </b>
          <form style={{ display: "inline" }}>
            <label>
              <input
                type="radio"
                name="distance_speed"
                value="kilometers"
                checked={preferences.distance_speed === "kilometers"}
                onChange={onChange}
              />
              Kilometers
            </label>
            &nbsp;
            <label>
              <input
                type="radio"
                name="distance_speed"
                value="miles"
                checked={preferences.distance_speed === "miles"}
                onChange={onChange}
              />
              Miles
            </label>
          </form>
        </div>
      </div>
    </div>
  );
}
