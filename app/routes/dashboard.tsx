import { useState } from 'react';
import { json, type LoaderFunction } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { AppLayout } from '~/components/shell/AppLayout';
import { RoleWorkspaceView, WorkspaceType } from '~/components/dashboard/RoleWorkspaceView';
import { mockDashboardData } from '~/lib/mock-data';
import { ExecutiveDashboardData, DOCUMENT_STATUS_BADGES } from '~/types';
import { FileText, ArrowRight, Plus } from 'lucide-react';
import { formatThaiDate } from '~/lib/utils';

export const loader: LoaderFunction = async () => {
  return json<ExecutiveDashboardData>(mockDashboardData);
};

export default function DashboardRoute() {
  const data = useLoaderData<ExecutiveDashboardData>();
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceType>('PM_CONTROL_TOWER');

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
        {/* Dynamic Role Workspace Header & Content */}
        <RoleWorkspaceView
          data={data}
          activeWorkspace={currentWorkspace}
          onChangeWorkspace={setCurrentWorkspace}
        />

        {/* Recent Documents Table */}
        <div className="bg-gradient-to-b from-[#062b63]/80 to-slate-950 border border-[#1356a3]/40 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1356a3]/30">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#f36c21]" />
                ศูนย์เอกสารและกฎหมายล่าสุด (Recent Documents)
              </h3>
              <p className="text-xs text-blue-200">
                เอกสารที่ผ่านการจัดหมวดหมู่และตรวจสอบตามระเบียบ สกสว.
              </p>
            </div>
            <Link
              to="/documents"
              className="text-xs text-[#f36c21] hover:text-white flex items-center gap-1 font-bold transition"
            >
              ไปที่ 04 ศูนย์เอกสาร <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#062b63] text-blue-200 font-semibold border-b border-[#1356a3]/40">
                <tr>
                  <th className="py-3 px-4">รหัสเอกสาร</th>
                  <th className="py-3 px-4">ชื่อเอกสาร / กฎหมาย</th>
                  <th className="py-3 px-4">หมวดหมู่</th>
                  <th className="py-3 px-4">เวอร์ชัน</th>
                  <th className="py-3 px-4">สถานะ</th>
                  <th className="py-3 px-4">วันที่บันทึก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1356a3]/20">
                {data.recentDocuments.map((doc) => {
                  const statusBadge = DOCUMENT_STATUS_BADGES[doc.status];
                  return (
                    <tr key={doc.id} className="hover:bg-[#1356a3]/20 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-300">
                        {doc.document_code}
                      </td>
                      <td className="py-3 px-4 font-medium text-white max-w-xs truncate">
                        {doc.title}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{doc.category}</td>
                      <td className="py-3 px-4 font-mono text-slate-200 font-bold">
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
