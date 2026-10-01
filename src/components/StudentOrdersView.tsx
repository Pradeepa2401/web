import React from 'react';
import { Order, User } from '../types/store';
import { PackageCheck, ArrowLeft, RotateCcw } from 'lucide-react';

interface StudentOrdersViewProps {
  orders: Order[];
  currentUser: User | null;
  onBackToCatalog: () => void;
  onReorderItems: (order: Order) => void;
}

const PROGRESS_STEPS = [
  'Order Placed',
  'Packed at Campus Store',
  'Out for Delivery',
  'Delivered',
] as const;

export const StudentOrdersView: React.FC<StudentOrdersViewProps> = ({
  orders,
  currentUser,
  onBackToCatalog,
  onReorderItems,
}) => {
  return (
    <section className="max-w-[1200px] mx-auto px-6 py-10">
      <div className="border-b border-[#E5E4DF] pb-8 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-[#52525B] mb-2">
            Student Module · Order History &amp; Receipt Archive
          </p>
          <h1 className="text-3xl font-display font-semibold tracking-tight text-[#18181B]">
            My Campus Orders
          </h1>
          <p className="mt-1.5 text-sm text-[#52525B]">
            Showing verified textbook &amp; stationery orders for{' '}
            <span className="font-medium text-[#18181B]">
              {currentUser
                ? `${currentUser.name} (${currentUser.rollNumber})`
                : 'Active Student Session'}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToCatalog}
          className="px-4 py-2 text-xs font-medium bg-[#F4F3EF] hover:bg-[#E5E4DF] text-[#18181B] rounded-md transition-colors inline-flex items-center gap-1.5 self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Storefront
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 bg-white border border-[#E5E4DF] rounded-lg text-center">
          <PackageCheck className="w-8 h-8 text-[#A1A1AA] mx-auto mb-3 stroke-[1.5]" />
          <p className="text-base font-display font-semibold text-[#18181B]">
            No orders placed yet
          </p>
          <p className="mt-1 text-xs text-[#52525B]">
            Add textbooks, stationery, or a Student Combo Kit to your bag and place an order.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStepIdx = PROGRESS_STEPS.indexOf(
              order.status as (typeof PROGRESS_STEPS)[number]
            );

            return (
              <article
                key={order.id}
                className="bg-white border border-[#E5E4DF] rounded-lg overflow-hidden"
              >
                {/* Order Header */}
                <div className="px-6 py-4 bg-[#F4F3EF] border-b border-[#E5E4DF] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[#52525B] tabular-nums">
                    <span className="font-semibold text-[#18181B]">{order.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>Placed {order.createdAt}</span>
                    <span aria-hidden="true">·</span>
                    <span>{order.paymentMethod}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#18181B]">
                      Roll No: {order.rollNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono font-semibold text-[#1E3A2F]">
                      Status: {order.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => onReorderItems(order)}
                      className="px-3 py-1.5 text-xs font-medium bg-white border border-[#D4D3CD] hover:border-[#18181B] text-[#18181B] rounded transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reorder Items
                    </button>
                  </div>
                </div>

                {/* Fulfillment Progress Bar */}
                {order.status !== 'Cancelled' && (
                  <div className="px-6 py-4 border-b border-[#E5E4DF] bg-[#FBFBF9]">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {PROGRESS_STEPS.map((stepLabel, idx) => {
                        const isReached = currentStepIdx >= idx;
                        return (
                          <div key={stepLabel} className="flex flex-col gap-1.5">
                            <div
                              className={`h-1 rounded-full ${
                                isReached ? 'bg-[#1E3A2F]' : 'bg-[#E5E4DF]'
                              }`}
                            />
                            <span
                              className={`text-[11px] font-mono ${
                                isReached
                                  ? 'text-[#18181B] font-semibold'
                                  : 'text-[#71717A]'
                              }`}
                            >
                              0{idx + 1}. {stepLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Order Line Items */}
                <div className="p-6">
                  <div className="divide-y divide-[#E5E4DF]">
                    {order.items.map((item, i) => (
                      <div
                        key={`${order.id}-${item.id}-${i}`}
                        className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-xs font-mono text-[#52525B]">
                            {item.categoryLabel} · {item.sku}
                          </p>
                          <p className="text-sm font-semibold text-[#18181B] mt-0.5">
                            {item.quantity}× {item.title}
                          </p>
                        </div>
                        <div className="text-right font-mono tabular-nums">
                          <p className="text-sm font-semibold text-[#18181B]">
                            ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                          </p>
                          <p className="text-[11px] text-[#52525B]">
                            ₹{item.unitPrice.toLocaleString('en-IN')} / unit
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer Breakdown */}
                  <div className="mt-6 pt-4 border-t border-[#E5E4DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#52525B]">
                    <div>
                      <span className="font-medium text-[#18181B]">Delivery To:</span>{' '}
                      {order.deliveryAddress} · {order.phone}
                    </div>
                    <div className="flex items-center gap-4 font-mono tabular-nums">
                      <span>Subtotal: ₹{order.subtotal.toLocaleString('en-IN')}</span>
                      <span>
                        Shipping: {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
                      </span>
                      <span className="text-sm font-semibold text-[#18181B]">
                        Total: ₹{order.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
