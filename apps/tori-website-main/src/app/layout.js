import "./globals.css";
import ClientLayout from "@/client-layout";
import TopBar from "@/components/TopBar/TopBar";
import localFont from "next/font/local";

const resistSans = localFont({
  src: "../../fonts/resist-sans-display-regular.ttf",
  variable: "--font-resist-sans",
  weight: "400",
  style: "normal",
  display: "swap",
});

const itcGaramondItalic = localFont({
  src: "../../fonts/itc-garamond-std-light-narrow-italic.otf",
  variable: "--font-itc-garamond-italic",
  weight: "300",
  style: "italic",
  display: "swap",
});

export const metadata = {
  title: "Tori Ate | AI WhatsApp Appointment Scheduling Platform",
  description: "AI WhatsApp Appointment Scheduling Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${resistSans.variable} ${itcGaramondItalic.variable}`}>
        <ClientLayout>
          <TopBar />
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
