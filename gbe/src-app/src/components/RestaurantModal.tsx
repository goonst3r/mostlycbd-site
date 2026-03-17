import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Fire, Skull, Globe, PencilSimple, Camera, ChatText } from '@phosphor-icons/react';
import { cn } from '../lib/utils';
import { type RestaurantWithRatings } from '../hooks/useRestaurants';
import { type Rating } from '../lib/db';
import { EditRating } from './EditRating';
const ratingConfig = {
  marry: { icon: Heart, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Marry' },
  fuck: { icon: Fire, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Fuck' },
  kill: { icon: Skull, color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Kill' },
};

interface RestaurantModalProps {
  restaurant: RestaurantWithRatings | null;
  members: { id: string; name: string }[];
  onClose: () => void;
}

export function RestaurantModal({ restaurant, onClose }: RestaurantModalProps) {
  const [editingRating, setEditingRating] = useState<Rating | null>(null);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingRating) setEditingRating(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, editingRating]);

  // Lock body scroll
  useEffect(() => {
    if (restaurant) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [restaurant]);

  if (!restaurant) return null;

  const allPhotos = restaurant.ratings.flatMap((r) => r.photos || []);

  return (
    <AnimatePresence>
      {restaurant && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto hide-scrollbar shadow-2xl"
          >
            {editingRating ? (
              <EditRating
                rating={editingRating}
                restaurant={restaurant}
                onClose={() => setEditingRating(null)}
              />
            ) : (
              <>
                {/* Hero */}
                <div className="relative h-56 sm:h-64 overflow-hidden rounded-t-[2.5rem] sm:rounded-t-[2.5rem]">
                  <img
                    src={restaurant.img}
                    alt={restaurant.spot}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-6 left-8 right-8 z-10">
                    <p className="text-white/60 text-sm font-medium tracking-wide uppercase mb-1">
                      {restaurant.style}
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                      {restaurant.spot}
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                  >
                    <X weight="bold" size={20} />
                  </button>
                  {restaurant.website && (
                    <a
                      href={restaurant.website}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute top-4 left-4 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                    >
                      <Globe weight="bold" size={20} />
                    </a>
                  )}
                </div>

                <div className="p-8 flex flex-col gap-8">
                  {/* Ratings breakdown */}
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 tracking-tight uppercase mb-4">
                      The Votes
                    </h3>
                    {restaurant.ratings.length === 0 ? (
                      <p className="text-zinc-400 text-sm">No votes yet. Be the first to rate this spot!</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {restaurant.ratings.map((r) => {
                          const config = ratingConfig[r.rating];
                          const Icon = config.icon;
                          return (
                            <div
                              key={r.id}
                              className="flex items-center justify-between bg-zinc-50 rounded-2xl p-4 group/rating"
                            >
                              <div className="flex items-center gap-4">
                                <div className={cn('p-2 rounded-full', config.bg)}>
                                  <Icon weight="fill" size={20} className={config.color} />
                                </div>
                                <div>
                                  <span className="font-semibold text-zinc-900">{r.memberName}</span>
                                  <span className={cn('ml-2 text-sm font-medium', config.color)}>
                                    {config.label}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => setEditingRating(r)}
                                className="opacity-0 group-hover/rating:opacity-100 text-zinc-400 hover:text-zinc-600 p-2 rounded-full hover:bg-zinc-100 transition-all"
                                title="Edit rating"
                              >
                                <PencilSimple weight="bold" size={16} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {restaurant.ratings.some((r) => r.notes) && (
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 tracking-tight uppercase mb-4 flex items-center gap-2">
                        <ChatText size={16} />
                        Notes
                      </h3>
                      <div className="flex flex-col gap-3">
                        {restaurant.ratings
                          .filter((r) => r.notes)
                          .map((r) => (
                            <div key={r.id} className="bg-zinc-50 rounded-2xl p-4">
                              <span className="font-semibold text-zinc-900 text-sm">{r.memberName}</span>
                              <p className="text-zinc-600 text-sm mt-1 leading-relaxed">{r.notes}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Photos */}
                  {allPhotos.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 tracking-tight uppercase mb-4 flex items-center gap-2">
                        <Camera size={16} />
                        Photos
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {allPhotos.map((url, i) => (
                          <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-zinc-100">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
