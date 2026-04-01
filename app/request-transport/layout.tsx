import type { Metadata } from "next";
import { getSiteUrl, QUOTE_OG_IMAGE_PATH } from "@/lib/site";

const title = "Request Vehicle Transport Quote | Organized Auto Transport";
const description =
  "Request a vehicle transport quote from Organized Auto Transport. Enter your route and vehicle details to get pricing and availability.";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
  alternates: {
    canonical: "/request-transport",
  },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/request-transport`,
    siteName: "Organized Auto Transport",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: QUOTE_OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "Organized Auto Transport — Request a vehicle transport quote",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [QUOTE_OG_IMAGE_PATH],
  },
};

export default function RequestTransportLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
