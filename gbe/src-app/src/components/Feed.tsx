import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Fire, Skull, Storefront, Globe, SpinnerGap, Shuffle, MapPin, ArrowRight } from '@phosphor-icons/react';
import { cn } from '../lib/utils';
import { type RestaurantWithRatings } from '../hooks/useRestaurants';

const TypeIcon = {
  marry: { icon: Heart, color: "text-emerald-500", bg: "bg-emerald-500/10", border: 'border-emerald-500/30' },
  fuck: { icon: Fire, color: "text-amber-500", bg: "bg-amber-500/10", border: 'border-amber-500/30' },
  kill: { icon: Skull, color: "text-rose-500", bg: "bg-rose-500/10", border: 'border-rose-500/30' },
  unrated: { icon: Storefront, color: "text-zinc-400", bg: "bg-zinc-400/20", border: 'border-zinc-500/30' }
};

interface FeedProps {
  restaurants: RestaurantWithRatings[];
  loading: boolean;
  onSelectRestaurant: (restaurant: RestaurantWithRatings) => void;
}

export function Feed({ restaurants, loading, onSelectRestaurant }: FeedProps) {
  const [pickedSpot, setPickedSpot] = useState<RestaurantWithRatings | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinDisplay, setSpinDisplay] = useState<string | null>(null);
  const spinRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const unvisited = restaurants.filter(r => r.primaryType === 'unrated');

  const handleRandomPick = useCallback(() => {
    if (unvisited.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setPickedSpot(null);

    // Slot-machine effect: cycle through names rapidly then slow down
    let tick = 0;
    const totalTicks = 20;
    spinRef.current = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * unvisited.length);
      setSpinDisplay(unvisited[randomIdx].spot);
      tick++;

      if (tick >= totalTicks) {
        if (spinRef.current) clearInterval(spinRef.current);
        // Final pick
        const winner = unvisited[Math.floor(Math.random() * unvisited.length)];
        setSpinDisplay(null);
        setPickedSpot(winner);
        setIsSpinning(false);
      }
    }, 60 + tick * 8); // speeds up slightly

    return () => {
      if (spinRef.current) clearInterval(spinRef.current);
    };
  }, [unvisited, isSpinning]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <SpinnerGap size={40} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-900 leading-none mb-4">
            The List
          </h1>
          <p className="text-zinc-500 text-lg leading-relaxed">
            Every spot strictly logged with Marry, Fuck, or Kill votes from the gang.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm font-mono text-zinc-400 pb-2 uppercase">
          <span>{restaurants.length} Locations</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Random Picker */}
      {unvisited.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[2rem] overflow-hidden border border-dashed border-zinc-300 bg-gradient-to-br from-zinc-50 to-zinc-100"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-6 sm:p-8">
            <button
              id="random-picker"
              onClick={handleRandomPick}
              disabled={isSpinning}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all shadow-md",
                isSpinning
                  ? "bg-zinc-300 text-zinc-500 cursor-wait"
                  : "bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              <Shuffle size={20} weight="bold" className={isSpinning ? "animate-spin" : ""} />
              {isSpinning ? "Picking..." : "Where Next?"}
            </button>

            <AnimatePresence mode="wait">
              {isSpinning && spinDisplay && (
                <motion.div
                  key="spinning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xl sm:text-2xl font-bold text-zinc-400 font-mono tracking-tight"
                >
                  {spinDisplay}
                </motion.div>
              )}

              {pickedSpot && !isSpinning && (
                <motion.div
                  key="picked"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="flex items-center gap-4 cursor-pointer group"
                  onClick={() => onSelectRestaurant(pickedSpot)}
                >
                  <div className="flex items-center gap-3">
                    <MapPin size={20} weight="fill" className="text-amber-500" />
                    <span className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight group-hover:text-amber-600 transition-colors">
                      {pickedSpot.spot}
                    </span>
                    <span className="text-zinc-400 text-sm uppercase tracking-wide">{pickedSpot.style}</span>
                  </div>
                  <ArrowRight size={18} className="text-zinc-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                </motion.div>
              )}

              {!pickedSpot && !isSpinning && (
                <motion.p
                  key="prompt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-zinc-400 text-sm"
                >
                  {unvisited.length} unrated spot{unvisited.length !== 1 ? 's' : ''} left to try
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:auto-rows-[360px] gap-6">
        {restaurants.map((item, i) => {
          const type = item.primaryType;
          const { icon: Icon, color, bg, border } = TypeIcon[type];
          const isLarge = type !== 'unrated' && (i === 0 || i === 3);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 1), type: "spring", stiffness: 100 }}
              onClick={() => onSelectRestaurant(item)}
              className={cn(
                "group relative rounded-[2.5rem] overflow-hidden bg-zinc-900 flex flex-col justify-end p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border-[0.5px] cursor-pointer",
                isLarge ? "md:col-span-2 p-10" : "aspect-square md:aspect-auto",
                border
              )}
            >
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 z-10" />
                <img
                  src={item.img}
                  alt={item.spot}
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105",
                    type === 'unrated' ? "opacity-40 grayscale" : "opacity-80"
                  )}
                />
              </div>

              <div className="relative z-20 flex flex-col gap-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn("px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5 shadow-sm", bg, color)}>
                      <Icon weight="fill" size={14} />
                      <span className="text-xs font-bold uppercase tracking-widest text-white/90">
                        {type}
                      </span>
                    </div>
                    {item.rankingString !== '----' && (
                      <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-xs font-mono font-bold tracking-[0.2em] flex items-center shadow-sm uppercase">
                        {item.rankingString}
                      </div>
                    )}
                  </div>

                  {item.website && (
                    <a
                      href={item.website}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white/10 hover:bg-white/20 transition-colors p-2 rounded-full text-white/80"
                      title="Visit Website"
                    >
                      <Globe weight="bold" size={16} />
                    </a>
                  )}
                </div>

                <h2 className={cn(
                  "font-bold text-white tracking-tight leading-none text-balance",
                  isLarge ? "text-4xl" : "text-3xl"
                )}>
                  {item.spot}
                </h2>

                <p className="text-white/60 text-sm font-medium tracking-wide uppercase mt-1">
                  {item.style}
                </p>

                {item.ratings.length > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/40 text-xs">{item.ratings.length} vote{item.ratings.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
