import React, { useState, useEffect } from 'react';
import { CartItem, Order, User } from '../types/store';
import { X, Minus, Plus, Trash2, ArrowRight, CheckCircle2, ShoppingBag } from 'lucide-react';

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  currentUser: User | null;
  onPlaceOrder: (newOrder: Order) => void;
  onViewOrders: () => void;
}

export const CartCheckoutDrawer: React.FC<CartCheckoutDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  currentUser,
  onPlaceOrder,
  onViewOrders,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmed'>('cart');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Checkout Form State
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 98402 71520');
  const [deliveryAddress, setDeliveryAddress] = useState(
    'Room 312, Block B Hostel / CSE Department Desk'
  );
  const [paymentMethod, setPaymentMethod] = useState<
    'Campus Smart Card' | 'UPI Instant Pay' | 'Cash on Delivery'
  >('UPI Instant Pay');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setStudentName(currentUser.name);
      setRollNumber(currentUser.rollNumber);
      setDepartment(currentUser.department);
      setEmail(currentUser.email);
    }
  }, [currentUser, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      // Reset to cart view when reopened unless just confirmed
      setTimeout(() => {
        setStep('cart');
        setFormError(null);
      }, 200);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const comboItemsCount = cart
    .filter((i) => i.type === 'combo')
    .reduce((s, i) => s + i.quantity, 0);
  const comboSavings = comboItemsCount * 115;
  const deliveryFee = subtotal >= 500 || subtotal === 0 ? 0 : 40;
  const grandTotal = subtotal + deliveryFee;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (studentName.trim().length < 3) {
      setFormError('Please enter your full Student Name (minimum 3 characters).');
      return;
    }
    if (rollNumber.trim().length < 4) {
      setFormError('Please enter a valid University Roll Number (e.g. 24CS1042).');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFormError('Please enter a valid university or personal email address.');
      return;
    }
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number for delivery updates.');
      return;
    }
    if (deliveryAddress.trim().length < 8) {
      setFormError('Please specify your Hostel Room or Department Pickup Counter.');
      return;
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(
      now.getHours()
    ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newOrder: Order = {
      id: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId: currentUser?.id || 'usr-guest',
      studentName: studentName.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
      department: department.trim() || 'B.E. Engineering',
      email: email.trim(),
      phone: phone.trim(),
      deliveryAddress: deliveryAddress.trim(),
      paymentMethod,
      items: cart.map((item) => ({
        id: item.id,
        title: item.title,
        categoryLabel: item.categoryLabel,
        sku: item.sku,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      })),
      subtotal,
      comboSavings,
      deliveryFee,
      total: grandTotal,
      status: 'Order Placed',
      createdAt: formattedDate,
    };

    onPlaceOrder(newOrder);
    setConfirmedOrder(newOrder);
    setStep('confirmed');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <div className="bg-[#FBFBF9] border-l border-[#E5E4DF] w-full max-w-lg h-full flex flex-col justify-between shadow-2xl">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-[#F4F3EF] border-b border-[#E5E4DF] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-[#52525B]">
              {step === 'cart'
                ? 'HTTP Session Cart · Dynamic Calculation'
                : step === 'checkout'
                ? 'Step 2 of 2 · Student Verification & Checkout'
                : 'Official Campus Store Receipt'}
            </p>
            <h2 className="text-lg font-display font-semibold text-[#18181B]">
              {step === 'cart'
                ? `Shopping Bag (${cart.reduce((s, i) => s + i.quantity, 0)})`
                : step === 'checkout'
                ? 'Checkout & Campus Delivery'
                : `Order ${confirmedOrder?.id} Confirmed`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#52525B] hover:text-[#18181B] rounded-md"
            aria-label="Close shopping bag"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: CART VIEW */}
          {step === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="py-20 text-center">
                  <ShoppingBag className="w-8 h-8 text-[#A1A1AA] mx-auto mb-3 stroke-[1.5]" />
                  <p className="text-base font-display font-semibold text-[#18181B]">
                    Your campus shopping bag is empty
                  </p>
                  <p className="mt-1 text-xs text-[#52525B] max-w-xs mx-auto">
                    Browse academic textbooks, technical drawing instruments, or add a pre-bundled
                    Student Combo Kit.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Free Delivery Notice */}
                  <div className="p-3 bg-[#F4F3EF] border border-[#E5E4DF] rounded-md text-xs text-[#18181B] flex items-center justify-between">
                    <span>
                      {subtotal >= 500
                        ? 'Eligible for Free Hostel & Department Counter Delivery'
                        : `Add ₹${500 - subtotal} more for Free Campus Delivery`}
                    </span>
                    <span className="font-mono font-semibold text-[#1E3A2F]">
                      {subtotal >= 500 ? 'FREE SHIPPING' : '+₹40 Shipping'}
                    </span>
                  </div>

                  {/* Cart Items */}
                  <div className="divide-y divide-[#E5E4DF] border-t border-b border-[#E5E4DF]">
                    {cart.map((item) => (
                      <div key={item.id} className="py-4 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-mono text-[#52525B]">
                              {item.categoryLabel} · {item.sku}
                            </p>
                            <h3 className="text-sm font-semibold text-[#18181B] mt-0.5">
                              {item.title}
                            </h3>
                            <p className="text-xs text-[#52525B]">{item.subtitle}</p>
                            {item.includedItems && item.includedItems.length > 0 && (
                              <ul className="mt-1.5 pl-3 border-l-2 border-[#D4D3CD] space-y-0.5 text-[11px] text-[#52525B]">
                                {item.includedItems.map((line, i) => (
                                  <li key={i}>{line}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <span className="text-sm font-mono font-semibold tabular-nums text-[#18181B] whitespace-nowrap">
                            ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="inline-flex items-center border border-[#D4D3CD] rounded bg-white">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 text-[#18181B] hover:bg-[#F4F3EF]"
                              aria-label="Decrease item quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-mono tabular-nums font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 text-[#18181B] hover:bg-[#F4F3EF]"
                              aria-label="Increase item quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-[#52525B] tabular-nums">
                              ₹{item.unitPrice.toLocaleString('en-IN')} each
                            </span>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.id)}
                              className="text-xs text-red-700 hover:underline inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 2: CHECKOUT FORM */}
          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4" noValidate>
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#18181B] mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D4D3CD] rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#18181B] mb-1">
                    University Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. 24CS1042"
                    className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#D4D3CD] rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18181B] mb-1">
                  Department &amp; Semester
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D4D3CD] rounded-md"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#18181B] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D4D3CD] rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#18181B] mb-1">
                    Mobile Number (10 digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#D4D3CD] rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18181B] mb-1">
                  Hostel Room / Campus Delivery Counter *
                </label>
                <textarea
                  rows={2}
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D4D3CD] rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18181B] mb-2">
                  Payment Method *
                </label>
                <div className="space-y-2">
                  {(
                    [
                      'UPI Instant Pay',
                      'Campus Smart Card',
                      'Cash on Delivery',
                    ] as const
                  ).map((method) => (
                    <label
                      key={method}
                      className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition-colors ${
                        paymentMethod === method
                          ? 'bg-[#F4F3EF] border-[#1E3A2F]'
                          : 'bg-white border-[#D4D3CD]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === method}
                          onChange={() => setPaymentMethod(method)}
                          className="text-[#1E3A2F]"
                        />
                        <span className="text-xs font-medium text-[#18181B]">
                          {method}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[#52525B]">
                        {method === 'Cash on Delivery'
                          ? 'Pay at Hostel / Desk'
                          : 'Zero Fee'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: ORDER CONFIRMATION */}
          {step === 'confirmed' && confirmedOrder && (
            <div className="space-y-5">
              <div className="p-5 bg-[#F4F3EF] border border-[#1E3A2F] rounded-lg">
                <div className="flex items-center gap-2 text-[#1E3A2F] mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-xs font-mono font-semibold">
                    ORDER CONFIRMED · {confirmedOrder.id}
                  </span>
                </div>
                <h3 className="text-lg font-display font-semibold text-[#18181B]">
                  Thank you, {confirmedOrder.studentName}!
                </h3>
                <p className="mt-1 text-xs text-[#52525B] leading-relaxed">
                  Your order has been logged in the campus fulfillment queue for{' '}
                  <span className="font-medium text-[#18181B]">
                    {confirmedOrder.deliveryAddress}
                  </span>
                  .
                </p>
              </div>

              <div className="bg-white border border-[#E5E4DF] rounded-lg p-4 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-[#E5E4DF]">
                  <span className="text-[#52525B]">Student Roll No:</span>
                  <span className="font-mono font-semibold text-[#18181B]">
                    {confirmedOrder.rollNumber}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5E4DF]">
                  <span className="text-[#52525B]">Payment Mode:</span>
                  <span className="font-medium text-[#18181B]">
                    {confirmedOrder.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5E4DF]">
                  <span className="text-[#52525B]">Fulfillment Status:</span>
                  <span className="font-mono font-semibold text-[#1E3A2F]">
                    {confirmedOrder.status}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#52525B]">Total Amount:</span>
                  <span className="font-mono font-semibold text-sm tabular-nums text-[#18181B]">
                    ₹{confirmedOrder.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {step !== 'confirmed' && cart.length > 0 && (
          <div className="p-6 bg-[#F4F3EF] border-t border-[#E5E4DF] space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#52525B]">
                <span>Items Subtotal</span>
                <span className="font-mono tabular-nums">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              {comboSavings > 0 && (
                <div className="flex justify-between text-[#1E3A2F]">
                  <span>Student Combo Bundle Subsidy Included</span>
                  <span className="font-mono tabular-nums">
                    Saved ₹{comboSavings.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-[#52525B]">
                <span>Campus Delivery Fee</span>
                <span className="font-mono tabular-nums">
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="pt-2 border-t border-[#D4D3CD] flex justify-between text-sm font-semibold text-[#18181B]">
                <span>Total Payable</span>
                <span className="font-mono tabular-nums text-base">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {step === 'cart' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3 px-5 text-xs font-semibold bg-[#1E3A2F] text-white rounded-md hover:bg-[#14281D] transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Student Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-3 text-xs font-medium bg-white border border-[#D4D3CD] text-[#18181B] rounded-md hover:bg-[#E5E4DF] transition-colors"
                >
                  Back to Bag
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  className="flex-1 py-3 px-5 text-xs font-semibold bg-[#1E3A2F] text-white rounded-md hover:bg-[#14281D] transition-colors"
                >
                  Place Order · ₹{grandTotal.toLocaleString('en-IN')}
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'confirmed' && (
          <div className="p-6 bg-[#F4F3EF] border-t border-[#E5E4DF] flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 text-xs font-medium bg-white border border-[#D4D3CD] text-[#18181B] rounded-md hover:bg-[#E5E4DF]"
            >
              Continue Shopping
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewOrders();
              }}
              className="flex-1 py-2.5 px-4 text-xs font-semibold bg-[#1E3A2F] text-white rounded-md hover:bg-[#14281D]"
            >
              View in My Orders
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
