"use client";

import "../lib/styles/animations.scss";
import "../lib/styles/login.scss";
import "../lib/styles/chat-styles.scss";
import "../lib/styles/analysis.scss";
import "../lib/styles/whitecloak.scss";
import "../lib/styles/globals.scss";
import "../lib/styles/compose-email.scss";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { AppContextProvider } from "../lib/context/AppContext";
import { Suspense, useEffect } from "react";
import FullPageLoader from "@/lib/components/Loaders/FullPageLoader";
import ErrorBoundary from "@/lib/components/ErrorBoundary";
import { ParallaxProvider } from "react-scroll-parallax";
import { assetConstants } from "@/lib/utils/constantsV2";

export default function ({ children }) {
  useEffect(() => {
    window.onfocus = () => {
      let delta = document.querySelectorAll(".datafetch-btn");
      delta.forEach((x: any) => {
        x.click();
      });
    };
  }, []);

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="preload"
          as="style"
        />
        <link
          href="https://fonts.cdnfonts.com/css/satoshi"
          rel="preload"
          as="style"
        />
        <link href="https://fonts.cdnfonts.com/css/satoshi" rel="stylesheet" />
        {/* Fonts */}

        {/* Argon */}
        <link rel="preload" as="style" href="/css/argon.min.css" />
        <link id="argon-css" rel="stylesheet" href="/css/argon.min.css" />
        {/* Argon */}

        {/* Line Awesome */}
        <link
          rel="preload"
          as="style"
          href="https://maxst.icons8.com/vue-static/landings/line-awesome/line-awesome/1.3.0/css/line-awesome.min.css"
        />
        <link
          id="line-awesome"
          rel="stylesheet"
          href="https://maxst.icons8.com/vue-static/landings/line-awesome/line-awesome/1.3.0/css/line-awesome.min.css"
        />
        {/* Line Awesome */}

        {/* Metadata */}
        <link rel="icon" href="/jia-logo-white-bg.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Jia | WhiteCloak Technologies</title>
        {/* Metadata */}

        {/* Preload Images */}
        {Object.values(assetConstants).map((url, index) => (
          <link key={index} as="image" href={url} rel="preload" />
        ))}
        {/* Preload Images */}
      </head>

      <body>
        <ErrorBoundary>
          <Suspense fallback={<FullPageLoader />}>
            <ParallaxProvider>
              <AppContextProvider>{children}</AppContextProvider>
            </ParallaxProvider>
          </Suspense>
        </ErrorBoundary>
        <ToastContainer />
      </body>
    </html>
  );
}
