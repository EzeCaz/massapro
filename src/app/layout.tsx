import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MassaPro — AI Agentic Receptionist & Secretary Services",
  description:
    "Intelligent, voice + text Agentic AI receptionists and secretaries tailored for businesses like hair salons, nail studios, beauty shops, veterinary clinics, and more.",
  keywords: [
    "MassaPro",
    "AI Receptionist",
    "AI Secretary",
    "Virtual Assistant",
    "Agentic AI",
    "Business Automation",
  ],
  authors: [{ name: "MassaPro" }],
  icons: {
    icon: "/massapro-logo.png",
  },
  openGraph: {
    title: "MassaPro — AI Agentic Receptionist & Secretary Services",
    description:
      "Intelligent AI receptionists and secretaries for your business",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Z2TP8Y923Q"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Z2TP8Y923Q');
          `}
        </Script>
        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '25763011723375825');
            fbq('track', 'PageView');
            fbq('init', '4314002965514089');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=25763011723375825&ev=PageView&noscript=1"
            alt=""
          />
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=4314002965514089&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Z2TP8Y923Q"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Z2TP8Y923Q');
          `}
        </Script>

        {/* MassaPro Affiliate Tracker - Step 1: Tracker Script */}
        <Script
          id="massapro-affiliate-tracker"
          src="https://aff.massapro.com/massapro-affiliate-tracker.js"
          strategy="afterInteractive"
        />
        <Script id="massapro-affiliate-config" strategy="afterInteractive">
          {`
            (function initAffiliate() {
              if (typeof MassaProAffiliate !== 'undefined') {
                MassaProAffiliate.config({ dashboardUrl: 'https://aff.massapro.com' });
              } else {
                setTimeout(initAffiliate, 100);
              }
            })();
          `}
        </Script>

        {/* MassaPro Affiliate Tracker - Step 2: Google Calendar Booking Tracking */}
        <Script id="massapro-affiliate-booking" strategy="afterInteractive">
          {`
            (function() {
              var formSubmitted = false;

              // Method 1: Watch for Google Calendar iframe postMessage events
              window.addEventListener('message', function(e) {
                if (e.data && e.data.type === 'calendar-event-booked') {
                  if (formSubmitted) return;
                  formSubmitted = true;
                  if (typeof MassaProAffiliate === 'undefined') return;
                  // Always fire — tracker v4.0 attributes no_affiliate traffic automatically
                  MassaProAffiliate.trackLead({
                    lead_name: e.data.name || 'Google Calendar Booking',
                    lead_email: e.data.email || '',
                    lead_phone: e.data.phone || '',
                    lead_company: '',
                    plan_type: 'Basic',
                    initial_status: 'Booked Call'
                  });
                }
              });

              // Method 2: Watch for any form submission on the page (fallback)
              document.addEventListener('submit', function(e) {
                if (formSubmitted) return;
                var form = e.target;
                var emailField = form.querySelector('input[type="email"], input[name*="email"], input[placeholder*="email" i]');
                var nameField = form.querySelector('input[name*="name"], input[placeholder*="name" i]');
                var phoneField = form.querySelector('input[type="tel"], input[name*="phone"], input[placeholder*="phone" i]');
                var companyField = form.querySelector('input[name*="company"], input[placeholder*="company" i]');

                if (emailField || nameField) {
                  formSubmitted = true;
                  if (typeof MassaProAffiliate === 'undefined') return;
                  // Always fire — tracker v4.0 attributes no_affiliate traffic automatically
                  MassaProAffiliate.trackLead({
                    lead_name: nameField ? nameField.value : 'Website Lead',
                    lead_email: emailField ? emailField.value : '',
                    lead_phone: phoneField ? phoneField.value : '',
                    lead_company: companyField ? companyField.value : '',
                    plan_type: 'Basic',
                    initial_status: 'Lead'
                  });
                }
              }, true);

              // Method 3: Watch for Google Calendar button/link clicks
              document.addEventListener('click', function(e) {
                var target = e.target.closest('a[href*="calendar.google"], a[href*="calendly"], button[data-calendar], [data-book]');
                if (target && !formSubmitted) {
                  if (typeof MassaProAffiliate !== 'undefined') MassaProAffiliate.trackEvent('btn_book_calendar');
                }
              });
            })();
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
