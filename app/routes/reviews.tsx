import { useEffect } from 'react';
import { useNavigate, Link } from '@remix-run/react';
import { AppLayout } from '~/components/shell/AppLayout';
import { ArrowRight, LayoutDashboard, ListTodo, FolderKanban } from 'lucide-react';

export default function ReviewsRedirectRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect to /dashboard
    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 1500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AppLayout>
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-lg space-y-4">
          <div className="w-14 h-14 bg-blue-50 text-[#062B63] rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
            <LayoutDashboard className="w-7 h-7 text-[#F36C21]" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              ปรับปรุงพื้นที่ระบบโครงการ
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              ระบบได้ปรับเปลี่ยนเป็นพื้นที่อัพเดทสถานะการทำงาน ความคืบหน้า และศูนย์เอกสารการดำเนินงานโครงการ กำลังนำท่านไปยังแดชบอร์ดภาพรวม...
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              to="/dashboard"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#062B63] hover:bg-[#1356A3] text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>ไปยังภาพรวม & ความคืบหน้า</span>
            </Link>
            <Link
              to="/tasks"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              <ListTodo className="w-4 h-4" />
              <span>ดูสถานะการทำงาน (Tasks)</span>
            </Link>
            <Link
              to="/documents"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              <FolderKanban className="w-4 h-4" />
              <span>ศูนย์เอกสารโครงการ (Documents)</span>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
