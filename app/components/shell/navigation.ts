import {
  LayoutDashboard,
  FileCheck2,
  ListTodo,
  FolderKanban,
  Scale,
  GitFork,
  Calendar,
  MessagesSquare,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  FileBarChart,
  Users2,
  ListPlus,
  ShieldCheck,
} from 'lucide-react';

// One vocabulary for desktop navigation and the mobile drawer.
export const navigationGroups = [
  {
    title: 'ติดตามโครงการ',
    items: [
      { name: 'ภาพรวมโครงการ', path: '/dashboard', icon: LayoutDashboard },
      { name: 'ขอบเขตและผลส่งมอบ', path: '/tor', icon: FileCheck2 },
      { name: 'งานและความก้าวหน้า', path: '/tasks', icon: ListTodo },
      { name: 'บันทึกงานรายวัน', path: '/daily', icon: ListPlus },
      { name: 'รายงานโครงการ', path: '/reports', icon: FileBarChart },
    ],
  },
  {
    title: 'ข้อมูลและงานวิจัย',
    items: [
      { name: 'ศูนย์เอกสาร', path: '/documents', icon: FolderKanban },
      { name: 'กฎหมายและระเบียบ', path: '/legal-inventory', icon: Scale },
      { name: 'เชื่อมโยงหลักฐาน', path: '/traceability', icon: GitFork },
      { name: 'ตรวจสอบโดยผู้เชี่ยวชาญ', path: '/reviews', icon: CheckCircle2 },
      { name: 'องค์ความรู้และการเรียนรู้', path: '/knowledge', icon: BookOpen },
    ],
  },
  {
    title: 'ประสานงาน & จัดการ',
    items: [
      { name: 'ปฏิทินโครงการ', path: '/calendar', icon: Calendar },
      { name: 'การประชุม', path: '/meetings', icon: MessagesSquare },
      { name: 'ความเสี่ยงและข้อพิจารณา', path: '/raid', icon: AlertTriangle },
      { name: 'ทีมงานและสิทธิ์', path: '/team', icon: Users2 },
      { name: 'จัดการหลังบ้าน', path: '/admin', icon: ShieldCheck },
    ],
  },
];
