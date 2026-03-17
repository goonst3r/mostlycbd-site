import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, NavigationArrow, CaretDown, Plus, CheckCircle } from '@phosphor-icons/react';
import { RatingAction, type RatingType } from './RatingAction';
import { ImageUpload } from './ImageUpload';
import { addRating, addRestaurant, uploadPhotos, type Member, type Restaurant, type RatingValue } from '../lib/db';
interface RateSpotProps {
  restaurants: Restaurant[];
  members: Member[];
  onComplete: () => void;
}

export function RateSpot({ restaurants, members, onComplete }: RateSpotProps) {
  const [rating, setRating] = useState<RatingType>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [foodPhotos, setFoodPhotos] = useState<File[]>([]);
  const [selfiePhotos, setSelfiePhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // New restaurant fields
  const [addingNew, setAddingNew] = useState(false);
  const [newSpot, setNewSpot] = useState('');
  const [newStyle, setNewStyle] = useState('');
  const [newWebsite, setNewWebsite] = useState('');

  const selectedMemberObj = members.find((m) => m.id === selectedMember);

  const handleSubmit = async () => {
    if (!rating || !selectedMember || (!selectedRestaurant && !addingNew)) return;
    setSubmitting(true);

    try {
      let restaurantId = selectedRestaurant;

      // Create new restaurant if needed
      if (addingNew && newSpot.trim()) {
        restaurantId = await addRestaurant({
          spot: newSpot.trim(),
          style: newStyle.trim() || 'Restaurant',
          website: newWebsite.trim() || null,
          img: `https://picsum.photos/seed/${encodeURIComponent(newSpot.trim())}/800/600`,
        });
      }

      // Upload photos
      const allFiles = [...foodPhotos, ...selfiePhotos];
      const photoUrls = allFiles.length > 0 ? await uploadPhotos(allFiles, restaurantId) : [];

      // Submit rating
      await addRating({
        restaurantId,
        memberId: selectedMember,
        memberName: selectedMemberObj?.name || '',
        rating: rating as RatingValue,
        notes,
        photos: photoUrls,
      });

      setSubmitted(true);
      setTimeout(() => onComplete(), 1500);
    } catch (err) {
      console.error('Failed to submit rating:', err);
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto flex flex-col items-center justify-center py-32 gap-6"
      >
        <CheckCircle size={64} weight="fill" className="text-emerald-500" />
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Vote Recorded!</h2>
        <p className="text-zinc-500">The gang has spoken. Redirecting...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="max-w-2xl mx-auto flex flex-col gap-10"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-900 leading-none">
          Cast Your Vote
        </h1>
        <p className="text-zinc-500 text-lg leading-relaxed">
          Record your meal honestly. Was it a marry, a fuck, or a kill?
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {/* Member picker */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold tracking-tight text-zinc-900 uppercase">Who's Voting?</label>
          <div className="relative">
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full appearance-none bg-white border border-zinc-200 rounded-2xl py-4 px-4 pr-10 text-lg font-medium text-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-400 transition-all shadow-sm"
            >
              <option value="">Select member...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <CaretDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {/* Restaurant picker */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold tracking-tight text-zinc-900 uppercase">Spot Location</label>
          {!addingNew ? (
            <>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400">
                  <MapPin size={20} weight="duotone" />
                </div>
                <select
                  value={selectedRestaurant}
                  onChange={(e) => setSelectedRestaurant(e.target.value)}
                  className="w-full appearance-none bg-white border border-zinc-200 rounded-2xl py-4 pl-12 pr-10 text-lg font-medium text-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-400 transition-all shadow-sm"
                >
                  <option value="">Select restaurant...</option>
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>{r.spot} — {r.style}</option>
                  ))}
                </select>
                <CaretDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={() => setAddingNew(true)}
                className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors self-start"
              >
                <Plus size={14} weight="bold" />
                New spot not on the list?
              </button>
            </>
          ) : (
            <div className="bg-white border border-zinc-200 p-6 rounded-[2rem] shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-900">Add New Spot</span>
                <button
                  type="button"
                  onClick={() => { setAddingNew(false); setNewSpot(''); setNewStyle(''); setNewWebsite(''); }}
                  className="text-xs text-zinc-500 hover:text-zinc-700 transition-colors"
                >
                  Cancel — pick from list
                </button>
              </div>
              <input
                value={newSpot}
                onChange={(e) => setNewSpot(e.target.value)}
                placeholder="Restaurant name"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-base font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
              />
              <input
                value={newStyle}
                onChange={(e) => setNewStyle(e.target.value)}
                placeholder="Cuisine style (e.g. Italian, BBQ)"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-base font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
              />
              <input
                value={newWebsite}
                onChange={(e) => setNewWebsite(e.target.value)}
                placeholder="Website URL (optional)"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-base font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
              />
            </div>
          )}
        </div>

        <RatingAction value={rating} onChange={setRating} />

        <div className="bg-white border text-left border-zinc-200 p-8 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col gap-8">
          <ImageUpload
            label="Food Photos"
            description="Visual proof of the culinary execution."
            maxFiles={4}
            onUpload={setFoodPhotos}
          />
          <div className="h-px bg-zinc-100 w-full" />
          <ImageUpload
            label="Group Selfies"
            description="Proof of attendance for the gang bang."
            maxFiles={2}
            onUpload={setSelfiePhotos}
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold tracking-tight text-zinc-900 uppercase">Final Verdict & Notes</label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What made it great or terrible? Detail the service, the waits, the taste..."
            className="w-full bg-white border border-zinc-200 rounded-2xl p-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-400 transition-all shadow-sm resize-none"
          />
        </div>

        <motion.button
          onClick={handleSubmit}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="bg-zinc-900 text-white font-semibold py-4 px-8 rounded-2xl flex items-center justify-center gap-2 mt-4 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20 disabled:opacity-50"
          disabled={!rating || !selectedMember || (!selectedRestaurant && !(addingNew && newSpot.trim())) || submitting}
        >
          <span>{submitting ? 'Submitting...' : 'Submit Rating'}</span>
          {!submitting && <NavigationArrow size={18} weight="bold" />}
        </motion.button>
      </div>
    </motion.div>
  );
}
