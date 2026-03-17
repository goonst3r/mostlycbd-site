import { useState, useEffect, useMemo } from 'react';
import { subscribeRestaurants, subscribeRatings, type Restaurant, type Rating } from '../lib/db';

export interface RestaurantWithRatings extends Restaurant {
  ratings: Rating[];
  rankingString: string;
  primaryType: 'marry' | 'fuck' | 'kill' | 'unrated';
}

function getPrimaryType(ratings: Rating[]): 'marry' | 'fuck' | 'kill' | 'unrated' {
  if (ratings.length === 0) return 'unrated';
  const counts = { marry: 0, fuck: 0, kill: 0 };
  for (const r of ratings) {
    counts[r.rating]++;
  }
  if (counts.marry >= counts.fuck && counts.marry >= counts.kill) return 'marry';
  if (counts.fuck > counts.marry && counts.fuck >= counts.kill) return 'fuck';
  return 'kill';
}

function buildRankingString(ratings: Rating[]): string {
  if (ratings.length === 0) return '----';
  return ratings
    .map((r) => r.rating[0].toUpperCase())
    .join('')
    .padEnd(4, '-')
    .slice(0, 8); // support more than 4 members
}

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let restaurantsLoaded = false;
    let ratingsLoaded = false;

    const checkDone = () => {
      if (restaurantsLoaded && ratingsLoaded) setLoading(false);
    };

    const unsubR = subscribeRestaurants((data) => {
      setRestaurants(data);
      restaurantsLoaded = true;
      checkDone();
    });

    const unsubRat = subscribeRatings((data) => {
      setRatings(data);
      ratingsLoaded = true;
      checkDone();
    });

    return () => {
      unsubR();
      unsubRat();
    };
  }, []);

  const enriched: RestaurantWithRatings[] = useMemo(() => {
    const ratingsByRestaurant = new Map<string, Rating[]>();
    for (const r of ratings) {
      const list = ratingsByRestaurant.get(r.restaurantId) || [];
      list.push(r);
      ratingsByRestaurant.set(r.restaurantId, list);
    }

    return restaurants.map((rest) => {
      const restRatings = ratingsByRestaurant.get(rest.id) || [];
      return {
        ...rest,
        ratings: restRatings,
        rankingString: buildRankingString(restRatings),
        primaryType: getPrimaryType(restRatings),
      };
    });
  }, [restaurants, ratings]);

  // Sort: marry first (by marry count), then fuck (by fuck count), then kill, then unrated
  const sorted = useMemo(() => {
    const typeRank = { marry: 0, fuck: 1, kill: 2, unrated: 3 };

    return [...enriched].sort((a, b) => {
      // Primary: group by type rank
      const rankDiff = typeRank[a.primaryType] - typeRank[b.primaryType];
      if (rankDiff !== 0) return rankDiff;

      // Secondary: within same type, sort by how many votes of that type (more = higher)
      if (a.primaryType !== 'unrated') {
        const aTypeCount = a.ratings.filter(r => r.rating === a.primaryType).length;
        const bTypeCount = b.ratings.filter(r => r.rating === b.primaryType).length;
        if (bTypeCount !== aTypeCount) return bTypeCount - aTypeCount;

        // Tertiary: more total votes = higher
        return b.ratings.length - a.ratings.length;
      }

      // Unrated: alphabetical
      return a.spot.localeCompare(b.spot);
    });
  }, [enriched]);

  return { restaurants: sorted, ratings, loading };
}
