import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GetAgent — Bitget BuilderHub",
  description: "Bitget BuilderHub AI assistant",
};

// Apply the saved theme before paint to avoid a flash of the wrong theme.
const themeInit = `(function(){try{var t=localStorage.getItem('getagent_theme');if(t==='light')document.documentElement.classList.add('light');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;650;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
