import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";

export const socialImageSize = {
  width: 1200,
  height: 630,
};

export function createSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#080b10",
          color: "#f3ead8",
          display: "flex",
          fontFamily: "Georgia, serif",
          height: "100%",
          padding: 58,
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "2px solid #d8c28a",
            display: "flex",
            inset: 30,
            opacity: 0.88,
            position: "absolute",
          }}
        />
        <div
          style={{
            borderLeft: "1px solid rgba(216, 194, 138, 0.36)",
            display: "flex",
            height: "78%",
            left: 165,
            position: "absolute",
            top: 70,
          }}
        />
        <div
          style={{
            alignItems: "flex-start",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
            padding: "28px 36px",
            position: "relative",
            width: "100%",
          }}
        >
          <div
            style={{
              alignItems: "center",
              display: "flex",
              fontFamily: "monospace",
              fontSize: 26,
              gap: 18,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            <span>Portfólio gerenciável</span>
            <span style={{ color: "#d8c28a" }}>VF-026</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 22,
              maxWidth: 880,
            }}
          >
            <div
              style={{
                color: "#d8c28a",
                display: "flex",
                fontFamily: "monospace",
                fontSize: 30,
                letterSpacing: 5,
                textTransform: "uppercase",
              }}
            >
              {siteConfig.role}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 92,
                fontWeight: 700,
                lineHeight: 0.94,
                maxWidth: 880,
              }}
            >
              {siteConfig.name}
            </div>
            <div
              style={{
                color: "#c9d2d2",
                display: "flex",
                fontFamily: "monospace",
                fontSize: 31,
                lineHeight: 1.35,
                maxWidth: 850,
              }}
            >
              Next.js · React · NestJS · Node.js · TypeScript
            </div>
          </div>

          <div
            style={{
              alignItems: "center",
              display: "flex",
              fontFamily: "monospace",
              fontSize: 23,
              justifyContent: "space-between",
              letterSpacing: 3,
              textTransform: "uppercase",
              width: "100%",
            }}
          >
            <span>Brasil</span>
            <span style={{ color: "#d8c28a" }}>Noir editorial web</span>
          </div>
        </div>
      </div>
    ),
    socialImageSize,
  );
}

export function createMonogramIcon(size: number) {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#080b10",
          color: "#f3ead8",
          display: "flex",
          fontFamily: "Georgia, serif",
          height: "100%",
          justifyContent: "center",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            border: `${Math.max(4, Math.round(size * 0.025))}px solid #d8c28a`,
            display: "flex",
            inset: Math.round(size * 0.08),
            position: "absolute",
          }}
        />
        <div
          style={{
            color: "#d8c28a",
            display: "flex",
            fontSize: Math.round(size * 0.36),
            fontWeight: 700,
            letterSpacing: Math.round(size * 0.03),
          }}
        >
          VF
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
    },
  );
}
