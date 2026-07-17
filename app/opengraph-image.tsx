import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "شرکت آرایه — طراحی سایت، سئو و نرم‌افزار";
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
          alignItems: "flex-end",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0A1422 0%, #13243B 100%)",
          padding: "80px 96px",
          fontFamily: "sans-serif",
          direction: "rtl",
        }}
      >
        {/* Brand mark */}
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 96,
            width: 72,
            height: 72,
            borderRadius: 18,
            border: "2px solid rgba(63,160,138,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="38" height="38" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 32 92 L 60 36 L 88 92"
              fill="none"
              stroke="#E8B45A"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Main text */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{ fontSize: 72, fontWeight: 800, color: "#F6F8FA", lineHeight: 1.15 }}>
            شرکت آرایه
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#F6F8FA", marginTop: 16, lineHeight: 1.35 }}>
            طراحی سایت · سئو · نرم‌افزار
          </div>
          <div style={{ fontSize: 26, fontWeight: 500, color: "#9FB2C2", marginTop: 12 }}>
            شرکت هوش آرایه پارس
          </div>
        </div>

        {/* Bottom chip */}
        <div
          style={{
            position: "absolute",
            bottom: 64,
            right: 96,
            background: "rgba(46,125,107,0.18)",
            borderRadius: 28,
            padding: "12px 28px",
            fontSize: 26,
            fontWeight: 600,
            color: "#5FBFA8",
          }}
        >
          آرایه
        </div>
      </div>
    ),
    { ...size }
  );
}
