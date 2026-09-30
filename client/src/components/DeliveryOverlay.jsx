import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Briefcase, Hammer, Heart, ShoppingBag, X } from "lucide-react";

/* ------------------------------------------------------------------
   Realistic workshop scene.
   - The artisan is a real skeleton rig: thigh/shin/foot, torso, upper arm/forearm, head.
   - Legs and arms use 2-bone IK, so feet stay planted on the floor (no sliding),
     knees/elbows bend the right way, and crouching / reaching is physically correct.
   - Walk cycle is driven by DISTANCE travelled, not by a timer, so steps match speed.
   - ONE requestAnimationFrame loop drives everything by writing SVG attributes
     directly (no React re-render per frame) -> smooth even on phones.
   ------------------------------------------------------------------ */

const STEPS = [
  { icon: ShoppingBag, short: "Received", label: "Order received!", hint: "Your order just landed in our workshop" },
  { icon: Heart, short: "Thanks", label: "Thank you!", hint: "Our artisan is happy — thanks for shopping" },
  { icon: Briefcase, short: "Tools", label: "Grabbing his tool bag", hint: "Getting everything ready to start" },
  { icon: Hammer, short: "Crafting", label: "Making your wallet", hint: "Cut, stitch and press — all by hand" },
];

const TOTAL_MS = 13400;
const CLOSE_MS = 320;

/* ---- body dimensions (scene units, ground at y = 118) ---- */
const L1 = 19.5, L2 = 19.5;   // thigh, shin
const AU = 15.5, AF = 14;     // upper arm, forearm
const HIP_H = 36;             // standing hip height
const STEP = 15, LIFT = 6.5, CYC = 64; // gait: half-step, foot lift, distance per full cycle

/* ---- world layout ---- */
const HOME = 150;             // where he works, next to the bench
const BAGX = 58;              // where he stands to pick up the bag
const BAG_G = 40;             // bag on the floor
const SET_X = 122;            // where he puts the bag down again
const TK_X = 250;             // order slip on the bench
const WX = 204;               // wallet on the bench

/* ---- timeline (ms) ---- */
const T = {
  happy: 1800, turnL: 3600, w1a: 3900, w1b: 5000, crouchA: 5050, crouchB: 6000,
  bagOn: 5650, turnR: 6300, w2a: 6500, w2b: 7700, work: 7900, done: 11300,
};

/* ---- math helpers ---- */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const lerp = (a, b, k) => a + (b - a) * k;
const easeSine = (x) => -(Math.cos(Math.PI * x) - 1) / 2;
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const easeOutBack = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const sm = (cur, target, k, dt) => cur + (target - cur) * (1 - Math.exp(-k * dt)); // frame-rate independent smoothing
const f2 = (n) => n.toFixed(2);

/* 2-bone IK. sign = +1 knee forward (legs), -1 elbow down/back (arms). angles in deg, 0 = pointing down */
function ik(hx, hy, fx, fy, l1, l2, sign) {
  const dx = fx - hx, dy = fy - hy;
  const d = clamp(Math.hypot(dx, dy), Math.abs(l1 - l2) + 0.05, l1 + l2 - 0.05);
  const ang = Math.atan2(dx, dy);
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const th = ang + sign * A;
  const kx = hx + Math.sin(th) * l1, ky = hy + Math.cos(th) * l1;
  const ex = hx + Math.sin(ang) * d, ey = hy + Math.cos(ang) * d;
  const sh = Math.atan2(ex - kx, ey - ky);
  const a = (-th * 180) / Math.PI;
  const b = (-sh * 180) / Math.PI - a;
  return { a, b };
}

function gaitFoot(u) {
  u = ((u % 1) + 1) % 1;
  if (u < 0.5) return { x: STEP * (1 - 4 * u), y: 0 };
  const k = (u - 0.5) * 2;
  return { x: STEP * (-1 + 2 * easeSine(k)), y: -LIFT * Math.sin(Math.PI * k) };
}

