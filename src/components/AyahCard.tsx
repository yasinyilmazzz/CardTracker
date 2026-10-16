import { BookOpen, CloudOff, Loader2, RefreshCw } from 'lucide-react';
import type { AyahData } from '../lib/types';
import { surahNameTr } from '../data/surahs';
import OfflineBadge from './OfflineBadge';

interface Props {
  ayah: AyahData | null;
  loading: boolean;
  isStale: boolean;
  online: boolean;
  onRefresh: () => void;
}

export default function AyahCard({ ayah, loading, isStale, online, onRefresh }: Props) {
  return (
    <section
      className="animate-fade-up relative rounded-3xl border border-night-700 bg-night-850 p-5 shadow-lg"
      style={{ animationDelay: '160ms' }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-gold-400" />
          <h3 className="text-base font-extrabold text-cream">Günün Ayeti</h3>
        </div>
        <div className="flex items-center gap-2">
          {isStale && ayah && <OfflineBadge lastUpdated={ayah.fetchedAt} />}
          <button
            type="button"
            onClick={onRefresh}
            disabled={!online || loading}
            aria-label="Yeni ayet getir"
            title={online ? 'Yeni ayet getir' : 'İnternet bağlantısı yok'}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-night-600 bg-night-800 text-sage transition-all hover:border-gold-500/60 hover:text-gold-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {ayah ? (
        <>
          <div className="max-h-80 overflow-y-auto pr-1">
            <p
              dir="rtl"
              lang="ar"
              className="font-arabic text-right text-[26px] leading-[2.1] text-gold-200"
            >
              {ayah.arabic}
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-cream/90">
              {ayah.translation}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-night-700/70 pt-3">
            <span className="rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-1 text-xs font-bold text-gold-300">
              {surahNameTr(ayah.surahNumber)} Suresi · {ayah.ayahNumber}. Ayet
            </span>
            <span className="text-[11px] font-medium text-sage-dark">
              Diyanet İşleri Meali
            </span>
          </div>
        </>
      ) : (
        <div className="py-6 text-center">
          {loading ? (
            <>
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-gold-400" />
              <p className="mt-3 text-sm text-sage">Ayet yükleniyor…</p>
            </>
          ) : (
            <>
              <CloudOff className="mx-auto h-7 w-7 text-sage-dark" />
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-sage">
                {online
                  ? 'Ayet getirilemedi. Lütfen tekrar deneyin.'
                  : 'İnternet bağlantısı olmadığı için ayet gösterilemiyor. Bağlantı kurulduğunda otomatik yüklenecektir.'}
              </p>
              {online && (
                <button
                  type="button"
                  onClick={onRefresh}
                  className="mt-4 rounded-xl bg-gold-500 px-4 py-2 text-sm font-bold text-night-950 transition-colors hover:bg-gold-400"
                >
                  Tekrar Dene
                </button>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
