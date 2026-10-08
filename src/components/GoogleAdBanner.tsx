import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

interface GoogleAdBannerProps {
  slotId?: string;
  client?: string;
  format?: 'auto' | 'horizontal' | 'rectangle' | 'in-feed';
  className?: string;
  title?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export const GoogleAdBanner: React.FC<GoogleAdBannerProps> = ({
  slotId = '9823481283749210',
  client = 'ca-pub-9823481283749210',
  format = 'auto',
  className = '',
  title = 'Sponsor & Rekomendasi Industri',
}) => {
  const adRef = useRef<HTMLModElement | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
        setAdLoaded(true);
      }
    } catch (e) {
      // AdSense might throw if ad block is active or duplicate pushes occur
      setAdError(true);
    }
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900/90 via-slate-900 to-slate-950 p-3 sm:p-4 shadow-md transition-all ${className}`}>
      {/* Top Header Label */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-slate-300 font-bold uppercase tracking-wider">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] text-slate-400 font-medium">Google AdSense</span>
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
        </div>
      </div>

      {/* Official AdSense Container */}
      <div className="relative min-h-[60px] flex items-center justify-center">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client={client}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />

        {/* Fallback & High-converting Sponsored Partner Display if live ads are loading / in development / adblock active */}
        {(!adLoaded || adError) && (
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Pusat Suplai Kimia & Mesin LaundryHub</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    Diskon 35%
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Deterjen konsentrat aroma Sakura, mesin dryer komersial gas 10.5kg & hanger premium siap kirim se-Indonesia.
                </p>
              </div>
            </div>

            <a
              href="https://wa.me/6281228263200?text=Halo%20LaundryHub,%20saya%20tertarik%20dengan%20suplai%20mesin%20dan%20kimia%20laundry"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 text-xs font-bold transition-all"
            >
              <span>Hubungi Distributor</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
