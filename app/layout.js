import { Saira_Stencil_One, Montserrat, Nunito } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const sairaStencil = Saira_Stencil_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-saira",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata = {
  title: "PulseCart — Smart Shopping, Real-Time AI",
  description:
    "Shop the latest electronics with AI-powered real-time recommendations.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${sairaStencil.variable} ${montserrat.variable} ${nunito.variable}`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
