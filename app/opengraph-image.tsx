import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ApneOrder — QR Menu & UPI Ordering for Indian Restaurants";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 96px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "8px",
            background: "#000000",
          }}
        />

        {/* Brand pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#000",
            color: "#fff",
            borderRadius: "100px",
            padding: "8px 24px",
            fontSize: "18px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            marginBottom: "40px",
          }}
        >
          APNEORDER
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 900,
            color: "#000",
            lineHeight: 1.05,
            marginBottom: "32px",
            maxWidth: "900px",
          }}
        >
          QR Menu + UPI Payment
          <br />
          for Indian Restaurants.
        </div>

        {/* Sub text */}
        <div
          style={{
            fontSize: "28px",
            color: "#555",
            fontWeight: 400,
            marginBottom: "56px",
          }}
        >
          Go live in 10 minutes. No tech knowledge needed.
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: "16px" }}>
          {["QR Code Menu", "Direct UPI Collection", "Live Order Dashboard"].map(
            (f) => (
              <div
                key={f}
                style={{
                  border: "2px solid #000",
                  borderRadius: "100px",
                  padding: "10px 24px",
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#000",
                }}
              >
                {f}
              </div>
            )
          )}
        </div>

        {/* Bottom domain */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "96px",
            fontSize: "20px",
            color: "#999",
            fontWeight: 500,
          }}
        >
          apneorder.com
        </div>
      </div>
    ),
    { ...size }
  );
}
