import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Radio,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Compass,
  Store,
  Clock,
  Sparkles,
} from 'lucide-react';

interface GeofenceRadarMapProps {
  outletName: string;
  outletLat: number;
  outletLng: number;
  userLat?: number;
  userLng?: number;
  distanceMeters: number;
  maxRadiusMeters?: number;
  mode?: 'geofence' | 'courier';
  courierDestinationName?: string;
  courierEtaMinutes?: number;
}

export const GeofenceRadarMap: React.FC<GeofenceRadarMapProps> = ({
  outletName,
  outletLat,
  outletLng,
  userLat,
  userLng,
  distanceMeters,
  maxRadiusMeters = 50,
  mode = 'geofence',
  courierDestinationName = 'Jl. Ampera Raya No. 45, Mampang',
  courierEtaMinutes = 12,
}) => {
  const [activeView, setActiveView] = useState<'geofence' | 'courier'>(mode);
  const [courierProgress, setCourierProgress] = useState(35); // 0% to 100% on route

  // Animate courier moving along route
  useEffect(() => {
    if (activeView === 'courier') {
      const interval = setInterval(() => {
        setCourierProgress((prev) => (prev >= 90 ? 15 : prev + 1.5));
      }, 300);
      return () => clearInterval(interval);
    }
  }, [activeView]);

  const isInside = distanceMeters <= maxRadiusMeters;

  // Calculate normalized pin coordinate for geofence radar (center is 150, 150 in 300x300 SVG)
  // 50m radius corresponds to radius 60 in SVG
  const svgRadius50m = 60;
  const clampedDist = Math.min(distanceMeters, 250);
  const scale = clampedDist / maxRadiusMeters;
  const pinRadius = Math.max(10, Math.min(130, scale * svgRadius50m));
  // Place pin at an angle (e.g. 45 degrees or based on delta coords)
  const angleRad = (45 * Math.PI) / 180;
  const pinX = 150 + pinRadius * Math.cos(angleRad);
  const pinY = 150 - pinRadius * Math.sin(angleRad);

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-700/80 p-4 text-white overflow-hidden space-y-3 relative shadow-xl">
      {/* View Switcher Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-white leading-tight">
              {activeView === 'geofence' ? 'Radar Geofencing Outlet' : 'Live Tracking Rute Kurir'}
            </h4>
            <p className="text-[10px] text-slate-400">
              {activeView === 'geofence'
                ? `${outletName} • Radius Maks: ${maxRadiusMeters}m`
                : `Tujuan: ${courierDestinationName} • ETA ~${courierEtaMinutes} mnt`}
            </p>
          </div>
        </div>

        {/* Mode Toggle Button */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-[10px]">
          <button
            type="button"
            onClick={() => setActiveView('geofence')}
            className={`px-2 py-1 rounded-lg font-bold transition-all ${
              activeView === 'geofence'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Geofence
          </button>
          <button
            type="button"
            onClick={() => setActiveView('courier')}
            className={`px-2 py-1 rounded-lg font-bold transition-all ${
              activeView === 'courier'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Rute Kurir
          </button>
        </div>
      </div>

      {/* SVG Canvas Map Display */}
      <div className="relative aspect-[16/9] w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
        {/* Radar Sweep Background Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {activeView === 'geofence' ? (
          // MODE 1: GEOFENCE RADAR CIRCLE
          <svg viewBox="0 0 300 300" className="w-full h-full">
            {/* Concentric radar rings */}
            <circle cx="150" cy="150" r="130" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="150" cy="150" r="95" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />

            {/* 50m Geofence Perimeter (Green glowing circle) */}
            <circle
              cx="150"
              cy="150"
              r="60"
              fill={isInside ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.08)'}
              stroke={isInside ? '#10b981' : '#f43f5e'}
              strokeWidth="2.5"
              className={isInside ? 'animate-pulse' : ''}
            />

            {/* Crosshairs */}
            <line x1="150" y1="20" x2="150" y2="280" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="20" y1="150" x2="280" y2="150" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />

            {/* Center Outlet Hub Pin */}
            <circle cx="150" cy="150" r="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
            <circle cx="150" cy="150" r="6" fill="#38bdf8" />
            <text x="150" y="178" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold">
              OUTLET HUB
            </text>

            {/* 50m Radius Label */}
            <text x="150" y="85" textAnchor="middle" fill={isInside ? '#34d399' : '#f87171'} fontSize="8" fontWeight="bold">
              BATAS RADIUS 50M
            </text>

            {/* Staff User Pin */}
            <g className="transition-all duration-500">
              {/* Radar wave ping */}
              <circle
                cx={pinX}
                cy={pinY}
                r="18"
                fill={isInside ? 'rgba(52, 211, 153, 0.25)' : 'rgba(244, 63, 94, 0.25)'}
                className="animate-ping"
              />
              {/* Outer border */}
              <circle
                cx={pinX}
                cy={pinY}
                r="10"
                fill="#0f172a"
                stroke={isInside ? '#10b981' : '#f43f5e'}
                strokeWidth="2"
              />
              {/* Inner dot */}
              <circle cx={pinX} cy={pinY} r="5" fill={isInside ? '#10b981' : '#f43f5e'} />
              {/* Staff text */}
              <text x={pinX} y={pinY - 14} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                STAF ({distanceMeters}m)
              </text>
            </g>
          </svg>
        ) : (
          // MODE 2: COURIER ROUTE ROAD TRACKER
          <svg viewBox="0 0 360 200" className="w-full h-full">
            {/* Road Polyline path from Outlet (40, 150) to Customer (320, 50) */}
            <path
              d="M 40 150 C 90 150, 110 90, 160 90 S 230 140, 270 90 L 320 50"
              fill="none"
              stroke="#334155"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Active illuminated path */}
            <path
              d="M 40 150 C 90 150, 110 90, 160 90 S 230 140, 270 90 L 320 50"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="4"
              strokeDasharray="6 4"
              className="animate-pulse"
            />

            {/* Outlet Origin Hub (40, 150) */}
            <circle cx="40" cy="150" r="12" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" />
            <circle cx="40" cy="150" r="5" fill="#10b981" />
            <text x="40" y="175" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold">
              OUTLET
            </text>

            {/* Customer Destination (320, 50) */}
            <circle cx="320" cy="50" r="12" fill="#0f172a" stroke="#ec4899" strokeWidth="2.5" />
            <circle cx="320" cy="50" r="5" fill="#ec4899" />
            <text x="320" y="32" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="bold">
              TUJUAN
            </text>

            {/* Animated Moving Courier Motorbike */}
            {(() => {
              // Interpolated position along bezier curve
              const t = courierProgress / 100;
              // Approximate position
              const cx = 40 + t * 280;
              const cy = 150 - Math.sin(t * Math.PI) * 70 - t * 30;

              return (
                <g className="transition-all duration-300">
                  <circle cx={cx} cy={cy} r="14" fill="#0f172a" stroke="#f59e0b" strokeWidth="2.5" />
                  <circle cx={cx} cy={cy} r="6" fill="#f59e0b" className="animate-ping" />
                  <text x={cx} y={cy - 18} textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold">
                    🛵 KURIR (OTW)
                  </text>
                </g>
              );
            })()}
          </svg>
        )}

        {/* Live Status Badge overlay */}
        <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 bg-slate-900/85 backdrop-blur-md rounded-xl text-[11px] flex items-center justify-between border border-slate-700/60">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isInside ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 animate-ping'
              }`}
            />
            <span className="font-semibold text-slate-200">
              {activeView === 'geofence'
                ? isInside
                  ? `Terverifikasi: ${distanceMeters} meter dari outlet (Dalam Radius)`
                  : `Peringatan: ${distanceMeters} meter (Di Luar Radius > 50m)`
                : `Kurir sedang menuju alamat (${courierProgress.toFixed(0)}% perjalanan)`}
            </span>
          </div>

          <span className="font-mono font-bold text-cyan-400">
            {activeView === 'geofence' ? `±4m Akurat` : `~${courierEtaMinutes} mnt`}
          </span>
        </div>
      </div>
    </div>
  );
};
