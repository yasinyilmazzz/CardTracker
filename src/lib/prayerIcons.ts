import {
  Moon,
  MoonStar,
  Sun,
  SunDim,
  Sunrise,
  Sunset,
  type LucideIcon,
} from 'lucide-react';
import type { PrayerKey } from './types';

export const PRAYER_ICONS: Record<PrayerKey, LucideIcon> = {
  Fajr: MoonStar,
  Sunrise: Sunrise,
  Dhuhr: Sun,
  Asr: SunDim,
  Maghrib: Sunset,
  Isha: Moon,
};
