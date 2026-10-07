import type { Metadata } from "next";
import { AppProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToastContainer from "@/components/ToastContainer";
import MobileBottomNav from "@/components/MobileBottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Airbnb | Vacation Homes & Condo Rentals - Clone",
  description:
    "Find vacation rentals, cabins, beach houses, unique homes, and experiences around the world on this fullstack Airbnb clone.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function removeNextDevTools() {
                  const portal = document.querySelector('nextjs-portal');
                  if (portal) {
                    try { portal.remove(); } catch(e) { portal.style.display = 'none'; }
                  }
                  const elms = document.querySelectorAll('[data-nextjs-dev-tools-button], [data-nextjs-toast], #next-logo');
                  elms.forEach(el => {
                    try { el.remove(); } catch(e) { el.style.display = 'none'; }
                  });
                }
                if (typeof window !== 'undefined') {
                  window.addEventListener('DOMContentLoaded', removeNextDevTools);
                  const obs = new MutationObserver(removeNextDevTools);
                  obs.observe(document.documentElement, { childList: true, subtree: true });
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-[#222222]">
        <AppProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
          <ToastContainer />
          <MobileBottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
