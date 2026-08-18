import { type Metadata } from "next";
import { siteConfig } from "@/config/site";
import "@/styles/globals.css";
import Toaster from "@/components/toast";
import QueryProvider from "@/utils/provider";
import { AuthModalProvider } from "@/context/use-auth-modal";
import { ThemeProvider } from "@/context/theme-context";
import dynamic from "next/dynamic";

// Lazy-load the AI Copilot button so it doesn't block initial paint
const AICopilotButton = dynamic(
  () => import("@/components/ai/ai-copilot-button"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.shortName} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: "TasqX Team",
      url: siteConfig.url,
    },
  ],
  creator: "TasqX",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/favicon.svg",
    apple: "/images/tasqx-logo.svg",
  },
  themeColor: "#6366F1",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: `${siteConfig.shortName} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.shortName,
    images: [
      {
        url: siteConfig.ogImage,
        width: 512,
        height: 512,
        alt: `${siteConfig.shortName} Logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.shortName} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@tasqx_app",
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" className="custom-scrollbar">
      <head>
        {/* Google Fonts – Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* Favicons */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/tasqx-logo.svg" />
      </head>
      <body className="overflow-hidden font-sans antialiased">
        <QueryProvider>
          <AuthModalProvider>
            <ThemeProvider>
              <Toaster
                position="bottom-left"
                reverseOrder={false}
                containerStyle={{
                  height: "92vh",
                  marginLeft: "3vw",
                }}
              />
              {children}
              {/* Global AI Copilot floating button */}
              <AICopilotButton />
            </ThemeProvider>
          </AuthModalProvider>
        </QueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