export default function OrderOverlay({ onDone }) {
  const [stage, setStage] = useState(0);
  const [closing, setClosing] = useState(false);

  const onDoneRef = useRef(onDone);
  const closedRef = useRef(false);
  const closeRef = useRef(null);
  const timerRef = useRef(null);
  const refs = useRef({});
  const S = useRef(null);

  const r = (k) => (el) => { refs.current[k] = el; };

  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  useEffect(() => {
    closeRef.current = () => {
      if (closedRef.current) return;
      closedRef.current = true;
      setClosing(true);
      timerRef.current = setTimeout(() => onDoneRef.current?.(), CLOSE_MS);
    };
    return () => clearTimeout(timerRef.current);
  }, []);

  /* one rAF loop drives the whole scene */
  useLayoutEffect(() => {
    S.current = {
      stage: 0, wx: HOME, sx: 1, walkDist: 0, w: 0, c: 0, pitch: 0, head: 0, smile: 0.35, mal: 0,
      nu: -5, ne: -14, fu: 6, fe: -10,
    };
    const R = refs.current;
    const st = S.current;
    const set = (k, v) => R[k]?.setAttribute("transform", v);
    const attr = (k, n, v) => R[k]?.setAttribute(n, v);

    const frame = (t, dt) => {
      /* ---------- stage label (React state only changes 3 times) ---------- */
      const stg = t >= T.work ? 3 : t >= 3800 ? 2 : t >= T.happy ? 1 : 0;
      if (stg !== st.stage) { st.stage = stg; setStage(stg); }

      /* ---------- walking position (eased) ---------- */
      let wx;
      if (t < T.w1a) wx = HOME;
      else if (t < T.w1b) wx = lerp(HOME, BAGX, easeSine(seg(t, T.w1a, T.w1b)));
      else if (t < T.w2a) wx = BAGX;
      else if (t < T.w2b) wx = lerp(BAGX, HOME, easeSine(seg(t, T.w2a, T.w2b)));
      else wx = HOME;
      const dx = Math.abs(wx - st.wx);
      st.wx = wx;
      st.walkDist += dx;
      const moving = dt > 0 && dx / dt > 8;
      st.w = sm(st.w, moving ? 1 : 0, 12, dt);
      const w = st.w;
      const u = st.walkDist / CYC; // gait phase from distance -> feet never slide

      /* ---------- facing (turns through a narrow profile like a real turn) ---------- */
      const faceT = t < T.turnL ? 1 : t < T.turnR ? -1 : 1;
      st.sx = sm(st.sx, faceT, 10, dt);

      /* ---------- body state ---------- */
      const working = t >= T.work && t < T.done;
      const isDone = t >= T.done;
      st.c = sm(st.c, t >= T.crouchA && t < T.crouchB ? 1 : 0, 7, dt);
      const pitchT = 34 * st.c + (working ? 22 : 0) + 3.5 * w;
      st.pitch = sm(st.pitch, pitchT, 10, dt);

      const hopH = t > 1900 && t < 3400
        ? 5 * Math.abs(Math.sin(((t - 1900) / 330) * Math.PI)) * (1 - seg(t, 2900, 3400))
        : 0;
      const bob = (-1.5 * (1 - Math.cos(4 * Math.PI * u)) * 0.5) * w;
      const hipY = -HIP_H + st.c * 12 + bob - hopH;
      const hipX = -st.c * 5;

      /* ---------- legs (IK to planted feet) ---------- */
      const gN = gaitFoot(u), gF = gaitFoot(u + 0.5);
      const nfx = lerp(5, gN.x, w), nfy = gN.y * w;
      const ffx = lerp(-5, gF.x, w), ffy = gF.y * w;
      const legN = ik(hipX, hipY, nfx, nfy, L1, L2, 1);
      const legF = ik(hipX, hipY, ffx, ffy, L1, L2, 1);
      set("legNa", `translate(${f2(hipX)},${f2(hipY)}) rotate(${f2(legN.a)})`);
      set("legNb", `translate(0,${L1}) rotate(${f2(legN.b)})`);
      set("legNc", `translate(0,${L2}) rotate(${f2(-(legN.a + legN.b) - 10 * (-nfy / LIFT))})`);
      set("legFa", `translate(${f2(hipX)},${f2(hipY)}) rotate(${f2(legF.a)})`);
      set("legFb", `translate(0,${L1}) rotate(${f2(legF.b)})`);
      set("legFc", `translate(0,${L2}) rotate(${f2(-(legF.a + legF.b) - 10 * (-ffy / LIFT))})`);

      /* ---------- torso ---------- */
      set("torso", `translate(${f2(hipX)},${f2(hipY)}) rotate(${f2(st.pitch)})`);

      /* ---------- arms ---------- */
      const armIK = (X, Y) => {
        const fx = (X - st.wx) * faceT;
        const fy = Y - 118;
        const rx = fx - hipX, ry = fy - hipY;
        const p = (st.pitch * Math.PI) / 180;
        const lx = rx * Math.cos(p) + ry * Math.sin(p);
        const ly = -rx * Math.sin(p) + ry * Math.cos(p);
        return ik(0, 0, lx, ly + 24, AU, AF, -1);
      };

      let nT, fT, k = 9;
      const carrying = t >= T.turnR - 300 && t < T.work;
      if (t < T.happy) {
        nT = { u: -5, e: -14 }; fT = { u: 6, e: -10 };
      } else if (t < T.turnL) {
        const pump = Math.sin((t - T.happy) / 170);
        nT = { u: -132 - 8 * pump, e: -48 + 10 * pump }; fT = { u: -112, e: -62 };
      } else if (t >= T.crouchA && t < T.crouchB) {
        const n = armIK(BAG_G, 118 - 28), f = armIK(BAG_G - 2, 118 - 26);
        nT = { u: n.a, e: n.b }; fT = { u: f.a, e: f.b };
      } else if (working) {
        const ph = ((t - T.work) / 720) % 1;
        const h = ph < 0.62 ? easeSine(ph / 0.62) : 1 - Math.pow((ph - 0.62) / 0.38, 2);
        const ramp = 1 - seg(t, T.work, T.work + 350);
        const n = armIK(178 - 2 * h, 70 - 15 * h - 14 * ramp);
        const f = armIK(184, 76 - 8 * ramp);
        nT = { u: n.a, e: n.b }; fT = { u: f.a, e: f.b };
        k = 40;
      } else if (carrying) {
        nT = { u: -8, e: -100 }; fT = { u: 4, e: -30 };
      } else {
        nT = { u: -5, e: -14 }; fT = { u: 6, e: -10 };
      }
      st.nu = sm(st.nu, nT.u, k, dt); st.ne = sm(st.ne, nT.e, k, dt);
      st.fu = sm(st.fu, fT.u, k, dt); st.fe = sm(st.fe, fT.e, k, dt);
      const swingA = 24 * Math.cos(2 * Math.PI * u) * w * (carrying ? 0.3 : 1);
      set("armNa", `translate(0,-24) rotate(${f2(st.nu + swingA)})`);
      set("armNb", `translate(0,${AU}) rotate(${f2(st.ne - 8 * w)})`);
      set("armFa", `translate(0,-24) rotate(${f2(st.fu - swingA)})`);
      set("armFb", `translate(0,${AU}) rotate(${f2(st.fe - 8 * w)})`);
      st.mal = sm(st.mal, working ? 1 : 0, 12, dt);
      attr("mallet", "opacity", f2(st.mal));

      /* ---------- head + face ---------- */
      let look = 0;
      if (t > 250 && t < T.happy) look = 12;
      else if (t >= 1900 && t < 3500) look = 7 * Math.sin(((t - 1900) / 1600) * Math.PI * 2.5);
      else if (t >= T.crouchA && t < T.crouchB) look = 22;
      else if (working) look = 30;
      st.head = sm(st.head, look - 0.55 * st.pitch, 9, dt);
      set("head", `translate(0,-25) rotate(${f2(st.head)})`);

      const smileT = isDone ? 1 : t >= T.happy && t < T.turnL ? 1 : working ? 0.25 : 0.4;
      st.smile = sm(st.smile, smileT, 8, dt);
      const s = st.smile;
      attr("mouth", "d", `M4.2 -8.6 Q6.2 ${f2(-8.6 + 0.8 + 2.4 * s)} 8.2 ${f2(-8.6 - 0.5 * s)}`);
      attr("eye", "ry", f2(t % 3400 > 3280 ? 0.15 : 1));

      /* ---------- figure root + shadow ---------- */
      set("fig", `translate(${f2(st.wx)},118) scale(${f2(st.sx)},1)`);
      attr("shadow", "rx", f2(16 - hopH * 0.6));
      attr("shadow", "opacity", f2(0.32 - hopH * 0.03));

      /* ---------- tool bag ---------- */
      const carryX = st.wx - 10 * st.sx;
      const carryY = 118 + hipY + 3;
      let bx, by, br;
      if (t < T.bagOn) { bx = BAG_G; by = 118; br = 0; }
      else if (t < 7850) {
        const e = easeOut(seg(t, T.bagOn, 6150));
        bx = lerp(BAG_G, carryX, e); by = lerp(118, carryY, e) - 4 * Math.sin(Math.PI * e); br = st.pitch * st.sx * e;
      } else {
        const e = easeSine(seg(t, 7850, 8300));
        bx = lerp(carryX, SET_X, e); by = lerp(carryY, 118, e); br = lerp(st.pitch * st.sx, 0, e);
      }
      set("bag", `translate(${f2(bx)},${f2(by)}) rotate(${f2(br)})`);
      attr("strap", "opacity", f2(t >= T.bagOn && t < 7850 ? seg(t, T.bagOn + 200, T.bagOn + 500) : 0));

      /* ---------- order slip + ripples ---------- */
      const tp = seg(t, 250, 1150);
      const ty = -(1 - easeOut(tp)) * 70;
      set("ticket", `translate(${TK_X},${f2(82 + ty)}) rotate(${f2(-16 * (1 - tp))})`);
      attr("ticket", "opacity", f2(seg(tp, 0, 0.25) * (1 - seg(t, 7700, 8300))));
      [0, 1].forEach((i) => {
        const pp = seg(t, 1150 + i * 450, 2050 + i * 450);
        const rr = 6 + 26 * pp;
        attr(`rip${i}`, "rx", f2(rr));
        attr(`rip${i}`, "ry", f2(rr * 0.22));
        attr(`rip${i}`, "opacity", f2(pp > 0 && pp < 1 ? 0.5 * (1 - pp) * (1 - seg(t, 7700, 8300)) : 0));
      });

      /* ---------- wallet on the bench ---------- */
      const wp = seg(t, 7800, 8250);
      set("wallet", `translate(${WX},82) scale(${f2(lerp(0.85, 1, easeOut(wp)))})`);
      attr("wallet", "opacity", f2(wp));
      attr("clip", "width", f2(seg(t, 8300, 11000) * 76));
      attr("clasp", "opacity", f2(seg(t, T.done, T.done + 400)));

      /* ---------- done: soft glow + tick ---------- */
      const dp = seg(t, T.done, T.done + 600);
      attr("glow", "opacity", f2(dp * (0.55 + 0.15 * Math.sin(t / 280))));
      set("badge", `translate(${WX + 4},40) scale(${f2(Math.max(0.001, easeOutBack(seg(t, T.done + 60, T.done + 620))))})`);
      attr("badge", "opacity", f2(seg(t, T.done + 60, T.done + 260)));

      /* ---------- ambient: clouds in the window, dust in the light ---------- */
      set("cloud", `translate(${f2(((t / 1000) * 2.2) % 90 - 25)},0)`);
      for (let i = 0; i < 7; i++) {
        attr(`mote${i}`, "cx", f2(52 + i * 13 + 5 * Math.sin(t / 1800 + i * 1.7)));
        attr(`mote${i}`, "cy", f2(50 + ((i * 23) % 55) + 5 * Math.cos(t / 2300 + i * 2)));
        attr(`mote${i}`, "opacity", f2(0.25 + 0.3 * Math.abs(Math.sin(t / 1400 + i))));
      }
    };

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      for (let i = 0; i < 90; i++) frame(11800, 0.05);
      const id = setTimeout(() => closeRef.current?.(), 4000);
      return () => clearTimeout(id);
    }

    frame(0, 0);
    let raf, t0 = null, last = 0;
    const loop = (now) => {
      if (t0 == null) { t0 = now; last = now; }
      const t = now - t0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      frame(t, dt);
      if (t >= TOTAL_MS) { closeRef.current?.(); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") closeRef.current?.(); };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Your order is being made"
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity duration-300 ease-out"
      style={{ background: "rgba(18,10,5,.86)", opacity: closing ? 0 : 1 }}
    >
      <div
        className="relative w-full max-w-[432px] overflow-hidden rounded-2xl border border-line bg-bg px-5 pb-6 pt-8 text-center shadow-2xl sm:px-7"
        style={{ animation: "ovCardIn .45s cubic-bezier(.22,.9,.25,1) both" }}
      >
        <style>{`@keyframes ovCardIn{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}
@keyframes ovPop{0%{transform:scale(.82)}55%{transform:scale(1.08)}100%{transform:scale(1)}}
.ov-pop{animation:ovPop .5s cubic-bezier(.25,1.4,.4,1) both}
@media (prefers-reduced-motion: reduce){.ov-pop{animation:none}}`}</style>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 left-1/2 h-32 w-72 -translate-x-1/2"
          style={{ background: "radial-gradient(closest-side, rgba(201,164,92,.22), rgba(201,164,92,0))" }}
        />

        <button
          type="button"
          onClick={() => closeRef.current?.()}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-[#f1e9d8] hover:text-ink"
        >
          <X size={17} />
        </button>

        <div className="relative">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[.2em] text-gold-dark">Isaavi Leather</div>

          <div className="relative mx-auto mb-4 min-h-[54px]" aria-live="polite">
            {STEPS.map((s, i) => (
              <div
                key={s.label}
                aria-hidden={i !== stage}
                className={`transition-all duration-300 ease-out ${
                  i === stage ? "translate-y-0 opacity-100" : "pointer-events-none absolute inset-x-0 top-0 translate-y-1.5 opacity-0"
                }`}
              >
                <div className="font-serif text-[22px] leading-tight sm:text-[24px]">{s.label}</div>
                <div className="mt-0.5 text-[11px] leading-relaxed text-muted">{s.hint}</div>
              </div>
            ))}
          </div>

          {/* ================= SCENE ================= */}
          <div
            className="relative mb-4 h-[150px] overflow-hidden rounded-xl border border-line/70 sm:h-[176px]"
            style={{ background: "linear-gradient(180deg,#e6d7ba 0%,#d6c29f 60%,#bfa57d 100%)" }}
          >
            <svg viewBox="0 0 320 150" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <Defs />

              {/* ---- back wall ---- */}
              <rect x="0" y="0" width="320" height="118" fill="url(#wkWall)" />
              {/* hanging hides */}
              <rect x="196" y="6" width="90" height="2.5" rx="1" fill="#5a3f27" />
              <path d="M206 8 h20 v34 q-10 6 -20 0 z" fill="#8a5a2f" opacity=".75" />
              <path d="M232 8 h18 v40 q-9 5 -18 0 z" fill="#6f4522" opacity=".75" />
              <path d="M256 8 h22 v30 q-11 5 -22 0 z" fill="#a06d3c" opacity=".7" />
              {/* shelf with tools */}
              <rect x="96" y="44" width="62" height="3" rx="1" fill="#6d4b2b" />
              <rect x="102" y="32" width="6" height="12" rx="1.5" fill="#3b2a1d" />
              <rect x="112" y="36" width="16" height="8" rx="2" fill="#4a3320" />
              <rect x="134" y="30" width="3" height="14" fill="#5b5b5f" />
              <rect x="141" y="34" width="12" height="10" rx="5" fill="#7d5231" />
              {/* window */}
              <rect x="20" y="12" width="56" height="54" rx="2" fill="#6b4a2b" />
              <clipPath id="wkWin"><rect x="24" y="16" width="48" height="46" /></clipPath>
              <rect x="24" y="16" width="48" height="46" fill="url(#wkSky)" />
              <g clipPath="url(#wkWin)">
                <g ref={r("cloud")}>
                  <ellipse cx="30" cy="30" rx="14" ry="4.5" fill="#fff" opacity=".85" />
                  <ellipse cx="40" cy="27" rx="8" ry="3.6" fill="#fff" opacity=".85" />
                </g>
              </g>
              <path d="M48 16 V62 M24 39 H72" stroke="#6b4a2b" strokeWidth="2.4" />
              {/* light shaft */}
              <path d="M24 62 L72 62 L168 118 L74 118 Z" fill="url(#wkBeam)" />
              {Array.from({ length: 7 }).map((_, i) => (
                <circle key={i} ref={r(`mote${i}`)} r="0.9" fill="#fff" opacity="0" />
              ))}

              {/* ---- floor ---- */}
              <rect x="-20" y="118" width="360" height="40" fill="url(#wkFloor)" />
              <path d="M-20 118 H340" stroke="#8f7650" strokeWidth="1.2" />
              <path d="M40 118 L20 150 M120 118 L108 150 M200 118 L196 150 M280 118 L284 150" stroke="#9c8259" strokeWidth=".8" opacity=".5" />
              <ellipse cx="226" cy="119" rx="70" ry="4" fill="#3b2612" opacity=".28" />

              {/* ---- workbench ---- */}
              <Bench />

              {/* order slip landing on the bench + ripples */}
              <ellipse ref={r("rip0")} cx={TK_X - 2} cy="80" rx="6" ry="1.3" fill="none" stroke="#c9a45c" strokeWidth="1.2" opacity="0" />
              <ellipse ref={r("rip1")} cx={TK_X - 2} cy="80" rx="6" ry="1.3" fill="none" stroke="#c9a45c" strokeWidth="1" opacity="0" />
              <g ref={r("ticket")} opacity="0"><Ticket /></g>

              {/* wallet being made */}
              <g ref={r("wallet")} opacity="0">
                <Wallet r={r} />
              </g>
              <ellipse ref={r("glow")} cx={WX + 6} cy="70" rx="44" ry="26" fill="url(#wkGlow)" opacity="0" />
              <g ref={r("badge")} opacity="0">
                <circle r="9" fill="#2f6b3b" />
                <path d="M-4 0.5 L-1.2 3.3 L4.2 -3" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </g>

              {/* tool bag */}
              <g ref={r("bag")}><Bag r={r} /></g>

              {/* ---- the artisan ---- */}
              <g ref={r("fig")}>
                <ellipse ref={r("shadow")} cx="0" cy="1.5" rx="16" ry="2.8" fill="#2a170a" opacity=".3" />
                <Leg k="F" r={r} />
                <Leg k="N" r={r} />
                <g ref={r("torso")}>
                  <Arm k="F" r={r} />
                  <Torso r={r} />
                  <Arm k="N" r={r} />
                </g>
              </g>
            </svg>
          </div>

          {/* progress flow */}
          <div className="relative mb-1">
            <span aria-hidden="true" className="absolute left-[28px] right-[28px] top-[20px] h-[3px] rounded-full bg-line sm:left-[34px] sm:right-[34px] sm:top-[22px]" />
            <span
              aria-hidden="true"
              className="absolute left-[28px] right-[28px] top-[20px] h-[3px] origin-left rounded-full bg-gradient-to-r from-gold-dark to-gold transition-transform duration-700 ease-out sm:left-[34px] sm:right-[34px] sm:top-[22px]"
              style={{ transform: `scaleX(${stage / (STEPS.length - 1)})` }}
            />
            <ol className="relative m-0 flex list-none items-start justify-between p-0">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const doneStep = i < stage;
                const active = i === stage;
                return (
                  <li key={s.short} aria-current={active ? "step" : undefined} className="flex w-[56px] flex-col items-center gap-2 sm:w-[68px]">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-full border transition-all duration-500 ease-out sm:h-11 sm:w-11 ${
                        active
                          ? "ov-pop border-gold bg-brown text-[#f3ebe0] shadow-[0_0_0_5px_rgba(201,164,92,.18)]"
                          : doneStep
                            ? "border-gold bg-gold text-ink"
                            : "border-line bg-white text-muted/70"
                      }`}
                    >
                      <Icon size={17} />
                    </span>
                    <span
                      className={`text-center text-[9px] font-semibold uppercase leading-tight tracking-wide transition-colors duration-500 sm:text-[10px] ${
                        active ? "text-ink" : doneStep ? "text-muted" : "text-muted/70"
                      }`}
                    >
                      {s.short}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <button
            type="button"
            onClick={() => closeRef.current?.()}
            className="mt-5 rounded-full border border-line px-5 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted transition-colors hover:border-ink hover:text-ink"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================== art ================== */

function Defs() {
  const g = (id, a, b, vertical) => (
    <linearGradient id={id} x1="0" y1="0" x2={vertical ? "0" : "1"} y2={vertical ? "1" : "0"}>
      <stop offset="0" stopColor={a} />
      <stop offset="1" stopColor={b} />
    </linearGradient>
  );
  return (
    <defs>
      {g("wkShirt", "#93a8bb", "#5b7085")}
      {g("wkShirtF", "#6f8396", "#485968")}
      {g("wkPants", "#4d4844", "#2a2725")}
      {g("wkPantsF", "#38332f", "#211f1d")}
      {g("wkSkin", "#d9a274", "#b67a50")}
      {g("wkSkinF", "#b98058", "#91603e")}
      {g("wkApron", "#9a6532", "#5c3719")}
      {g("wkLeather", "#946034", "#583418")}
      {g("wkBag", "#74492a", "#3d2712")}
      {g("wkWood", "#b0824f", "#7a5231", true)}
      {g("wkWall", "#e9dbbf", "#d1bb95", true)}
      {g("wkFloor", "#c8ae86", "#a58860", true)}
      {g("wkSky", "#f7efd8", "#dbe8ee", true)}
      <linearGradient id="wkBeam" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff8e0" stopOpacity=".42" />
        <stop offset="1" stopColor="#fff8e0" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="wkGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#f3d68a" stopOpacity=".7" />
        <stop offset="1" stopColor="#f3d68a" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/* capsule limb segment, hinged at (0,0), running down to (0,l) */
const Cap = ({ w, l, fill }) => <rect x={-w / 2} y={-w / 2} width={w} height={l + w} rx={w / 2} fill={fill} />;

function Leg({ k, r }) {
  const far = k === "F";
  return (
    <g ref={r(`leg${k}a`)}>
      <Cap w={8.2} l={L1} fill={far ? "url(#wkPantsF)" : "url(#wkPants)"} />
      <g ref={r(`leg${k}b`)}>
        <Cap w={6.8} l={L2} fill={far ? "url(#wkPantsF)" : "url(#wkPants)"} />
        <g ref={r(`leg${k}c`)}>
          <path d="M-4 -1 H8.5 Q12 -1 12 3 V5.2 H-4 Z" fill={far ? "#1c130c" : "#2c1b0f"} />
          <path d="M-4 4.4 H12" stroke="#0e0906" strokeWidth="1" opacity=".7" />
        </g>
      </g>
    </g>
  );
}

function Arm({ k, r }) {
  const far = k === "F";
  return (
    <g ref={r(`arm${k}a`)}>
      <Cap w={5.8} l={AU} fill={far ? "url(#wkShirtF)" : "url(#wkShirt)"} />
      <g ref={r(`arm${k}b`)}>
        <Cap w={4.5} l={AF} fill={far ? "url(#wkSkinF)" : "url(#wkSkin)"} />
        <circle cx="0" cy={AF + 1.6} r="2.8" fill={far ? "url(#wkSkinF)" : "url(#wkSkin)"} />
        {!far && (
          <g ref={r("mallet")} opacity="0" transform={`translate(0,${AF + 1})`}>
            <rect x="-1.3" y="-3" width="2.6" height="16" rx="1.1" fill="#6c4525" />
            <rect x="-6.5" y="10.5" width="13" height="6.4" rx="1.6" fill="#3a2a1d" />
          </g>
        )}
      </g>
    </g>
  );
}

function Torso({ r }) {
  return (
    <g>
      {/* shirt */}
      <path d="M-7.6 0 L7.6 0 Q8.8 -12 7.4 -24 Q0 -28 -7.4 -24 Q-8.9 -12 -7.6 0 Z" fill="url(#wkShirt)" />
      {/* leather apron */}
      <path d="M0.6 -21 Q5 -23 7.6 -20 L8.2 0 L0.6 0 Z" fill="url(#wkApron)" />
      <path d="M2 -14 H7.6" stroke="#3b2311" strokeWidth=".7" opacity=".55" />
      {/* bag strap over the shoulder */}
      <path ref={r("strap")} d="M-3 -25 L-8 -6" stroke="#2f1d0e" strokeWidth="2.6" strokeLinecap="round" opacity="0" />
      {/* neck + head */}
      <g ref={r("head")}>
        <rect x="-2.7" y="-6" width="5.4" height="8" fill="url(#wkSkin)" />
        <ellipse cx="2" cy="-13" rx="6.6" ry="7.6" fill="url(#wkSkin)" />
        <path d="M8 -14 q2.7 1.7 0.5 3.5 q-1.6 0.4 -2.2 -0.6 z" fill="#c78d61" />
        <ellipse cx="0" cy="-12.6" rx="1.6" ry="2.4" fill="#b67a50" />
        <path d="M-4.7 -13 Q-5 -21.4 2 -21.5 Q8.6 -21 8.7 -15.6 Q4.5 -18.6 -1.5 -16 Q-3.6 -14 -4.7 -13 Z" fill="#1f140d" />
        <path d="M4 -16.3 L7.2 -16" stroke="#1f140d" strokeWidth=".9" strokeLinecap="round" />
        <ellipse ref={r("eye")} cx="5.5" cy="-14" rx=".95" ry="1" fill="#1a1512" />
        <path d="M6.4 -10.2 Q8.6 -10.8 9.6 -9.6" stroke="#1f140d" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <path ref={r("mouth")} d="M4.2 -8.6 Q6.2 -7.5 8.2 -9" stroke="#6b3a2a" strokeWidth=".9" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Bag({ r }) {
  return (
    <g>
      <path d="M-6 -20 Q0 -29 6 -20" stroke="#2f1d0e" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="-12" y="-20" width="24" height="20" rx="4" fill="url(#wkBag)" />
      <path d="M-12 -13 H12" stroke="#c9a45c" strokeWidth=".9" strokeDasharray="2 1.6" opacity=".8" />
      <rect x="-2.2" y="-16" width="4.4" height="6" rx="1" fill="#c9a45c" />
      <path d="M-12 -2 H12" stroke="#2a1809" strokeWidth="1.2" opacity=".4" />
    </g>
  );
}

function Bench() {
  return (
    <g>
      {/* legs + shadowed underside */}
      <rect x="176" y="88" width="7" height="30" fill="#5e3f24" />
      <rect x="269" y="88" width="7" height="30" fill="#5e3f24" />
      <rect x="183" y="100" width="86" height="3" fill="#4a3019" opacity=".7" />
      {/* drawer */}
      <rect x="196" y="88" width="56" height="12" rx="1.5" fill="#8d6238" />
      <rect x="219" y="93" width="10" height="2.4" rx="1.2" fill="#3b2a1d" />
      {/* top slab */}
      <rect x="170" y="82" width="112" height="7" rx="1.5" fill="url(#wkWood)" />
      <rect x="170" y="82" width="112" height="1.8" rx=".9" fill="#c9a06c" />
      <path d="M176 86 H262 M190 84.5 H240" stroke="#5e3f24" strokeWidth=".5" opacity=".45" />
      {/* leather roll */}
      <rect x="270" y="68" width="12" height="14" rx="6" fill="url(#wkLeather)" />
      <ellipse cx="276" cy="68" rx="6" ry="2" fill="#a06b3d" />
    </g>
  );
}

function Ticket() {
  return (
    <g>
      <path d="M-13 0 H13 L17 -6 H-9 Z" fill="#fbf7ea" stroke="#cbbf9f" strokeWidth=".6" />
      <path d="M-6 -1.6 H8 M-4 -3.4 H10" stroke="#8a7f66" strokeWidth=".7" strokeLinecap="round" />
      <circle cx="11" cy="-3" r="1.5" fill="#c9a45c" />
    </g>
  );
}

/* wallet lying on the bench (3/4 view): stitches appear left -> right through a clip */
function Wallet({ r }) {
  return (
    <g>
      <clipPath id="wkClip"><rect ref={r("clip")} x="-32" y="-14" width="0" height="20" /></clipPath>
      {/* thickness */}
      <rect x="-24" y="-1" width="48" height="3.4" rx="1" fill="#3f2411" />
      {/* top face */}
      <path d="M-24 0 H24 L34 -9 H-14 Z" fill="url(#wkLeather)" />
      <path d="M-24 0 H24" stroke="#b98450" strokeWidth=".7" opacity=".7" />
      {/* stitching */}
      <path
        clipPath="url(#wkClip)"
        d="M-20 -1.6 H20.4 L28 -7.4 H-11.6 Z"
        fill="none" stroke="#efd8a0" strokeWidth=".9" strokeDasharray="2 1.5" strokeLinecap="round"
      />
      {/* snap clasp appears when finished */}
      <circle ref={r("clasp")} cx="27" cy="-4.6" r="1.7" fill="#c9a45c" opacity="0" />
    </g>
  );
}