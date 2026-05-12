import { Cairo } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata = {
  title: "UserBilling",
  description: "نظام إدارة العملاء والفواتير",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} antialiased`}>
        <div className="bg-aurora" aria-hidden="true" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
