import type { CSSProperties } from "react";

// OGP 画像の標準サイズ（主要 SNS が推奨する 1.91:1）
export const OPEN_GRAPH_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

// ロゴは外部 URL を参照せず、SVG を base64 化した data URL で埋め込む
// OpenNext などの Workers 環境では自己ドメインへの fetch が失敗するため
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="3" y="3" width="42" height="42" rx="12" fill="#38bdf8"/><path d="M15 31 L24 16 L33 31" stroke="#0f172a" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const LOGO_DATA_URL = `data:image/svg+xml;base64,${Buffer.from(
  LOGO_SVG,
).toString("base64")}`;

type OpenGraphImageProps = {
  title: string;
  description?: string;
};

const pageStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  backgroundColor: "#0f172a",
  padding: "56px 72px",
  justifyContent: "space-between",
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "18px",
};

const headerLogoStyle: CSSProperties = {
  display: "flex",
  width: 56,
  height: 56,
};

const headerBrandStyle: CSSProperties = {
  display: "flex",
  fontSize: 30,
  fontWeight: 600,
  color: "#e2e8f0",
  letterSpacing: "0.02em",
};

const contentStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "24px",
};

const titleStyle: CSSProperties = {
  display: "flex",
  fontSize: 68,
  fontWeight: 700,
  color: "#f8fafc",
  lineHeight: 1.25,
  letterSpacing: "-0.02em",
  maxHeight: 340,
  overflow: "hidden",
};

const descriptionStyle: CSSProperties = {
  display: "flex",
  fontSize: 30,
  color: "#94a3b8",
  lineHeight: 1.5,
  maxHeight: 90,
  overflow: "hidden",
};

// satori 用の OGP 画像プレビュー本体
// satori は CSS のサブセットしか解釈しないため、レイアウトは inline style の flex で組む
export function OpenGraphImage({ title, description }: OpenGraphImageProps) {
  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        {/* satori は <img> で SVG を描画するため ESLint の警告を無効化する */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_DATA_URL} style={headerLogoStyle} alt="" />
        <span style={headerBrandStyle}>Next.js Template</span>
      </div>
      <div style={contentStyle}>
        <div style={titleStyle}>{title}</div>
        {description ? <div style={descriptionStyle}>{description}</div> : null}
      </div>
    </div>
  );
}
