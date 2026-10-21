import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NyayaConnect | Legal access, made clearer",
  description: "A LegalTech learning platform for India.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

