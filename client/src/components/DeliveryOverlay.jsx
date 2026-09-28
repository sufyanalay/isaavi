import { useEffect, useState } from "react";
import { X } from "lucide-react";

const STAGES = ["Packing your order", "Loading into the truck", "On the way to you", "Delivered!"];

export default function DeliveryOverlay({ onDone }) {
  const [stage, setStage] = useState(0);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 1500);
    const t2 = setTimeout(() => setStage(2), 2900);
    const t3 = setTimeout(() => setStage(3), 7200);
    const t4 = setTimeout(() => finish(), 8400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = () => { setClosing(true); setTimeout(() => onDone(), 350); };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity duration-300"
      style={{ background: "rgba(18,10,5,.8)", backdropFilter: "blur(4px)", opacity: closing ? 0 : 1 }}
    >
      <style>{`
        @keyframes doDrive { 0% { transform: translateX(-280px); } 78% { transform: translateX(300px); } 88% { transform: translateX(312px); } 100% { transform: translateX(300px); } }
        @keyframes doBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2.5px); } }
        @keyframes doWheel { to { transform: rotate(360deg); } }
        @keyframes doBoxBounce { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-8px) rotate(2deg); } }
        @keyframes doPinDrop { 0% { transform: translateY(-34px) scale(.5); opacity: 0; } 60% { transform: translateY(6px) scale(1.12); opacity: 1; } 80% { transform: translateY(-3px) scale(.97); } 100% { transform: translateY(0) scale(1); } }
        @keyframes doRing { 0% { transform: scale(.5); opacity: .8; } 100% { transform: scale(2.6); opacity: 0; } }
        @keyframes doSmoke { 0% { transform: translate(0,0) scale(.4); opacity: .55; } 100% { transform: translate(-22px,-18px) scale(1.5); opacity: 0; } }
        @keyframes doCloud { 0% { transform: translateX(0); } 100% { transform: translateX(-140px); } }
        @keyframes doFadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .dv-drive { animation: doDrive 4.2s cubic-bezier(.4,0,.2,1) forwards; }
        .dv-bob { animation: doBob .35s ease-in-out infinite; }
        .dv-wheel { animation: doWheel .4s linear infinite; transform-origin: center; }
        .dv-box { animation: doBoxBounce 1s ease-in-out infinite; transform-origin: center; }
        .dv-pin { animation: doPinDrop .6s cubic-bezier(.3,1.6,.4,1) forwards; }
        .dv-ring { animation: doRing 1.3s ease-out infinite; transform-origin: center; }
        .dv-smoke circle { animation: doSmoke 1s ease-out infinite; }
        .dv-cloud { animation: doCloud 9s linear infinite; }
        .dv-label { animation: doFadeUp .35s ease both; }
      `}</style>

      <div className="bg-bg rounded-2xl px-8 pt-9 pb-7 w-full max-w-[460px] text-center relative border border-line shadow-2xl">
        <button onClick={finish} aria-label="Skip" className="absolute top-3.5 right-3.5 text-muted hover:text-ink transition-colors">
          <X size={18} />
        </button>

        <div className="text-[10px] tracking-[.18em] uppercase font-semibold text-gold-dark mb-1.5">Isaavi Leather</div>
        <div key={stage} className="dv-label font-serif text-[23px] mb-6 min-h-[30px]">{STAGES[stage]}</div>

        <div className="relative h-[130px] mb-5 rounded-xl overflow-hidden bg-gradient-to-b from-[#f3ead6] to-[#e9dcc0]">
          {/* sky clouds, drift always */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 130" preserveAspectRatio="none">
            <g className="dv-cloud" opacity="0.5">
              <ellipse cx="60" cy="26" rx="22" ry="8" fill="#fff" />
              <ellipse cx="220" cy="18" rx="16" ry="6" fill="#fff" />
              <ellipse cx="380" cy="30" rx="20" ry="7" fill="#fff" />
            </g>
          </svg>

          {stage === 0 && (
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 130">
              <ellipse cx="150" cy="112" rx="44" ry="6" fill="#00000014" />
              <g className="dv-box" style={{ transformOrigin: "150px 90px" }}>
                <rect x="118" y="62" width="64" height="46" rx="4" fill="#a9683c" />
                <rect x="118" y="62" width="64" height="12" rx="4" fill="#8a4f28" />
                <line x1="150" y1="62" x2="150" y2="108" stroke="#6b3b1e" strokeWidth="2" />
                <path d="M118 70 L150 80 L182 70" fill="none" stroke="#6b3b1e" strokeWidth="2" />
              </g>
            </svg>
          )}

          {stage === 1 && (
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 130">
              <ellipse cx="150" cy="112" rx="60" ry="6" fill="#00000014" />
              <g transform="translate(90,44)"><TruckSVG /></g>
              <g className="dv-box" style={{ transformOrigin: "205px 68px" }}>
                <rect x="192" y="54" width="26" height="26" rx="3" fill="#c9a45c" />
              </g>
            </svg>
          )}

          {stage === 2 && (
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 130" style={{ overflow: "visible" }}>
              <line x1="-20" y1="112" x2="320" y2="112" stroke="#d8cbaa" strokeWidth="3" strokeDasharray="12 10" />
              <g className="dv-drive">
                <g className="dv-bob" transform="translate(-20,40)">
                  <g className="dv-smoke">
                    <circle cx="-4" cy="48" r="4" fill="#c9c2b6" />
                    <circle cx="-10" cy="52" r="3" fill="#c9c2b6" />
                    <circle cx="-16" cy="56" r="2.4" fill="#c9c2b6" />
                  </g>
                  <TruckSVG driving />
                </g>
              </g>
            </svg>
          )}

          {stage === 3 && (
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 130">
              <ellipse cx="150" cy="115" rx="30" ry="5" fill="#00000014" />
              <circle className="dv-ring" cx="150" cy="70" r="16" fill="none" stroke="var(--color-gold)" strokeWidth="2" />
              <g className="dv-pin">
                <path d="M150 32 C132 32 120 46 120 62 C120 86 150 110 150 110 C150 110 180 86 180 62 C180 46 168 32 150 32 Z" fill="#3b2316" />
                <circle cx="150" cy="62" r="14" fill="#f3ebe0" />
                <path d="M143 62 L148 68 L159 54" stroke="#3b2316" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </svg>
          )}
        </div>

        <div className="flex justify-center gap-2 mb-5">
          {STAGES.map((s, i) => (
            <div key={s} className={`w-2 h-2 rounded-full transition-colors duration-300 ${i <= stage ? "bg-brown" : "bg-line"}`} />
          ))}
        </div>

        <button onClick={finish} className="border border-line rounded-full px-5 py-2 text-xs text-muted hover:text-ink hover:border-ink transition-colors">
          Skip
        </button>
      </div>
    </div>
  );
}

