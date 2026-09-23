import { useState } from 'react';
import { useLoaderData, Link } from '@remix-run/react';
import { AppLayout } from '~/components/shell/AppLayout';
import { RoleWorkspaceView, WorkspaceType } from '~/components/dashboard/RoleWorkspaceView';
import { mockDashboardData } from '~/lib/mock-data';
import { ExecutiveDashboardData, DOCUMENT_STATUS_BADGES } from '~/types';
import { FileText, ArrowRight, Plus, FolderKanban, ShieldCheck } from 'lucide-react';
import { formatThaiDate } from '~/lib/utils';

export const clientLoader = async () => {
  return mockDashboardData;
};

export default function DashboardRoute() {
  const data = useLoaderData<ExecutiveDashboardData>();
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceType>('PM_CONTROL_TOWER');

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
        {/* Dynamic Role Workspace Header & Content */}
        <RoleWorkspaceView
          data={data}
          activeWorkspace={currentWorkspace}
          onChangeWorkspace={setCurrentWorkspace}
        />

        {/* Recent Documents & Legal Center Table (Light Theme) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-[#1356A3]" />
                ศูนย์เอกสารและกฎหมายล่าสุด (Recent Documents & Regulations)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                เอกสารที่ผ่านการจัดหมวดหมู่ ตรวจสอบลำดับศักดิ์ และตรวจรับรองตามระเบียบ สกสว.
              </p>
            </div>
            <Link
              to="/documents"
              className="text-xs text-[#F36C21] hover:text-[#D95813] flex items-center gap-1 font-bold transition self-start sm:self-auto"
            >
              ไปที่ 04 ศูนย์เอกสาร <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">รหัสเอกสาร</th>
                  <th className="py-3 px-4">ชื่อเอกสาร / กฎหมาย</th>
                  <th className="py-3 px-4">หมวดหมู่</th>
                  <th className="py-3 px-4">เวอร์ชัน</th>
                  <th className="py-3 px-4">สถานะ</th>
                  <th className="py-3 px-4 rounded-r-xl">วันที่บันทึก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentDocuments.map((doc) => {
                  const statusBadge = DOCUMENT_STATUS_BADGES[doc.status];
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1356A3]">
                        {doc.document_code}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs truncate">
                        <Link to={`/documents?id=${doc.id}`} className="hover:underline hover:text-[#1356A3]">
                          {doc.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{doc.category}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 font-bold">
                        v{doc.latest_version_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${statusBadge.class}`}
                        >
                          ● {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
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
