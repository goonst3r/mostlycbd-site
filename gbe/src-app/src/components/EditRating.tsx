import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, NavigationArrow, Warning } from '@phosphor-icons/react';
import { RatingAction, type RatingType } from './RatingAction';
import { updateRating, type Rating, type RatingValue } from '../lib/db';
import { type RestaurantWithRatings } from '../hooks/useRestaurants';

interface EditRatingProps {
  rating: Rating;
  restaurant: RestaurantWithRatings;
  onClose: () => void;
}

export function EditRating({ rating, restaurant, onClose }: EditRatingProps) {
  const [newRating, setNewRating] = useState<RatingType>(rating.rating);
  const [notes, setNotes] = useState(rating.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!newRating) return;
    setSaving(true);
    try {
      await updateRating(rating.id, {
        rating: newRating as RatingValue,
        notes,
      });
      onClose();
    } catch (err) {
      console.error('Failed to update rating:', err);
      setSaving(false);
    }
  };

  return (
    <div className="p-8 flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-600 p-2 rounded-full hover:bg-zinc-100 transition-all"
        >
          <ArrowLeft weight="bold" size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Edit {rating.memberName}'s Vote
          </h2>
          <p className="text-zinc-500 text-sm">{restaurant.spot}</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <Warning weight="fill" size={20} className="text-amber-500 mt-0.5 shrink-0" />
        <p className="text-amber-800 text-sm leading-relaxed">
          All votes cast are final... but we'll let it slide this time. The group <em>will</em> be notified of your cowardice.
        </p>
      </div>

      <RatingAction value={newRating} onChange={setNewRating} />

      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold tracking-tight text-zinc-900 uppercase">
          Updated Notes
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Changed your mind? Explain yourself..."
          className="w-full bg-white border border-zinc-200 rounded-2xl p-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-400 transition-all shadow-sm resize-none"
        />
      </div>

      <motion.button
        onClick={handleSave}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        disabled={!newRating || saving}
        className="bg-zinc-900 text-white font-semibold py-4 px-8 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20 disabled:opacity-50"
      >
        <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        {!saving && <NavigationArrow size={18} weight="bold" />}
      </motion.button>
    </div>
  );
}
