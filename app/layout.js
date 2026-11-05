import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const description = "An interactive walk through Dhyey's story, from a silent introvert kid to AI research. Built for Wispr Flow India.";

export const metadata = {
  title: "Dhyey · Walk Through It",
  description,
  // link previews (WhatsApp, LinkedIn, Slack): the image is app/opengraph-image.png
  openGraph: { title: "Dhyey · Walk Through It", description, type: "website" },
  twitter: { card: "summary_large_image", title: "Dhyey · Walk Through It", description },
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#000000" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        {/* General Sans (Fontshare, free for commercial use) for the entry screen */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600&display=swap" rel="stylesheet" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Caveat:wght@500;700&family=Special+Elite&family=Space+Grotesk:wght@400;500;600&family=Inter+Tight:wght@400;600;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