function TruckSVG({ driving = false }) {
  return (
    <g>
      <ellipse cx="60" cy="82" rx="66" ry="5" fill="#00000018" />
      {/* cargo box with panel lines */}
      <rect x="0" y="20" width="82" height="46" rx="5" fill="#3b2316" />
      <rect x="0" y="20" width="82" height="46" rx="5" fill="url(#truckShade)" />
      <rect x="8" y="27" width="66" height="17" rx="2" fill="#4a2c18" />
      <text x="41" y="39" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="10.5" fill="#e8d8bd" letterSpacing="1.2">ISAAVI</text>
      <line x1="0" y1="50" x2="82" y2="50" stroke="#2a160b" strokeWidth="1.5" />
      <line x1="20" y1="50" x2="20" y2="66" stroke="#2a160b" strokeWidth="1" />
      <line x1="62" y1="50" x2="62" y2="66" stroke="#2a160b" strokeWidth="1" />
      {/* cab */}
      <path d="M82 32 H112 L126 50 V66 H82 Z" fill="#c9a45c" />
      <path d="M82 32 H112 L126 50 V66 H82 Z" fill="url(#cabShade)" />
      <rect x="90" y="39" width="20" height="13" rx="2" fill="#eef4f7" opacity=".9" />
      <rect x="90" y="39" width="20" height="13" rx="2" fill="#8fa9b8" opacity=".25" />
      <rect x="118" y="56" width="8" height="4" rx="1" fill="#f3ebe0" />
      {/* bumper + headlight */}
      <rect x="122" y="58" width="6" height="8" rx="1" fill="#241509" />
      <circle cx="125" cy="58" r="2" fill="#ffe9b0" />
      {/* wheels with suspension bounce via parent .dv-bob */}
      <g className={driving ? "dv-wheel" : ""} style={{ transformOrigin: "22px 74px" }}>
        <circle cx="22" cy="74" r="10" fill="#1a0f06" />
        <circle cx="22" cy="74" r="4" fill="#c9c2b6" />
        <circle cx="22" cy="74" r="1.4" fill="#6b6255" />
      </g>
      <g className={driving ? "dv-wheel" : ""} style={{ transformOrigin: "104px 74px" }}>
        <circle cx="104" cy="74" r="10" fill="#1a0f06" />
        <circle cx="104" cy="74" r="4" fill="#c9c2b6" />
        <circle cx="104" cy="74" r="1.4" fill="#6b6255" />
      </g>

      <defs>
        <linearGradient id="truckShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="cabShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </g>
  );
}