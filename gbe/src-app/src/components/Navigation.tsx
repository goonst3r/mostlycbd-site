import { motion } from 'framer-motion';
import { ForkKnife, Users } from '@phosphor-icons/react';
import { cn } from '../lib/utils';

interface NavigationProps {
  activeView: 'feed' | 'rate';
  onViewChange: (view: 'feed' | 'rate') => void;
  onOpenMembers: () => void;
}

export function Navigation({ activeView, onViewChange, onOpenMembers }: NavigationProps) {
  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="pointer-events-auto flex items-center justify-between px-6 py-3 rounded-[2rem] glass-panel max-w-lg w-full"
      >
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onViewChange('feed')}
        >
          <div className="bg-zinc-900 text-white p-2 rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
            <ForkKnife weight="bold" size={16} />
          </div>
          <span className="font-semibold tracking-tight text-zinc-900 text-base">Gang Bang Eats</span>
        </div>

        <div className="flex items-center gap-3 text-sm font-semibold">
          <button
            onClick={onOpenMembers}
            className="text-zinc-400 hover:text-zinc-600 transition-colors p-2 rounded-full hover:bg-zinc-100/50"
            title="Manage Members"
          >
            <Users weight="bold" size={18} />
          </button>
          <button
            onClick={() => onViewChange('feed')}
            className={cn(
              "transition-colors",
              activeView === 'feed' ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            Feed
          </button>
          <button
            onClick={() => onViewChange('rate')}
            className={cn(
              "px-5 py-2 rounded-full transition-all flex relative items-center justify-center overflow-hidden",
              activeView === 'rate'
                ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/20"
                : "bg-zinc-100/50 text-zinc-900 hover:bg-zinc-200"
            )}
          >
            Rate
          </button>
        </div>
      </motion.nav>
    </div>
  );
}
