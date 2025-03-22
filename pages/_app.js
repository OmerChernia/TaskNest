// pages/_app.js

import '../src/app/globals.css';
import { SessionProvider } from 'next-auth/react';
import Footer from '../src/components/Footer';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
      <Footer />
    </SessionProvider>
  );
}

export default MyApp;