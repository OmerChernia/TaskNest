// pages/_app.js

import '../src/app/globals.css'; // Adjust the path if needed

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;