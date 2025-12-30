import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "GymHub Local",
  description: "Tu compañero de entrenamiento inteligente",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#ccff00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} font-sans bg-gym-black text-white antialiased pb-28 selection:bg-gym-primary selection:text-black`}>
        <ClientLayout>
          <main className="min-h-screen relative z-10 pt-16">
            {children}
          </main>

          {/* Background Ambient Glow */}
          <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gym-primary/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gym-secondary/5 rounded-full blur-[100px]" />
          </div>
        </ClientLayout>
      </body>
    </html>
  );
}
