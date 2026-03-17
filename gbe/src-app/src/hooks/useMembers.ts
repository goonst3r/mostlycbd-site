import { useState, useEffect } from 'react';
import { subscribeMembers, type Member } from '../lib/db';

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeMembers((data) => {
      setMembers(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { members, loading };
}
