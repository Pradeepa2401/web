import React, { useState, useEffect } from 'react';
import { Product } from '../types/store';
import { ProductVisual } from './ProductVisual';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [product]);

  if (!product) return null;

  const maxAllowed = Math.min(product.stock, 20);
  const lineTotal = product.price * quantity;

  const handleStep = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > maxAllowed) return maxAllowed;
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 overflow-y-auto">
      <div className="bg-[#FBFBF9] border border-[#E5E4DF] rounded-lg max-w-4xl w-full overflow-hidden shadow-2xl my-8">
        {/* Top Bar */}
        <div className="px-6 py-4 bg-[#F4F3EF] border-b border-[#E5E4DF] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#52525B] font-mono">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span>{product.subcategory}</span>
            <span aria-hidden="true">·</span>
            <span>{product.sku}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#52525B] hover:text-[#18181B] rounded-md transition-colors"
            aria-label="Close product details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contiguous Purchase Module: Gallery Left, Purchase Module Right */}
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Visual Showcase */}
          <div className="md:col-span-5 bg-[#F4F3EF] border-b md:border-b-0 md:border-r border-[#E5E4DF] min-h-[360px] flex flex-col justify-between">
            <div className="flex-1 flex items-center justify-center">
              <ProductVisual product={product} size="detail" />
            </div>
            <div className="px-6 py-3 border-t border-[#E5E4DF] text-[11px] font-mono text-[#52525B] flex items-center justify-between">
              <span>{product.semesterTag}</span>
              <span>{product.bindingOrMaterial}</span>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="md:col-span-7 p-6 lg:p-8 flex flex-col justify-between">
            <div>
              {/* Quiet Unboxed Metadata */}
              <div className="flex items-center gap-2 text-xs text-[#52525B] mb-2">
                <span>{product.authorOrBrand}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {product.stock > 0 ? `${product.stock} in Campus Stock` : 'Out of Stock'}
                </span>
              </div>

              <h2 className="text-2xl font-display font-semibold text-[#18181B] leading-snug">
                {product.title}
              </h2>

              {/* Price Row */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-mono font-semibold tabular-nums text-[#18181B]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-sm font-mono tabular-nums text-[#71717A] line-through">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-mono text-[#1E3A2F] font-medium">
                      Student Subsidy Applied
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="mt-4 text-sm text-[#3F3F46] leading-relaxed">
                {product.description}
              </p>

              {/* Specifications Table */}
              <div className="mt-6 border-t border-[#E5E4DF] pt-4">
                <p className="text-xs font-semibold text-[#18181B] mb-2.5">
                  Academic &amp; Material Specifications
                </p>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div
                      key={key}
                      className="flex justify-between py-1.5 border-b border-[#E5E4DF]/70"
                    >
                      <dt className="text-[#52525B]">{key}</dt>
                      <dd className="font-mono text-[#18181B] text-right">{val}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Quantity Stepper & Primary Purchase CTAs */}
            <div className="mt-8 pt-5 border-t border-[#E5E4DF]">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-[#52525B]">Quantity:</span>
                  <div className="inline-flex items-center border border-[#D4D3CD] rounded-md bg-white">
                    <button
                      type="button"
                      onClick={() => handleStep(-1)}
                      disabled={quantity <= 1}
                      className="p-2 text-[#18181B] disabled:opacity-40 hover:bg-[#F4F3EF] transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 py-1 text-sm font-mono tabular-nums font-semibold text-[#18181B]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStep(1)}
                      disabled={quantity >= maxAllowed}
                      className="p-2 text-[#18181B] disabled:opacity-40 hover:bg-[#F4F3EF] transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-[#52525B] block">Calculated Total:</span>
                  <span className="text-lg font-mono font-semibold tabular-nums text-[#18181B]">
                    ₹{lineTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={product.stock === 0}
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  className="py-3 px-5 text-xs font-semibold bg-[#1E3A2F] text-white rounded-md hover:bg-[#14281D] disabled:opacity-40 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Shopping Bag
                </button>
                <button
                  type="button"
                  disabled={product.stock === 0}
                  onClick={() => {
                    onBuyNow(product, quantity);
                  }}
                  className="py-3 px-5 text-xs font-semibold bg-white text-[#18181B] border border-[#18181B] rounded-md hover:bg-[#F4F3EF] disabled:opacity-40 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
