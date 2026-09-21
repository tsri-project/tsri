import { useState, useEffect } from 'react';
import { Search, FileText, CheckSquare, Calendar, Shield, X, ArrowRight } from 'lucide-react';
import { mockDocuments, mockDeliverables, mockMeetings } from '~/lib/mock-data';
import { Link } from '@remix-run/react';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : {};
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredDocs = query
    ? mockDocuments.filter(
        (d) =>
          d.title.toLowerCase().includes(query.toLowerCase()) ||
          d.document_code.toLowerCase().includes(query.toLowerCase()) ||
          d.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : mockDocuments.slice(0, 3);

  const filteredDeliverables = query
    ? mockDeliverables.filter(
        (del) =>
          del.title.toLowerCase().includes(query.toLowerCase()) ||
          del.code.toLowerCase().includes(query.toLowerCase())
      )
    : mockDeliverables.slice(0, 2);

  const filteredMeetings = query
    ? mockMeetings.filter(
        (m) =>
          m.title.toLowerCase().includes(query.toLowerCase()) ||
          m.meeting_number.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="ค้นหาเอกสารกฎหมาย, TOR Deliverable, การประชุม หรือ Gate..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-none text-white text-base placeholder-slate-500 focus:outline-none focus:ring-0"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-slate-800 rounded-md text-slate-400 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-xs text-slate-400 bg-slate-800 border border-slate-700 rounded-md font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-4">
          {/* Documents Section */}
          {filteredDocs.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                เอกสารและกฎหมาย ({filteredDocs.length})
              </div>
              <div className="space-y-1">
                {filteredDocs.map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/documents?id=${doc.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 hover:bg-slate-800/80 rounded-xl transition group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
                        {doc.document_code}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-slate-200 group-hover:text-blue-300 transition">
                          {doc.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {doc.category} • v{doc.latest_version_number}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Deliverables Section */}
          {filteredDeliverables.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                TOR & Deliverables ({filteredDeliverables.length})
              </div>
              <div className="space-y-1">
                {filteredDeliverables.map((del) => (
                  <Link
                    key={del.id}
                    to={`/tor`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 hover:bg-slate-800/80 rounded-xl transition group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                        {del.code}
                      </span>
                      <div className="text-sm font-medium text-slate-200 group-hover:text-emerald-300 transition line-clamp-1">
                        {del.title}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      น้ำหนัก {del.weight_percentage}%
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Meetings Section */}
          {filteredMeetings.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                การประชุม ({filteredMeetings.length})
              </div>
              <div className="space-y-1">
                {filteredMeetings.map((mtg) => (
                  <Link
                    key={mtg.id}
                    to={`/calendar`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 hover:bg-slate-800/80 rounded-xl transition group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded">
                        {mtg.meeting_number}
                      </span>
                      <div className="text-sm font-medium text-slate-200 group-hover:text-purple-300 transition line-clamp-1">
                        {mtg.title}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {filteredDocs.length === 0 &&
            filteredDeliverables.length === 0 &&
            filteredMeetings.length === 0 && (
              <div className="py-12 text-center text-slate-500">
                <p>ไม่พบผลการค้นหาสำหรับ "{query}"</p>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-500 flex justify-between items-center px-4">
          <span>กดลูกศร หรือคลิกเพื่อเปิดรายการ</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">Ctrl</kbd>+
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">K</kbd> เพื่อค้นหาด่วน
          </span>
        </div>
      </div>
    </div>
  );
}
