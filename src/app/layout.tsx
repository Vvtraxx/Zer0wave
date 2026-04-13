import Navbar from "@/components/navbar";
import "./globals.css";



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}

<div className="bg-red-500 text-white p-10">
  TESTE
</div>