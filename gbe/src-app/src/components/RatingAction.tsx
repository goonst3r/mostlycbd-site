
import { motion } from 'framer-motion';
import { Heart, Fire, Skull } from '@phosphor-icons/react';
import { cn } from '../lib/utils';

export type RatingType = 'marry' | 'fuck' | 'kill' | null;

interface RatingActionProps {
  value: RatingType;
  onChange: (value: RatingType) => void;
}

export function RatingAction({ value, onChange }: RatingActionProps) {
  const options = [
    {
      id: 'marry',
      label: 'Marry',
      icon: Heart,
      description: 'Outstanding. Will return regularly.',
      colorClass: 'text-emerald-500',
      bgClass: 'bg-emerald-500/10',
      activeBgClass: 'bg-emerald-500',
      activeTextClass: 'text-white',
      borderColorClass: 'border-emerald-500/20'
    },
    {
      id: 'fuck',
      label: 'Fuck',
      icon: Fire,
      description: 'Good experience, but wouldn\'t rush back.',
      colorClass: 'text-amber-500',
      bgClass: 'bg-amber-500/10',
      activeBgClass: 'bg-amber-500',
      activeTextClass: 'text-white',
      borderColorClass: 'border-amber-500/20'
    },
    {
      id: 'kill',
      label: 'Kill',
      icon: Skull,
      description: 'Bad experience. Never returning.',
      colorClass: 'text-rose-500',
      bgClass: 'bg-rose-500/10',
      activeBgClass: 'bg-rose-500',
      activeTextClass: 'text-white',
      borderColorClass: 'border-rose-500/20'
    }
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold text-zinc-900 tracking-tight uppercase">Rate this Spot</h3>
        <div className="h-px bg-zinc-200 flex-1"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map((opt) => {
          const isSelected = value === opt.id;
          const Icon = opt.icon;
          
          return (
            <motion.button
              key={opt.id}
              onClick={() => onChange(isSelected ? null : opt.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className={cn(
                "relative flex flex-col items-center justify-center p-6 rounded-[2rem] border transition-colors overflow-hidden group test-button user-select-none",
                isSelected 
                  ? cn(opt.activeBgClass, opt.activeTextClass, "border-transparent shadow-md") 
                  : cn("bg-white border-zinc-200 hover:border-zinc-300", opt.colorClass)
              )}
            >
              {isSelected && (
                <motion.div
                  layoutId="rating-active-bg"
                  className={cn("absolute inset-0 pointer-events-none", opt.activeBgClass)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
              
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className={cn(
                  "p-3 rounded-full transition-colors",
                  isSelected ? "bg-white/20" : opt.bgClass
                )}>
                  <Icon weight={isSelected ? "fill" : "duotone"} size={32} />
                </div>
                <div className="text-center">
                  <span className={cn(
                    "block font-bold text-lg mb-1 tracking-tight",
                    isSelected ? "text-white" : "text-zinc-900"
                  )}>
                    {opt.label}
                  </span>
                  <span className={cn(
                    "block text-xs max-w-[180px] mx-auto leading-relaxed",
                    isSelected ? "text-white/90" : "text-zinc-500 group-hover:text-zinc-600"
                  )}>
                    {opt.description}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
