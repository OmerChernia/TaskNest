// app/layout.js

import '../styles/globals.css'; // Adjust the path if needed

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}