import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import stylesheet from "~/styles/app.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=Noto+Sans+Thai:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap",
  },
];

export const meta: MetaFunction = () => {
  return [
    { title: "TSRI One Link for All — PM & Legal Research Control Center" },
    {
      name: "description",
      content:
        "ระบบบริหารโครงการศึกษา วิเคราะห์ และพัฒนาองค์ความรู้ด้านกฎหมาย ระเบียบ และแนวปฏิบัติ สกสว.",
    },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
      </head>
      <body className="h-full min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-orange-500 selection:text-white">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-tsri-navyDark p-6 text-white text-center font-sans">
      <div className="max-w-md p-8 bg-tsri-navy border border-tsri-orange/40 rounded-2xl shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-4 bg-tsri-orange/20 text-tsri-orange rounded-full flex items-center justify-center font-bold text-2xl">
          !
        </div>
        <h1 className="text-xl font-bold text-white mb-2">เกิดข้อผิดพลาดในการประมวลผล</h1>
        <p className="text-slate-300 text-xs mb-6">
          {error?.message || "ไม่สามารถโหลดข้อมูลระบบได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง"}
        </p>
        <a
          href="/"
          className="inline-block px-5 py-2.5 bg-tsri-blue hover:bg-tsri-blueLight text-white text-xs font-semibold rounded-xl transition shadow-lg"
        >
          กลับสู่หน้าหลัก
        </a>
      </div>
    </div>
  );
}
