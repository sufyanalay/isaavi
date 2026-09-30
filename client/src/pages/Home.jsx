import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Banknote, PackageOpen, Truck } from "lucide-react";
import api from "../api";
import Section from "../components/Section";
import Offers from "../components/Offers";
import Reveal from "../components/Reveal";

export default function Home() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get("/settings").then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  return (
    <div>
   <section className="relative flex min-h-[460px] items-center overflow-hidden sm:min-h-[540px] lg:min-h-[600px]">
  <video
    autoPlay
    muted
    loop
    playsInline
    className="absolute inset-0 h-full w-full object-cover"
  >
    <source src="/vedio.mp4" type="video/mp4" />
  </video>
  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/45 to-ink/15" />

  <div className="shell relative w-full py-14 text-[#f6efe6] sm:py-16 lg:py-20">
    <Reveal>
      <div className="text-[10px] font-semibold uppercase tracking-[.24em] text-[#d8c9a8]">
        Handmade in Sialkot · Full-grain leather
      </div>
      <h1 className="mt-5 max-w-[16ch] font-serif text-[40px] font-normal leading-[1.03] tracking-[-.02em] text-white sm:text-[62px] lg:text-[74px]">
        Leather goods worth keeping.
      </h1>
      <p className="mt-5 max-w-[480px] text-[15px] leading-relaxed text-[#e6d9c6] sm:text-[16px]">
        Belts, wallets and bags cut and stitched by hand — delivered anywhere in Pakistan with cash on delivery.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link to="/for-him" className="btn btn-light">
          Shop the collection <ArrowRight size={14} />
        </Link>
        <Link to="/custom-order" className="btn border border-white/35 text-[#f6efe6] hover:bg-white/10">
          Custom order
        </Link>
      </div>

      <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#d8c9a8]">
        <span className="inline-flex items-center gap-2"><Banknote size={13} /> Cash on delivery</span>
        <span className="inline-flex items-center gap-2"><PackageOpen size={13} /> Open before you pay</span>
        <span className="inline-flex items-center gap-2"><Truck size={13} /> Nationwide delivery</span>
      </div>
    </Reveal>
  </div>
</section>

      {/* ---------- offers (codes social media se milte hain, yahan show nahi hote) ---------- */}
      <Offers />

      {/* ---------- catalogue: real product images, ten pieces from each edit ---------- */}
      <div className="shell py-16 sm:py-24">
        <div className="catalogue-edits">
          <Section section="him" limit={10} index="01" />
          <Section section="her" limit={10} index="02" />
          <Section section="gift" limit={10} index="03" />
        </div>
      </div>

      {/* ---------- custom order band ---------- */}
      <section className="shell pb-4 sm:pb-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[22px] bg-ink px-6 py-14 text-center text-[#f3ebe0] sm:px-12 sm:py-20">
            <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-brown/60 blur-3xl" />
            <div className="relative mx-auto max-w-[620px]">
              <div className="text-[10px] font-semibold uppercase tracking-[.24em] text-[#d8c9a8]">Made only for you</div>
              <h2 className="mt-4 mb-0 font-serif text-[32px] font-normal leading-tight text-white sm:text-[46px]">
                Have something else in mind?
              </h2>
              <p className="mx-auto mt-4 mb-0 max-w-[520px] text-[14.5px] leading-relaxed text-[#cbbb9f]">
                Laptop bags, school bags, jackets or a one-off piece. Send your idea and our team confirms the price and
                timeline before any work starts — no advance payment, cash on delivery.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link to="/custom-order" className="btn btn-light">
                  Start a custom order <ArrowRight size={14} />
                </Link>
                <Link to="/gift-packs" className="btn border border-white/30 text-[#f6efe6] hover:bg-white/10">
                  See gift packs
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
