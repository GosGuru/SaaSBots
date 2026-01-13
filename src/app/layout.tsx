import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "SASbot - Chatbots de WhatsApp Inteligentes",
    template: "%s | SASbot",
  },
  description:
    "Plataforma SaaS para crear y gestionar chatbots de WhatsApp con IA. Automatiza tu negocio con conversaciones inteligentes.",
  keywords: [
    "chatbot",
    "whatsapp",
    "ia",
    "automatización",
    "saas",
    "n8n",
    "business",
  ],
  authors: [{ name: "SASbot" }],
  creator: "SASbot",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "SASbot",
    title: "SASbot - Chatbots de WhatsApp Inteligentes",
    description:
      "Plataforma SaaS para crear y gestionar chatbots de WhatsApp con IA",
  },
  twitter: {
    card: "summary_large_image",
    title: "SASbot - Chatbots de WhatsApp Inteligentes",
    description:
      "Plataforma SaaS para crear y gestionar chatbots de WhatsApp con IA",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
