import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Wedding Vendor Tracker",
  description: "Capture wedding-show vendors, prices, packages and photos on the go.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#e84a87",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto min-h-screen max-w-screen-sm bg-gray-50">
          <main className="px-4 pb-28 pt-4">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
