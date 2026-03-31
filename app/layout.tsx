import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shipwithoat.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Request Vehicle Transport Quote | Organized Auto Transport",
  description:
    "Request a vehicle transport quote from Organized Auto Transport. Enter your route and vehicle details to get pricing and availability.",
  openGraph: {
    title: "Request Vehicle Transport Quote | Organized Auto Transport",
    description:
      "Request a vehicle transport quote from Organized Auto Transport. Enter your route and vehicle details to get pricing and availability.",
    url: `${siteUrl}/request-transport`,
    siteName: "Organized Auto Transport",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Request Vehicle Transport Quote | Organized Auto Transport",
    description:
      "Request a vehicle transport quote from Organized Auto Transport. Enter your route and vehicle details to get pricing and availability.",
  },
  alternates: {
    canonical: "/request-transport",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
