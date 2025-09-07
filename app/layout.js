import "./globals.css";

export const metadata = {
  title: "Chat AI Twin",
  description: "Вашият персонален AI близнак",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <body>
        <div className="container">
          <nav className="nav">
            <div className="logo">
              <div className="logo-badge">AI</div>
              <div>
                <div style={{fontWeight:800}}>Chat AI Twin</div>
                <div className="logo-text">персонален AI близнак</div>
              </div>
            </div>
            <a href="/pricing" className="small" style={{textDecoration:'none'}}>Планове</a>
          </nav>
          {children}
          <div className="footer">© {new Date().getFullYear()} Chat AI Twin</div>
        </div>
      </body>
    </html>
  );
}
