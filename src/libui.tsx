import { Rnd } from "react-rnd";
import type { RndDragCallback, RndResizeCallback } from "react-rnd";

interface FloatingWindowProps {
  floatingWinProps: {
    x: number;
    y: number;
    width: number;
    height: number;
    isVisible: boolean;
  };
  setFloatingWinProps: React.Dispatch<
    React.SetStateAction<FloatingWindowProps["floatingWinProps"]>
  >;
  headerTitle: React.ReactNode;
  children: React.ReactNode;
}

export function FloatingWindow({
  floatingWinProps,
  setFloatingWinProps,
  headerTitle,
  children,
}: FloatingWindowProps) {
  if (!floatingWinProps.isVisible) return null;

  // FIXED: Proper react-rnd callback types + unused param prefix
  const handleDragStop: RndDragCallback = (_e, d) => {
    setFloatingWinProps((prev) => ({ ...prev, x: d.x, y: d.y }));
  };

  const handleResizeStop: RndResizeCallback = (_e, _dir, ref, _delta, pos) => {
    setFloatingWinProps((prev) => ({
      ...prev,
      width: parseFloat(ref.style.width || "0"),
      height: parseFloat(ref.style.height || "0"),
      x: pos.x,
      y: pos.y,
    }));
  };

  const handleClose = () => {
    setFloatingWinProps((prev) => ({ ...prev, isVisible: false }));
  };

  return (
    <Rnd
      default={{
        x: floatingWinProps.x,
        y: floatingWinProps.y,
        width: floatingWinProps.width,
        height: floatingWinProps.height,
      }}
      minWidth={250}
      minHeight={180}
      maxWidth={500}
      maxHeight={400}
      dragHandleClassName="trackinfo-drag-handle"
      style={{
        position: "absolute" as const,
        zIndex: 1000,
        borderRadius: "12px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        color: "#1e293b",
      }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
    >
      <div
        className="trackinfo-window"
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        {/* Header - draggable */}
        <div className="trackinfo-drag-handle" style={{ flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              borderBottom: "1px solid #e2e8f0",
              cursor: "move",
              userSelect: "none",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 600,
                color: "#1e293b",
              }}
            >
              {headerTitle}
            </h3>
            <button
              onClick={handleClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
                color: "#6b7280",
                padding: "6px",
                borderRadius: "6px",
                lineHeight: 1,
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = "#f3f4f6";
                (e.target as HTMLButtonElement).style.color = "#374151";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background =
                  "transparent";
                (e.target as HTMLButtonElement).style.color = "#6b7280";
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content - scrollable */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            overflow: "auto",
            background: "#ffffff",
          }}
        >
          {children}
        </div>
      </div>
    </Rnd>
  );
}
