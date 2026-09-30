import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingBag, ImageOff, Check, Banknote, PackageOpen, Truck, Hammer, ChevronRight } from "lucide-react";
import api from "../api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";
import { swatchOf } from "../colors";

const ASSURANCES = [
  [Banknote, "Cash on delivery", "Pay the courier in cash once your parcel arrives."],
  [PackageOpen, "Open before you pay", "Inspect the piece at your door — no obligation to keep it."],
  [Hammer, "Handmade in Sialkot", "Cut, stitched and burnished by our artisans."],
  [Truck, "Nationwide delivery", "Dispatched within 2–3 working days of confirmation."],
];

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [color, setColor] = useState("");
  const [leatherType, setLeatherType] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [open, setOpen] = useState("details");

  useEffect(() => {
    let active = true;
    api.get(`/products/${slug}`)
      .then((r) => {
        if (!active) return;
        const p = r.data;
        setProduct(p);
        setColor(p.colors?.[0] || "");
        setLeatherType(p.leatherTypes?.[0] || "");
        setActiveImg(0);
        setImgError(false);
        setQty(1);
        setRelated([]);

        const section = p.sections?.[0];
        if (!section) return;
        api.get(`/products?section=${section}`)
          .then((res) => {
            if (!active) return;
            const list = Array.isArray(res.data) ? res.data : [];
            setRelated(list.filter((x) => x._id !== p._id).slice(0, 4));
          })
          .catch(() => {});
      })
      .catch(() => { if (active) setProduct(null); });
    return () => { active = false; };
  }, [slug]);

  // stale product from a previous slug never renders, so no reset effect is needed
  if (!product || product.slug !== slug)
    return (
      <main className="shell py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="skeleton aspect-[4/5] rounded-[20px]" />
          <div className="space-y-4">
            <div className="skeleton h-3 w-24 rounded-full" />
            <div className="skeleton h-9 w-3/4 rounded-full" />
            <div className="skeleton h-5 w-28 rounded-full" />
            <div className="skeleton h-28 w-full rounded-2xl" />
            <div className="skeleton h-12 w-full rounded-sm" />
          </div>
        </div>
      </main>
    );

  const soldOut = product.inStock === false;

  const handleAdd = () => {
    if (soldOut) return;
    addToCart(product, { color, leatherType, qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const hasImage = product.images?.[activeImg]?.url && !imgError;

  return (
    <main className="pb-16 sm:pb-24">
      <div className="shell pt-7">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
          <Link to="/" className="link-gold no-underline">Home</Link>
          <span aria-hidden="true">/</span>
          <Link
            to={product.sections?.[0] === "her" ? "/for-her" : product.sections?.[0] === "gift" ? "/gift-packs" : "/for-him"}
            className="link-gold no-underline"
          >
            {product.sections?.[0] === "her" ? "For Her" : product.sections?.[0] === "gift" ? "Gift Packs" : "For Him"}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="break-anywhere text-ink">{product.name}</span>
        </nav>
      </div>

      <div className="shell grid grid-cols-1 gap-10 pt-8 sm:pt-10 lg:grid-cols-2 lg:gap-14">
        {/* ---------- gallery ---------- */}
        <Reveal>
          <div className="group relative aspect-[4/5] overflow-hidden rounded-[20px] border border-line bg-gradient-to-br from-[#f7f1e2] to-[#ece0c5]">
            {hasImage ? (
              <img
                src={product.images[activeImg].url}
                alt={product.name}
                onError={() => setImgError(true)}
                className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.22,.9,.25,1)] group-hover:scale-[1.04]"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#b3a48f]">
                <ImageOff size={24} />
                <span className="text-[10px] uppercase tracking-[.16em]">No image</span>
              </div>
            )}
            {soldOut && (
              <span className="absolute left-4 top-4 rounded-full bg-bg/95 px-4 py-1.5 text-[9px] font-semibold uppercase tracking-[.2em] text-muted">
                Sold out
              </span>
            )}
          </div>

          {product.images?.length > 1 && (
            <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={img.publicId}
                  type="button"
                  onClick={() => { setActiveImg(i); setImgError(false); }}
                  aria-label={`View image ${i + 1}`}
                  className={`h-[68px] w-[68px] shrink-0 overflow-hidden rounded-lg bg-[#f3ead6] p-0 transition-all duration-300 ${
                    i === activeImg ? "ring-2 ring-ink" : "ring-1 ring-line hover:ring-gold"
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </Reveal>

        {/* ---------- buy box ---------- */}
        <Reveal delay={100}>
          <div className="lg:sticky lg:top-24">
            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              <span className="font-semibold uppercase tracking-[.2em] text-muted">{product.type}</span>
              {product.customizable && (
                <>
                  <span aria-hidden="true" className="text-line">·</span>
                  <span className="font-semibold uppercase tracking-[.2em] text-gold-dark">Customisable</span>
                </>
              )}
            </div>

            <h1 className="mb-0 mt-3 font-serif text-[30px] font-normal leading-[1.08] sm:text-[40px]">{product.name}</h1>

            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="text-[24px] font-semibold tabular-nums sm:text-[26px]">Rs. {product.price.toLocaleString()}</span>
              {product.comparePrice > product.price && (
                <>
                  <span className="text-[15px] text-muted line-through tabular-nums">
                    Rs. {product.comparePrice.toLocaleString()}
                  </span>
                  <span className="rounded-full bg-ink px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[.16em] text-[#f7f2e8]">
                    Save {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {product.description && <p className="lede mt-5 max-w-[520px]">{product.description}</p>}

            <div className="mt-7 border-t border-line pt-6">

          {product.colors?.length > 0 && (
            <label className="block mb-3.5">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[.18em] text-muted">Colour</span>
              <select value={color} onChange={(e) => setColor(e.target.value)} className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-base focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 sm:text-sm">
                {product.colors.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
          )}

          {product.leatherTypes?.length > 0 && (
            <label className="block mb-3.5">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[.18em] text-muted">Leather type</span>
              <select value={leatherType} onChange={(e) => setLeatherType(e.target.value)} className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-base focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 sm:text-sm">
                {product.leatherTypes.map((l) => <option key={l}>{l}</option>)}
              </select>
            </label>
          )}

          <label className="block mb-5">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[.18em] text-muted">Quantity</span>
            <div className="inline-flex items-center overflow-hidden rounded-full border border-line bg-white">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity" className="grid h-10 w-10 place-items-center text-ink/75 transition-colors hover:bg-[#f1e9d8] disabled:text-muted/60 disabled:hover:bg-transparent">−</button>
              <span className="w-10 text-center text-sm font-semibold tabular-nums">{qty}</span>
              <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity" className="grid h-10 w-10 place-items-center text-ink/75 transition-colors hover:bg-[#f1e9d8]">+</button>
            </div>
          </label>

          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-brown py-3.5 text-xs font-semibold uppercase tracking-wide text-[#f3ebe0] transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingBag size={14} /> {soldOut ? "Out of stock" : added ? "Added ✓" : "Add to cart"}
          </button>

          <div className="mt-3.5 text-xs leading-relaxed text-muted">
            Design: {product.design} · Handmade in Sialkot · Cash on Delivery
          </div>
        </div>
      </div>
    </main>
  );
}




































// import { useEffect, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import {
//   ShoppingBag,
//   ImageOff,
//   Check,
//   Banknote,
//   PackageOpen,
//   Truck,
//   Hammer,
//   ChevronRight,
// } from "lucide-react";

// import api from "../api";
// import { useCart } from "../context/CartContext";
// import ProductCard from "../components/ProductCard";
// import Reveal from "../components/Reveal";

// const ASSURANCES = [
//   [
//     Banknote,
//     "Cash on delivery",
//     "Pay the courier in cash once your parcel arrives.",
//   ],
//   [
//     PackageOpen,
//     "Open before you pay",
//     "Inspect the piece at your door — no obligation to keep it.",
//   ],
//   [
//     Hammer,
//     "Handmade in Sialkot",
//     "Cut, stitched and burnished by our artisans.",
//   ],
//   [
//     Truck,
//     "Nationwide delivery",
//     "Dispatched within 2–3 working days of confirmation.",
//   ],
// ];

// export default function ProductDetail() {
//   const { slug } = useParams();
//   const { addToCart } = useCart();

//   const [product, setProduct] = useState(null);
//   const [related, setRelated] = useState([]);

//   const [activeImg, setActiveImg] = useState(0);
//   const [imgError, setImgError] = useState(false);

//   const [color, setColor] = useState("");
//   const [leatherType, setLeatherType] = useState("");
//   const [qty, setQty] = useState(1);

//   const [added, setAdded] = useState(false);
//   const [open, setOpen] = useState("details");

//   useEffect(() => {
//     let active = true;

//     // Reset related/product state when slug changes
//     setProduct(null);
//     setRelated([]);
//     setActiveImg(0);
//     setImgError(false);
//     setQty(1);
//     setAdded(false);

//     api
//       .get(`/products/${slug}`)
//       .then((r) => {
//         if (!active) return;

//         const p = r.data;

//         setProduct(p);
//         setColor(p.colors?.[0] || "");
//         setLeatherType(p.leatherTypes?.[0] || "");
//         setActiveImg(0);
//         setImgError(false);
//         setQty(1);

//         const section = p.sections?.[0];

//         if (!section) return;

//         api
//           .get(`/products?section=${encodeURIComponent(section)}`)
//           .then((res) => {
//             if (!active) return;

//             const list = Array.isArray(res.data)
//               ? res.data
//               : Array.isArray(res.data?.products)
//               ? res.data.products
//               : [];

//             setRelated(
//               list
//                 .filter((x) => x._id !== p._id)
//                 .slice(0, 4)
//             );
//           })
//           .catch(() => {
//             if (active) setRelated([]);
//           });
//       })
//       .catch(() => {
//         if (active) {
//           setProduct(null);
//           setRelated([]);
//         }
//       });

//     return () => {
//       active = false;
//     };
//   }, [slug]);

//   // Loading / invalid product state
//   if (!product || product.slug !== slug) {
//     return (
//       <main className="shell py-12 sm:py-16">
//         <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
//           <div className="skeleton aspect-[4/5] rounded-[20px]" />

//           <div className="space-y-4">
//             <div className="skeleton h-3 w-24 rounded-full" />
//             <div className="skeleton h-9 w-3/4 rounded-full" />
//             <div className="skeleton h-5 w-28 rounded-full" />
//             <div className="skeleton h-28 w-full rounded-2xl" />
//             <div className="skeleton h-12 w-full rounded-sm" />
//             <div className="skeleton h-12 w-full rounded-sm" />
//           </div>
//         </div>
//       </main>
//     );
//   }

//   const soldOut = product.inStock === false;

//   const images = Array.isArray(product.images) ? product.images : [];

//   const safeActiveImg =
//     activeImg >= 0 && activeImg < images.length ? activeImg : 0;

//   const hasImage =
//     Boolean(images[safeActiveImg]?.url) && !imgError;

//   const discount =
//     product.comparePrice > product.price
//       ? Math.round(
//           ((product.comparePrice - product.price) /
//             product.comparePrice) *
//             100
//         )
//       : 0;

//   const toggleSection = (section) => {
//     setOpen((current) => (current === section ? "" : section));
//   };

//   const handleAdd = () => {
//     if (soldOut) return;

//     addToCart(product, {
//       color,
//       leatherType,
//       qty,
//     });

//     setAdded(true);

//     setTimeout(() => {
//       setAdded(false);
//     }, 1800);
//   };

//   const getSectionLabel = () => {
//     const section = product.sections?.[0];

//     if (section === "her") return "For Her";
//     if (section === "gift") return "Gift Packs";

//     return "For Him";
//   };

//   const getSectionPath = () => {
//     const section = product.sections?.[0];

//     if (section === "her") return "/for-her";
//     if (section === "gift") return "/gift-packs";

//     return "/for-him";
//   };

//   return (
//     <main className="pb-16 sm:pb-24">
//       {/* =========================
//           BREADCRUMB
//       ========================== */}
//       <div className="shell pt-7">
//         <nav
//           aria-label="Breadcrumb"
//           className="flex flex-wrap items-center gap-2 text-[11px] text-muted"
//         >
//           <Link
//             to="/"
//             className="link-gold no-underline"
//           >
//             Home
//           </Link>

//           <span aria-hidden="true">/</span>

//           <Link
//             to={getSectionPath()}
//             className="link-gold no-underline"
//           >
//             {getSectionLabel()}
//           </Link>

//           <span aria-hidden="true">/</span>

//           <span className="break-anywhere text-ink">
//             {product.name}
//           </span>
//         </nav>
//       </div>

//       {/* =========================
//           PRODUCT HERO
//       ========================== */}
//       <div className="shell grid grid-cols-1 gap-10 pt-8 sm:pt-10 lg:grid-cols-2 lg:gap-14">
//         {/* =========================
//             GALLERY
//         ========================== */}
//         <Reveal>
//           <div>
//             <div className="group relative aspect-[4/5] overflow-hidden rounded-[20px] border border-line bg-gradient-to-br from-[#f7f1e2] to-[#ece0c5]">
//               {hasImage ? (
//                 <img
//                   src={images[safeActiveImg].url}
//                   alt={product.name}
//                   onError={() => setImgError(true)}
//                   className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.22,.9,.25,1)] group-hover:scale-[1.04]"
//                 />
//               ) : (
//                 <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#b3a48f]">
//                   <ImageOff size={24} />

//                   <span className="text-[10px] uppercase tracking-[.16em]">
//                     No image
//                   </span>
//                 </div>
//               )}

//               {soldOut && (
//                 <span className="absolute left-4 top-4 rounded-full bg-bg/95 px-4 py-1.5 text-[9px] font-semibold uppercase tracking-[.2em] text-muted">
//                   Sold out
//                 </span>
//               )}

//               {discount > 0 && !soldOut && (
//                 <span className="absolute right-4 top-4 rounded-full bg-ink px-4 py-1.5 text-[9px] font-semibold uppercase tracking-[.18em] text-[#f7f2e8]">
//                   -{discount}%
//                 </span>
//               )}
//             </div>

//             {/* Thumbnail gallery */}
//             {images.length > 1 && (
//               <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
//                 {images.map((img, i) => (
//                   <button
//                     key={img.publicId || img.url || i}
//                     type="button"
//                     onClick={() => {
//                       setActiveImg(i);
//                       setImgError(false);
//                     }}
//                     aria-label={`View image ${i + 1}`}
//                     className={`h-[68px] w-[68px] shrink-0 overflow-hidden rounded-lg bg-[#f3ead6] p-0 transition-all duration-300 ${
//                       i === safeActiveImg
//                         ? "ring-2 ring-ink"
//                         : "ring-1 ring-line hover:ring-gold"
//                     }`}
//                   >
//                     <img
//                       src={img.url}
//                       alt=""
//                       className="h-full w-full object-cover"
//                       onError={(e) => {
//                         e.currentTarget.style.opacity = "0.4";
//                       }}
//                     />
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         </Reveal>

//         {/* =========================
//             BUY BOX
//         ========================== */}
//         <Reveal delay={100}>
//           <div className="lg:sticky lg:top-24">
//             {/* Product type */}
//             <div className="flex flex-wrap items-center gap-2 text-[10px]">
//               {product.type && (
//                 <span className="font-semibold uppercase tracking-[.2em] text-muted">
//                   {product.type}
//                 </span>
//               )}

//               {product.customizable && (
//                 <>
//                   <span
//                     aria-hidden="true"
//                     className="text-line"
//                   >
//                     ·
//                   </span>

//                   <span className="font-semibold uppercase tracking-[.2em] text-gold-dark">
//                     Customisable
//                   </span>
//                 </>
//               )}
//             </div>

//             {/* Product name */}
//             <h1 className="mb-0 mt-3 font-serif text-[30px] font-normal leading-[1.08] sm:text-[40px]">
//               {product.name}
//             </h1>

//             {/* Price */}
//             <div className="mt-4 flex flex-wrap items-baseline gap-3">
//               <span className="text-[24px] font-semibold tabular-nums sm:text-[26px]">
//                 Rs.{" "}
//                 {Number(product.price || 0).toLocaleString()}
//               </span>

//               {product.comparePrice > product.price && (
//                 <>
//                   <span className="text-[15px] text-muted line-through tabular-nums">
//                     Rs.{" "}
//                     {Number(
//                       product.comparePrice
//                     ).toLocaleString()}
//                   </span>

//                   <span className="rounded-full bg-ink px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[.16em] text-[#f7f2e8]">
//                     Save {discount}%
//                   </span>
//                 </>
//               )}
//             </div>

//             {/* Description */}
//             {product.description && (
//               <p className="lede mt-5 max-w-[520px]">
//                 {product.description}
//               </p>
//             )}

//             {/* =========================
//                 OPTIONS
//             ========================== */}
//             <div className="mt-7 border-t border-line pt-6">
//               {/* Colour */}
//               {product.colors?.length > 0 && (
//                 <label className="mb-3.5 block">
//                   <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[.18em] text-muted">
//                     Colour
//                   </span>

//                   <select
//                     value={color}
//                     onChange={(e) => setColor(e.target.value)}
//                     className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-base focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 sm:text-sm"
//                   >
//                     {product.colors.map((c) => (
//                       <option key={c} value={c}>
//                         {c}
//                       </option>
//                     ))}
//                   </select>
//                 </label>
//               )}

//               {/* Leather type */}
//               {product.leatherTypes?.length > 0 && (
//                 <label className="mb-3.5 block">
//                   <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[.18em] text-muted">
//                     Leather type
//                   </span>

//                   <select
//                     value={leatherType}
//                     onChange={(e) =>
//                       setLeatherType(e.target.value)
//                     }
//                     className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-base focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 sm:text-sm"
//                   >
//                     {product.leatherTypes.map((l) => (
//                       <option key={l} value={l}>
//                         {l}
//                       </option>
//                     ))}
//                   </select>
//                 </label>
//               )}

//               {/* Quantity */}
//               <label className="mb-5 block">
//                 <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[.18em] text-muted">
//                   Quantity
//                 </span>

//                 <div className="inline-flex items-center overflow-hidden rounded-full border border-line bg-white">
//                   <button
//                     type="button"
//                     onClick={() =>
//                       setQty((q) => Math.max(1, q - 1))
//                     }
//                     disabled={qty <= 1}
//                     aria-label="Decrease quantity"
//                     className="grid h-10 w-10 place-items-center text-ink/75 transition-colors hover:bg-[#f1e9d8] disabled:text-muted/60 disabled:hover:bg-transparent"
//                   >
//                     −
//                   </button>

//                   <span className="w-10 text-center text-sm font-semibold tabular-nums">
//                     {qty}
//                   </span>

//                   <button
//                     type="button"
//                     onClick={() =>
//                       setQty((q) => q + 1)
//                     }
//                     aria-label="Increase quantity"
//                     className="grid h-10 w-10 place-items-center text-ink/75 transition-colors hover:bg-[#f1e9d8]"
//                   >
//                     +
//                   </button>
//                 </div>
//               </label>

//               {/* Add to cart */}
//               <button
//                 type="button"
//                 onClick={handleAdd}
//                 disabled={soldOut}
//                 className="flex w-full items-center justify-center gap-2 rounded-sm bg-brown py-3.5 text-xs font-semibold uppercase tracking-wide text-[#f3ebe0] transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
//               >
//                 {added ? (
//                   <>
//                     <Check size={15} />
//                     Added to cart
//                   </>
//                 ) : (
//                   <>
//                     <ShoppingBag size={14} />
//                     {soldOut ? "Out of stock" : "Add to cart"}
//                   </>
//                 )}
//               </button>

//               {/* Small product info */}
//               <div className="mt-3.5 text-xs leading-relaxed text-muted">
//                 {product.design && (
//                   <>
//                     Design: {product.design} ·{" "}
//                   </>
//                 )}
//                 Handmade in Sialkot · Cash on Delivery
//               </div>
//             </div>

//             {/* =========================
//                 ASSURANCES
//             ========================== */}
//             <div className="mt-8 grid grid-cols-1 gap-3 border-y border-line py-6 sm:grid-cols-2">
//               {ASSURANCES.map(
//                 ([Icon, title, description]) => (
//                   <div
//                     key={title}
//                     className="flex gap-3"
//                   >
//                     <div className="mt-0.5 shrink-0">
//                       <Icon
//                         size={17}
//                         strokeWidth={1.5}
//                         className="text-gold-dark"
//                       />
//                     </div>

//                     <div>
//                       <h3 className="text-[11px] font-semibold uppercase tracking-[.12em] text-ink">
//                         {title}
//                       </h3>

//                       <p className="mt-1 text-[11px] leading-relaxed text-muted">
//                         {description}
//                       </p>
//                     </div>
//                   </div>
//                 )
//               )}
//             </div>
//           </div>
//         </Reveal>
//       </div>

//       {/* =========================
//           PRODUCT DETAILS
//       ========================== */}
//       <Reveal>
//         <section className="shell mt-16 sm:mt-20">
//           <div className="max-w-3xl border-t border-line">
//             {/* Details */}
//             <button
//               type="button"
//               onClick={() => toggleSection("details")}
//               className="flex w-full items-center justify-between border-b border-line py-5 text-left"
//             >
//               <span className="font-serif text-xl">
//                 Product details
//               </span>

//               <ChevronRight
//                 size={18}
//                 className={`transition-transform duration-300 ${
//                   open === "details"
//                     ? "rotate-90"
//                     : ""
//                 }`}
//               />
//             </button>

//             {open === "details" && (
//               <div className="border-b border-line py-5 text-sm leading-7 text-muted">
//                 {product.details ? (
//                   <p className="whitespace-pre-line">
//                     {product.details}
//                   </p>
//                 ) : (
//                   <div className="space-y-3">
//                     {product.material && (
//                       <p>
//                         <span className="font-medium text-ink">
//                           Material:
//                         </span>{" "}
//                         {product.material}
//                       </p>
//                     )}

//                     {product.leatherTypes?.length > 0 && (
//                       <p>
//                         <span className="font-medium text-ink">
//                           Leather:
//                         </span>{" "}
//                         {product.leatherTypes.join(", ")}
//                       </p>
//                     )}

//                     {product.colors?.length > 0 && (
//                       <p>
//                         <span className="font-medium text-ink">
//                           Available colours:
//                         </span>{" "}
//                         {product.colors.join(", ")}
//                       </p>
//                     )}

//                     <p>
//                       <span className="font-medium text-ink">
//                         Origin:
//                       </span>{" "}
//                       Handmade in Sialkot, Pakistan.
//                     </p>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Care */}
//             <button
//               type="button"
//               onClick={() => toggleSection("care")}
//               className="flex w-full items-center justify-between border-b border-line py-5 text-left"
//             >
//               <span className="font-serif text-xl">
//                 Care & craftsmanship
//               </span>

//               <ChevronRight
//                 size={18}
//                 className={`transition-transform duration-300 ${
//                   open === "care"
//                     ? "rotate-90"
//                     : ""
//                 }`}
//               />
//             </button>

//             {open === "care" && (
//               <div className="border-b border-line py-5 text-sm leading-7 text-muted">
//                 <p>
//                   Your Isaavi leather piece is made to age
//                   beautifully. Keep it away from prolonged
//                   moisture and direct heat. Store it in a
//                   cool, dry place and allow the natural
//                   leather grain to develop its character over
//                   time.
//                 </p>
//               </div>
//             )}

//             {/* Shipping */}
//             <button
//               type="button"
//               onClick={() => toggleSection("shipping")}
//               className="flex w-full items-center justify-between border-b border-line py-5 text-left"
//             >
//               <span className="font-serif text-xl">
//                 Delivery & payment
//               </span>

//               <ChevronRight
//                 size={18}
//                 className={`transition-transform duration-300 ${
//                   open === "shipping"
//                     ? "rotate-90"
//                     : ""
//                 }`}
//               />
//             </button>

//             {open === "shipping" && (
//               <div className="border-b border-line py-5 text-sm leading-7 text-muted">
//                 <p>
//                   We offer Cash on Delivery across Pakistan.
//                   Orders are generally dispatched within 2–3
//                   working days after confirmation.
//                 </p>

//                 <p className="mt-3">
//                   You may inspect your parcel at the door
//                   before making payment, according to the
//                   available courier service.
//                 </p>
//               </div>
//             )}
//           </div>
//         </section>
//       </Reveal>

//       {/* =========================
//           RELATED PRODUCTS
//       ========================== */}
//       {related.length > 0 && (
//         <Reveal delay={100}>
//           <section className="shell mt-20 sm:mt-28">
//             <div className="mb-7 flex items-end justify-between gap-4">
//               <div>
//                 <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-muted">
//                   You may also like
//                 </p>

//                 <h2 className="mt-2 font-serif text-3xl font-normal sm:text-4xl">
//                   More from the collection
//                 </h2>
//               </div>

//               <Link
//                 to={getSectionPath()}
//                 className="hidden items-center gap-1 text-[11px] font-semibold uppercase tracking-[.12em] text-ink no-underline sm:flex"
//               >
//                 View all
//                 <ChevronRight size={14} />
//               </Link>
//             </div>

//             <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6">
//               {related.map((item, index) => (
//                 <Reveal
//                   key={item._id || item.slug}
//                   delay={index * 70}
//                 >
//                   <ProductCard product={item} />
//                 </Reveal>
//               ))}
//             </div>

//             <div className="mt-8 sm:hidden">
//               <Link
//                 to={getSectionPath()}
//                 className="flex items-center justify-center gap-1 rounded-sm border border-line py-3 text-[11px] font-semibold uppercase tracking-[.12em] text-ink no-underline"
//               >
//                 View collection
//                 <ChevronRight size={14} />
//               </Link>
//             </div>
//           </section>
//         </Reveal>
//       )}
//     </main>
//   );
// }