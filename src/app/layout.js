import '../styles/globals.css'; // Ensure this path is correct

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}