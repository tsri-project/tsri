import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { AppLayout } from "~/components/shell/AppLayout";
import { GateProgressBar } from "~/components/dashboard/GateProgressBar";
import { MetricCards } from "~/components/dashboard/MetricCards";
import { ActionMeetingsPanel } from "~/components/dashboard/ActionMeetingsPanel";
import { mockDashboardData } from "~/lib/mock-data";
import { ExecutiveDashboardData, DOCUMENT_STATUS_BADGES } from "~/types";
import { FileText, ArrowRight, ShieldCheck, Download, Plus } from "lucide-react";
import { formatThaiDate, formatFileSize } from "~/lib/utils";

export const loader: LoaderFunction = async () => {
  return json<ExecutiveDashboardData>(mockDashboardData);
};

export default function DashboardRoute() {
  const data = useLoaderData<ExecutiveDashboardData>();

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Welcome & Overview Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/30 via-slate-900/50 to-indigo-900/30 border border-slate-800 p-5 rounded-2xl">
          <div>
            <div className="text-xs font-semibold text-blue-400 font-mono">
              PROJECT DASHBOARD & CONTROL CENTER
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white mt-0.5">
              ศูนย์บัญชาการวิจัยกฎหมายและบริหารโครงการ สกสว.
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
              ระบบติดตามความสอดคล้องตาม TOR, กฎหมาย และกระบวนการตรวจรับองค์ความรู้แบบครบวงจร
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              to="/documents"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              ลงทะเบียนเอกสารใหม่
            </Link>
          </div>
        </div>

        {/* 1. Gate Progress Bar */}
        <GateProgressBar currentGate={data.currentGate} />

        {/* 2. Executive Metric Cards */}
        <MetricCards data={data} />

        {/* 3. Action Items & Meetings Panel */}
        <ActionMeetingsPanel data={data} />

        {/* 4. Recent Documents & Versions Section */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Recent Documents (เอกสารและกฎหมายล่าสุด)
              </h3>
              <p className="text-xs text-slate-400">
                เอกสารที่ผ่านการจัดหมวดหมู่และตรวจสอบตามระเบียบ สกสว.
              </p>
            </div>
            <Link
              to="/documents"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
            >
              ไปที่ Document Center <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">รหัสเอกสาร</th>
                  <th className="py-3 px-4">ชื่อเอกสาร / กฎหมาย</th>
                  <th className="py-3 px-4">หมวดหมู่</th>
                  <th className="py-3 px-4">เวอร์ชัน</th>
                  <th className="py-3 px-4">สถานะ</th>
                  <th className="py-3 px-4">วันที่บันทึก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.recentDocuments.map((doc) => {
                  const statusBadge = DOCUMENT_STATUS_BADGES[doc.status];
                  return (
                    <tr key={doc.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-300">
                        {doc.document_code}
                      </td>
                      <td className="py-3 px-4 font-medium text-white max-w-xs truncate">
                        {doc.title}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{doc.category}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        v{doc.latest_version_number}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded border ${statusBadge.class}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {formatThaiDate(doc.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
