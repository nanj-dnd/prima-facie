import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Prima Facie — At first sight.",
  description:
    "A looks-based dating app for people who are honest about what they want. Apply for ₹9. Get judged. Get matched.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Prima Facie",
    description: "At first sight. We decide if you're attractive enough to be here.",
    type: "website",
    images: [{ url: "/favicon.svg", width: 180, height: 180 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${montserrat.variable} h-full`}
    >
      <body className="min-h-full bg-[#0A0A0A]">
          {children}
          {/* Razorpay checkout script */}
          <script src="https://checkout.razorpay.com/v1/checkout.js" async />
        </body>
    </html>
  );
}
