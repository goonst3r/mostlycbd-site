import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PencilSimple, Check, Plus, Users } from '@phosphor-icons/react';
import { addMember, updateMember, type Member } from '../lib/db';

interface MemberManagerProps {
  members: Member[];
  open: boolean;
  onClose: () => void;
}

export function MemberManager({ members, open, onClose }: MemberManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const startEdit = (member: Member) => {
    setEditingId(member.id);
    setEditName(member.name);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    await updateMember(editingId, editName.trim());
    setEditingId(null);
    setEditName('');
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    await addMember(newName.trim());
    setNewName('');
    setAdding(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-zinc-900 text-white p-2 rounded-full">
                  <Users weight="bold" size={16} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">The Gang</h2>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-600 p-2 rounded-full hover:bg-zinc-100 transition-all"
              >
                <X weight="bold" size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between bg-zinc-50 rounded-2xl p-4 group/member">
                  {editingId === m.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        autoFocus
                        className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                      />
                      <button
                        onClick={saveEdit}
                        className="text-emerald-500 hover:text-emerald-600 p-2 rounded-full hover:bg-emerald-50 transition-all"
                      >
                        <Check weight="bold" size={16} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-zinc-400 hover:text-zinc-600 p-2 rounded-full hover:bg-zinc-100 transition-all"
                      >
                        <X weight="bold" size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-semibold text-zinc-900">{m.name}</span>
                      <button
                        onClick={() => startEdit(m)}
                        className="opacity-0 group-hover/member:opacity-100 text-zinc-400 hover:text-zinc-600 p-2 rounded-full hover:bg-zinc-100 transition-all"
                      >
                        <PencilSimple weight="bold" size={16} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Add member */}
            <div className="flex items-center gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Add a new member..."
                className="flex-1 bg-white border border-zinc-200 rounded-2xl px-4 py-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-400 transition-all"
              />
              <motion.button
                onClick={handleAdd}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!newName.trim() || adding}
                className="bg-zinc-900 text-white p-3 rounded-2xl hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                <Plus weight="bold" size={18} />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
