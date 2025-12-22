import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "GymHub Local",
  description: "Tu compañero de entrenamiento inteligente",
  manifest: "/manifest.json",
  themeColor: "#ccff00",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} font-sans bg-gym-black text-white antialiased pb-28 selection:bg-gym-primary selection:text-black`}>
        <main className="min-h-screen relative z-10">
          {children}
        </main>

        {/* Background Ambient Glow */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gym-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gym-secondary/5 rounded-full blur-[100px]" />
        </div>
      </body>
    </html>
  );
}
