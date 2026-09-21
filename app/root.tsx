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
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Prompt:wght@400;500;600;700&family=Sarabun:wght@300;400;500;600;700&display=swap",
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
      <body className="h-full min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-white text-center">
      <div className="max-w-md p-8 bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center font-bold text-2xl">
          !
        </div>
        <h1 className="text-2xl font-bold text-red-400 mb-2">เกิดข้อผิดพลาดในการประมวลผล</h1>
        <p className="text-slate-400 text-sm mb-6">
          {error?.message || "ไม่สามารถโหลดข้อมูลระบบได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง"}
        </p>
        <a
          href="/"
          className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition"
        >
          กลับสู่หน้าหลัก
        </a>
      </div>
    </div>
  );
}
