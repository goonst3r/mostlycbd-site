import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout } from './components/Layout';
import { Navigation } from './components/Navigation';
import { Feed } from './components/Feed';
import { RateSpot } from './components/RateSpot';
import { RestaurantModal } from './components/RestaurantModal';
import { MemberManager } from './components/MemberManager';
import { useRestaurants, type RestaurantWithRatings } from './hooks/useRestaurants';
import { useMembers } from './hooks/useMembers';
import { seedDatabase, resetDatabase } from './lib/seed';

// Dev helper — call window.resetDB() in browser console to clear & reseed
if (import.meta.env.DEV) {
  (window as any).resetDB = resetDatabase;
}

function App() {
  const [activeView, setActiveView] = useState<'feed' | 'rate'>('feed');
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantWithRatings | null>(null);
  const [membersOpen, setMembersOpen] = useState(false);

  const { restaurants, loading: restaurantsLoading } = useRestaurants();
  const { members } = useMembers();

  // Auto-seed on first load if DB is empty
  useEffect(() => {
    seedDatabase().catch(console.error);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  // Keep modal data fresh when restaurants update
  useEffect(() => {
    if (selectedRestaurant) {
      const updated = restaurants.find((r) => r.id === selectedRestaurant.id);
      if (updated) setSelectedRestaurant(updated);
    }
  }, [restaurants]);

  return (
    <>
      <Navigation
        activeView={activeView}
        onViewChange={setActiveView}
        onOpenMembers={() => setMembersOpen(true)}
      />
      <Layout>
        <AnimatePresence mode="wait">
          {activeView === 'feed' ? (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Feed
                restaurants={restaurants}
                loading={restaurantsLoading}
                onSelectRestaurant={setSelectedRestaurant}
              />
            </motion.div>
          ) : (
            <motion.div
              key="rate"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <RateSpot
                restaurants={restaurants}
                members={members}
                onComplete={() => setActiveView('feed')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Layout>

      <RestaurantModal
        restaurant={selectedRestaurant}
        members={members}
        onClose={() => setSelectedRestaurant(null)}
      />

      <MemberManager
        members={members}
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
      />
    </>
  );
}

export default App;
