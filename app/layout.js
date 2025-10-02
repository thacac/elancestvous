export const metadata = {
  title: 'elancestvous.com',
  description: 'www.elancestvous.com website',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
