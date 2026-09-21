import { AppLayout } from '~/components/shell/AppLayout';
import { ListTodo, Plus, CheckCircle2, Clock } from 'lucide-react';

export default function TasksRoute() {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-blue-400 font-mono">
              MODULE 3: PROJECT TASKS
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white mt-0.5">
              แผนงานและกิจกรรมโครงการ (Task Management)
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              ติดตามกิจกรรมย่อย การมอบหมายงาน และกำหนดส่งตาม WBS
            </p>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-center py-16">
          <ListTodo className="w-12 h-12 text-blue-400 mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-bold text-white mb-1">โมดูล Project Tasks</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            ระบบ Task Board & Kanban สำหรับการติดตามงานวิจัยและการประสานงานภายใน สกสว.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
