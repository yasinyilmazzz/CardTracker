import { useEffect, useState } from 'react';
import { nowInTimezone } from '../lib/time';

/** Seçili şehrin saat diliminde, her saniye güncellenen "şu an" */
export function useNow(timezone?: string): Date {
  const [now, setNow] = useState<Date>(() => nowInTimezone(timezone));

  useEffect(() => {
    setNow(nowInTimezone(timezone));
    const id = setInterval(() => setNow(nowInTimezone(timezone)), 1000);
    return () => clearInterval(id);
  }, [timezone]);

  return now;
}
