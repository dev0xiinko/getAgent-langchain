import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GetAgent",
  description: "Bitget BuilderHub agent chat",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
