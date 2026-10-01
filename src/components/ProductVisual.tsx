import React, { useState } from 'react';
import { Product } from '../types/store';

interface ProductVisualProps {
  product: Product;
  size?: 'card' | 'detail';
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  product,
  size = 'card',
}) => {
  const [imgError, setImgError] = useState(false);
  const isBook = product.category === 'Books';
  const { bgHex, accentHex, textHex, editionLabel, codeLabel } = product.coverStyle;

  // In detail view or when a dedicated custom image is attached and user wants studio photo,
  // we show a refined studio composition; for cards, we render tactile editorial book covers
  // and precision stationery packaging so each of the 13 items has a distinct, unmistakable visual identity.
  if (isBook) {
    return (
      <div className="relative w-full h-full bg-[#F4F3EF] flex items-center justify-center p-6 select-none overflow-hidden">
        {/* Subtle studio light gradient */}
        <div
          className="

          absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 75% 20%, rgba(255,255,255,0.85) 0%, rgba(244,243,239,0) 65%)',
          }}
        />

        {/* Physical Book Jacket Object */}
        <div
          className={`relative flex flex-col justify-between rounded-r-[4px] rounded-l-[2px] shadow-[0_14px_28px_-10px_rgba(24,24,27,0.32),0_4px_10px_-3px_rgba(24,24,27,0.16)] transition-transform duration-200 ${
            size === 'detail'
              ? 'w-[220px] h-[300px] p-5'
              : 'w-[156px] h-[214px] p-3.5 group-hover:-translate-y-1'
          }`}
          style={{ backgroundColor: bgHex, color: textHex }}
        >
          {/* Book Spine Fold Highlight & Crease */}
          <div
            className="absolute top-0 bottom-0 left-0 w-[10px] rounded-l-[2px]"
            style={{
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.28) 65%, rgba(255,255,255,0.08) 100%)',
            }}
          />
          {/* Page Edge Effect on Right */}
          <div
            className="absolute top-[3px] bottom-[3px] -right-[4px] w-[4px] rounded-r-[1px]"
            style={{
              background:
                'repeating-linear-gradient(180deg, #FBFBF9 0px, #E5E4DF 1px, #FBFBF9 2px)',
            }}
          />

          {/* Top Colophon */}
          <div className="pl-2 flex items-center justify-between border-b pb-1.5" style={{ borderColor: `${accentHex}40` }}>
            <span className="font-mono text-[9px] tracking-wider opacity-85 truncate">
              {codeLabel}
            </span>
            <span
              className="font-mono text-[8px] px-1 py-0.2 rounded-[2px] font-semibold"
              style={{ backgroundColor: accentHex, color: '#18181B' }}
            >
              {product.subcategory.toUpperCase()}
            </span>
          </div>

          {/* Center Title & Geometric Architectural Diagram */}
          <div className="pl-2 my-auto py-2">
            <p
              className={`font-display font-semibold leading-[1.18] tracking-tight line-clamp-3 ${
                size === 'detail' ? 'text-[16px]' : 'text-[12.5px]'
              }`}
              style={{ color: textHex }}
            >
              {product.title}
            </p>
            <p className="mt-1.5 text-[9.5px] opacity-75 line-clamp-1 font-sans">
              {product.authorOrBrand}
            </p>
          </div>

          {/* Minimalist Technical Motif Band */}
          <div className="pl-2 pt-2 border-t flex items-center justify-between" style={{ borderColor: `${accentHex}40` }}>
            <span className="font-mono text-[7.5px] tracking-widest opacity-75 truncate">
              {editionLabel}
            </span>
            <div className="flex gap-0.5 shrink-0">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: accentHex }}
              />
              <span
                className="w-2 h-2 rounded-full opacity-50"
                style={{ backgroundColor: textHex }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Stationery Visual Presentation
  return (
    <div className="relative w-full h-full bg-[#F4F3EF] flex items-center justify-center p-6 select-none overflow-hidden">
      {product.imageUrl && !imgError && size === 'detail' ? (
        <img
          src={product.imageUrl}
          alt={product.title}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-[4px]"
        />
      ) : (
        <div
          className={`relative flex flex-col justify-between rounded-[6px] border border-[#18181B]/10 shadow-[0_12px_24px_-8px_rgba(24,24,27,0.22)] transition-transform duration-200 ${
            size === 'detail'
              ? 'w-[240px] h-[280px] p-5'
              : 'w-[176px] h-[204px] p-4 group-hover:-translate-y-1'
          }`}
          style={{ backgroundColor: bgHex, color: textHex }}
        >
          {/* Architectural Grid Pattern Overlay */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, ${textHex} 1px, transparent 1px), linear-gradient(to bottom, ${textHex} 1px, transparent 1px)`,
              backgroundSize: '16px 16px',
            }}
          />

          {/* Top Spec Bar */}
          <div className="relative z-10 flex items-center justify-between border-b pb-2" style={{ borderColor: `${accentHex}45` }}>
            <span className="font-mono text-[9.5px] tracking-wider font-medium">
              {codeLabel}
            </span>
            <span
              className="font-mono text-[8.5px] font-semibold px-1.5 py-0.5 rounded-[2px]"
              style={{ backgroundColor: accentHex, color: '#18181B' }}
            >
              {product.subcategory}
            </span>
          </div>

          {/* Center Precision Spec Graphic */}
          <div className="relative z-10 my-auto py-2">
            <div
              className="w-8 h-0.5 mb-2"
              style={{ backgroundColor: accentHex }}
            />
            <p
              className={`font-display font-semibold leading-snug line-clamp-3 ${
                size === 'detail' ? 'text-[16px]' : 'text-[13px]'
              }`}
            >
              {product.title}
            </p>
            <p className="mt-1 text-[10px] opacity-75 truncate">
              {product.bindingOrMaterial}
            </p>
          </div>

          {/* Bottom Technical Scale */}
          <div className="relative z-10 pt-2 border-t flex items-center justify-between font-mono text-[8px] opacity-80" style={{ borderColor: `${accentHex}45` }}>
            <span className="truncate">{editionLabel}</span>
            <span>CAMPUS SPEC</span>
          </div>
        </div>
      )}
    </div>
  );
};
