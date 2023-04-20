import "../styles/global.scss";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import { Analytics } from "@vercel/analytics/react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Analytics />
      <I18nextProvider i18n={i18n}>
        <Component {...pageProps} />
      </I18nextProvider>
    </>
  );
}

export default appWithTranslation(App);
