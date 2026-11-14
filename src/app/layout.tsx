import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/grandstander";
import "./globals.css";
import { PocketProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Pocket Rocket",
  description: "Jobs, pocket money and savings goals for the whole family. Pretend money only.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#b8f2d0",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PocketProvider>{children}</PocketProvider>
      </body>
    </html>
  );
}
