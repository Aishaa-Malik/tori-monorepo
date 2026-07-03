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

const itcGaramond = localFont({
  src: "../../fonts/itc-garamond-std-light-narrow.otf",
  variable: "--font-itc-garamond",
  weight: "300",
  style: "normal",
  display: "swap",
});

export const metadata = {
  title: "Turn WhatsApp Chats Into Paid Bookings | Toriate",
  description: "Toriate helps clinics, sports venues and appointment-heavy businesses automate bookings, reminders, payment links and repeat follow-ups inside WhatsApp — without replacing your current software.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${resistSans.variable} ${itcGaramondItalic.variable} ${itcGaramond.variable}`}>
        <ClientLayout>
          <TopBar />
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
