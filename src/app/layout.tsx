import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Gen Z Gaming Cafe | Book Your Battle Station — Gaming Café in Ramapuram, Chennai",
  description:
    "Premium gaming lounge at Arasamaram Junction, Ramapuram, Chennai. Book PS5, PS4, PC, and Sim Wheel stations online. Walk-in or reserve your slot now!",
  keywords: "gaming cafe, gaming lounge, PS5, PS4, PC gaming, Ramapuram, Chennai, SRM University, booking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${orbitron.variable} font-body antialiased`}>
        {children}
      </body>
    </html>
  );
}
