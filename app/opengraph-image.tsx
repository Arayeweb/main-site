import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "آرایه";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0A1422 0%, #13243B 55%, #0F1C2E 100%)",
          position: "relative",
        }}
      >
        {/* Soft brand glow */}
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 160,
            width: 480,
            height: 480,
            borderRadius: 480,
            background: "rgba(63,160,138,0.18)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: 56,
            border: "5px solid rgba(63,160,138,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(10,20,34,0.65)",
          }}
        >
          <svg width="120" height="120" viewBox="0 0 120 120">
            <path
              d="M 32 92 L 60 36 L 88 92"
              fill="none"
              stroke="#E8B45A"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 42 68 L 78 68"
              fill="none"
              stroke="#E8B45A"
              strokeWidth="14"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div
          style={{
            marginTop: 36,
            fontSize: 42,
            fontWeight: 700,
            color: "#9FB2C2",
            letterSpacing: 4,
          }}
        >
          araaye.com
        </div>
      </div>
    ),
    { ...size }
  );
}
