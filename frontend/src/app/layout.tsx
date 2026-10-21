import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NyayaConnect",
  description: "Legal access, made clearer.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

