import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Switch",
  description:
    "Switch between Claude, ChatGPT, Gemini, and DeepSeek without losing context. One workspace. Multiple AI brains.",
  keywords: ["AI", "Claude", "ChatGPT", "Gemini", "DeepSeek", "context", "memory"],
  openGraph: {
    title: "Switch",
    description: "Move between AI models without losing your context or memory.",
    type: "website",
  },
  icons: {
    icon: "/switch-icon.png",
    shortcut: "/switch-icon.png",
    apple: "/switch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
