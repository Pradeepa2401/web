import React, { useState, useMemo, useEffect } from 'react';
import {
  CartItem,
  CategoryTree,
  MainCategory,
  Order,
  OrderStatus,
  Product,
  StudentCombo,
  User,
} from './types/store';
import {
  DEMO_USERS,
  HERO_IMAGE_URL,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  STUDENT_COMBOS,
} from './data/initialCatalog';
import {
  buildCatalogXmlString,
  buildXPathQuery,
  evaluateXPathOnCatalog,
} from './utils/xmlXpathEngine';
import {
  getRememberedPreferences,
  loadSessionCart,
  loadSessionUser,
  rememberUserCredentialsCookie,
  saveRecentPreferenceCookie,
  saveSessionCart,
  saveSessionUser,
} from './utils/sessionCookieManager';
import { ProductVisual } from './components/ProductVisual';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartCheckoutDrawer } from './components/CartCheckoutDrawer';
import { AuthModal } from './components/AuthModal';
import { StudentOrdersView } from './components/StudentOrdersView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { WebTechSyllabusView } from './components/WebTechSyllabusView';
import {
  Search,
  ShoppingBag,
  ArrowRight,
  Check,
  Terminal,
  SlidersHorizontal,
} from 'lucide-react';

type ActiveView = 'storefront' | 'combos' | 'orders' | 'admin' | 'webtech';

export default function App() {
  // Persistent State backed by localStorage & sessionStorage
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('folio_catalog_products_v1');
      return saved ? (JSON.parse(saved) as Product[]) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState<CategoryTree>(() => {
    try {
      const saved = localStorage.getItem('folio_catalog_categories_v1');
      return saved ? (JSON.parse(saved) as CategoryTree) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('folio_campus_orders_v1');
      return saved ? (JSON.parse(saved) as Order[]) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    loadSessionUser(DEMO_USERS[0])
  );

  const [cart, setCart] = useState<CartItem[]>(() =>
    loadSessionCart([
      {
        id: 'combo-web-tech-lab',
        type: 'combo',
        title: 'Web Technology Lab Kit',
        subtitle: 'Record Book + Notebook + Pen + Lab Manual',
        categoryLabel: 'Student Combo · Semester V',
        unitPrice: 520,
        quantity: 1,
        sku: 'COMBO-WT-01',
        includedItems: [
          '1× Hardcover Linen Lab Record Book (160 Pages)',
          '1× A4 Engineering Lecture Notebook (240 Pages)',
          '1× Archival Exam & Lab Pen Set (Pack of 5)',
          '1× Web Technology Practical Lab Manual (XML/XPath/Servlet)',
        ],
      },
    ])
  );

  // Navigation & Modal State
  const [activeView, setActiveView] = useState<ActiveView>('storefront');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [comboImgFailed, setComboImgFailed] = useState<Record<string, boolean>>({});

  // Catalog Filter & AJAX Search State
  const [mainCategory, setMainCategory] = useState<'All' | MainCategory>('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'title'>('featured');

  // Sync changes to storage
  useEffect(() => {
    try {
      localStorage.setItem('folio_catalog_products_v1', JSON.stringify(products));
    } catch {
      // Ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('folio_catalog_categories_v1', JSON.stringify(categories));
    } catch {
      // Ignore
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('folio_campus_orders_v1', JSON.stringify(orders));
    } catch {
      // Ignore
    }
  }, [orders]);

  useEffect(() => {
    saveSessionCart(cart);
  }, [cart]);

  useEffect(() => {
    saveSessionUser(currentUser);
  }, [currentUser]);

  // Write recent category or search to Browser Cookie (demonstrating Cookies syllabus requirement)
  useEffect(() => {
    saveRecentPreferenceCookie(
      selectedSubcategory !== 'All' ? selectedSubcategory : mainCategory,
      searchQuery
    );
  }, [mainCategory, selectedSubcategory, searchQuery]);

  // Real XML Serialization + XPath 1.0 Filtering Engine
  const catalogXmlString = useMemo(
    () => buildCatalogXmlString(products, categories),
    [products, categories]
  );

  const activeXPathExpression = useMemo(
    () =>
      buildXPathQuery({
        mainCategory,
        subcategory: selectedSubcategory,
        searchQuery,
        maxPrice: maxPriceFilter,
      }),
    [mainCategory, selectedSubcategory, searchQuery, maxPriceFilter]
  );

  const filteredProducts = useMemo(() => {
    const evaluation = evaluateXPathOnCatalog(
      catalogXmlString,
      activeXPathExpression
    );
    const idSet = new Set(evaluation.matchedIds);
    const list = products.filter((p) => idSet.has(p.id));

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'title') {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [catalogXmlString, activeXPathExpression, products, sortBy]);

  const availableSubcategories = useMemo(() => {
    if (mainCategory === 'All') {
      return [...categories.Books, ...categories.Stationery];
    }
    return categories[mainCategory];
  }, [mainCategory, categories]);

  const rememberedCookieSummary = useMemo(
    () => getRememberedPreferences(),
    [currentUser, mainCategory, selectedSubcategory]
  );

  // Cart Handlers
  const triggerAddedFeedback = (id: string) => {
    setJustAddedId(id);
    setTimeout(() => {
      setJustAddedId((prev) => (prev === id ? null : prev));
    }, 1200);
  };

  const handleAddProductToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          type: 'product',
          title: product.title,
          subtitle: product.authorOrBrand,
          categoryLabel: `${product.category} · ${product.subcategory}`,
          unitPrice: product.price,
          quantity,
          sku: product.sku,
        },
      ];
    });
    triggerAddedFeedback(product.id);
  };

  const handleBuyProductNow = (product: Product, quantity = 1) => {
    handleAddProductToCart(product, quantity);
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const handleAddComboToCart = (combo: StudentCombo) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === combo.id);
      if (existing) {
        return prev.map((item) =>
          item.id === combo.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: combo.id,
          type: 'combo',
          title: combo.title,
          subtitle: combo.subtitle,
          categoryLabel: `Student Combo · ${combo.targetGroup}`,
          unitPrice: combo.comboPrice,
          quantity: 1,
          sku: combo.id.toUpperCase(),
          includedItems: combo.items.map((i) => i.label),
        },
      ];
    });
    triggerAddedFeedback(combo.id);
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== itemId));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handlePlaceOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
  };

  const handleReorder = (order: Order) => {
    const restoredItems: CartItem[] = order.items.map((line) => ({
      id: line.id,
      type: line.id.startsWith('combo') ? 'combo' : 'product',
      title: line.title,
      subtitle: 'Reordered from ' + order.id,
      categoryLabel: line.categoryLabel,
      unitPrice: line.unitPrice,
      quantity: line.quantity,
      sku: line.sku,
    }));
    setCart(restoredItems);
    setIsCartOpen(true);
  };

  // Admin Handlers
  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleAddSubcategory = (mainCat: MainCategory, subcat: string) => {
    setCategories((prev) => ({
      ...prev,
      [mainCat]: [...prev[mainCat], subcat],
    }));
  };

  const handleDeleteSubcategory = (mainCat: MainCategory, subcat: string) => {
    setCategories((prev) => ({
      ...prev,
      [mainCat]: prev[mainCat].filter((s) => s !== subcat),
    }));
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const totalBagCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-[#18181B]">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-40 bg-[#FBFBF9]/95 backdrop-blur-xs border-b border-[#E5E4DF] px-6 py-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Brand Title (Single text element wordmark in display face) */}
          <a
            href="#storefront"
            onClick={(e) => {
              e.preventDefault();
              setActiveView('storefront');
            }}
            className="text-xl font-display font-semibold tracking-tight text-[#18181B] whitespace-nowrap shrink-0"
          >
            Folio &amp; Form
          </a>

          {/* Zone 2: 5 Clean Text Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#52525B]">
            <button
              type="button"
              onClick={() => setActiveView('storefront')}
              className={`hover:text-[#18181B] transition-colors whitespace-nowrap pb-0.5 ${
                activeView === 'storefront'
                  ? 'text-[#18181B] border-b-2 border-[#18181B]'
                  : ''
              }`}
            >
              Catalog
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('combos');
              }}
              className={`hover:text-[#18181B] transition-colors whitespace-nowrap pb-0.5 ${
                activeView === 'combos'
                  ? 'text-[#18181B] border-b-2 border-[#18181B]'
                  : ''
              }`}
            >
              Student Combos
            </button>
            <button
              type="button"
              onClick={() => setActiveView('orders')}
              className={`hover:text-[#18181B] transition-colors whitespace-nowrap pb-0.5 ${
                activeView === 'orders'
                  ? 'text-[#18181B] border-b-2 border-[#18181B]'
                  : ''
              }`}
            >
              My Orders
            </button>
            <button
              type="button"
              onClick={() => setActiveView('admin')}
              className={`hover:text-[#18181B] transition-colors whitespace-nowrap pb-0.5 ${
                activeView === 'admin'
                  ? 'text-[#18181B] border-b-2 border-[#18181B]'
                  : ''
              }`}
            >
              Admin Console
            </button>
            <button
              type="button"
              onClick={() => setActiveView('webtech')}
              className={`hover:text-[#18181B] transition-colors whitespace-nowrap pb-0.5 ${
                activeView === 'webtech'
                  ? 'text-[#18181B] border-b-2 border-[#18181B]'
                  : ''
              }`}
            >
              Web Tech Specs
            </button>
          </nav>

          {/* Zone 3: 2 Primary Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="px-3.5 py-2 text-xs font-medium text-[#18181B] bg-[#F4F3EF] hover:bg-[#E5E4DF] rounded-md transition-colors whitespace-nowrap truncate max-w-[180px]"
            >
              {currentUser
                ? `${currentUser.role === 'admin' ? 'Admin' : currentUser.rollNumber}`
                : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2 text-xs font-medium text-white bg-[#1E3A2F] hover:bg-[#14281D] rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 tabular-nums"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Bag ({totalBagCount})</span>
            </button>
          </div>
        </div>

        {/* Mobile Secondary Nav Bar */}
        <div className="flex md:hidden items-center gap-4 overflow-x-auto pt-3 mt-3 border-t border-[#E5E4DF] text-xs font-medium text-[#52525B]">
          <button
            type="button"
            onClick={() => setActiveView('storefront')}
            className={`whitespace-nowrap ${
              activeView === 'storefront' ? 'text-[#18181B] font-semibold' : ''
            }`}
          >
            Catalog
          </button>
          <button
            type="button"
            onClick={() => setActiveView('combos')}
            className={`whitespace-nowrap ${
              activeView === 'combos' ? 'text-[#18181B] font-semibold' : ''
            }`}
          >
            Student Combos
          </button>
          <button
            type="button"
            onClick={() => setActiveView('orders')}
            className={`whitespace-nowrap ${
              activeView === 'orders' ? 'text-[#18181B] font-semibold' : ''
            }`}
          >
            My Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView('admin')}
            className={`whitespace-nowrap ${
              activeView === 'admin' ? 'text-[#18181B] font-semibold' : ''
            }`}
          >
            Admin Console
          </button>
          <button
            type="button"
            onClick={() => setActiveView('webtech')}
            className={`whitespace-nowrap ${
              activeView === 'webtech' ? 'text-[#18181B] font-semibold' : ''
            }`}
          >
            Web Tech Specs
          </button>
        </div>
      </header>

      {/* MAIN VIEW ROUTER */}
      <main className="flex-1">
        {/* VIEW 1: STOREFRONT (Hero + Standout Student Combos + XML/XPath Catalog) */}
        {activeView === 'storefront' && (
          <div>
            {/* SECTION 1: STOREFRONT HERO */}
            <section className="border-b border-[#E5E4DF] bg-[#F4F3EF]/60">
              <div className="max-w-[1200px] mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-6 space-y-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#52525B]">
                    <span>Student Book &amp; Stationery Online Shopping System</span>
                    <span aria-hidden="true">·</span>
                    <span>2026 Academic Session</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-display font-semibold tracking-tight text-[#18181B] leading-[1.12]">
                    Academic textbooks, lab records, and precision stationery for every semester.
                  </h1>

                  <p className="text-[15px] text-[#3F3F46] leading-relaxed max-w-xl">
                    Browse syllabus-verified Computer Science &amp; Engineering textbooks,
                    100 GSM linen practical record books, scientific calculators, and
                    subsidized semester combo kits—delivered straight to your hostel or department counter.
                  </p>

                  {/* Cookie & Session Welcome Proof Line */}
                  <div className="pt-1 text-xs text-[#52525B] font-mono">
                    {currentUser ? (
                      <span>
                        Active Session: {currentUser.name} ({currentUser.rollNumber}) ·{' '}
                        Recent Cookie Filter:{' '}
                        {rememberedCookieSummary.recentCategory || 'Web Technology'}
                      </span>
                    ) : (
                      <span>
                        Guest Session Active · Sign in to save hostel delivery details
                      </span>
                    )}
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <a
                      href="#catalog-section"
                      className="px-5 py-3 text-xs font-semibold bg-[#1E3A2F] text-white rounded-md hover:bg-[#14281D] transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                    >
                      Browse Store Catalog
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <a
                      href="#student-combos-section"
                      className="px-5 py-3 text-xs font-semibold bg-white text-[#18181B] border border-[#D4D3CD] hover:border-[#18181B] rounded-md transition-colors whitespace-nowrap"
                    >
                      Explore Student Combo Kits
                    </a>
                  </div>
                </div>

                {/* Right Column: Editorial Bookshop Hero Photography */}
                <div className="lg:col-span-6">
                  <div className="relative aspect-16/10 w-full rounded-lg overflow-hidden border border-[#E5E4DF] bg-[#E5E4DF]">
                    {!heroImgFailed ? (
                      <img
                        src={HERO_IMAGE_URL}
                        alt="University bookshop table with computer science textbooks, linen lab record notebooks, brass compass, and scientific calculator"
                        referrerPolicy="no-referrer"
                        onError={() => setHeroImgFailed(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#1E3A2F] text-[#FBFBF9] p-8 flex flex-col justify-between">
                        <span className="font-mono text-xs opacity-75">
                          CAMPUS PRESS &amp; STATIONERY ATELIER
                        </span>
                        <p className="font-display text-2xl font-semibold">
                          Curated University Textbooks &amp; Precision Engineering Instruments
                        </p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-5">
                      <div className="text-white">
                        <p className="text-xs font-mono opacity-90">
                          Featured Standout Bundle · Save up to 18%
                        </p>
                        <p className="text-sm font-medium mt-0.5">
                          1st Year Engineering Kit &amp; Web Technology Lab Kit in stock for immediate dispatch
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: STANDOUT FEATURE — STUDENT COMBO KITS */}
            <section
              id="student-combos-section"
              className="max-w-[1200px] mx-auto px-6 py-14 border-b border-[#E5E4DF]"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <p className="text-xs font-mono text-[#1E3A2F] mb-1.5">
                    01. Curated Semester Kits · Standout Student Feature
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[#18181B]">
                    Pre-Bundled Student Combo Kits
                  </h2>
                  <p className="mt-1.5 text-sm text-[#52525B] max-w-2xl">
                    Skip adding individual lab items one by one. Each semester kit bundles
                    official lab record books, lecture notebooks, archival pens, and required manuals at a subsidized student rate.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView('combos')}
                  className="text-xs font-semibold text-[#1E3A2F] hover:underline inline-flex items-center gap-1 whitespace-nowrap self-start md:self-end"
                >
                  View Full Kit Breakdowns
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {STUDENT_COMBOS.map((combo) => {
                  const savings = combo.regularPrice - combo.comboPrice;
                  const isAdded = justAddedId === combo.id;

                  return (
                    <article
                      key={combo.id}
                      className="bg-white border border-[#E5E4DF] rounded-lg overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <div>
                        {/* 4:3 Studio Flat-Lay Image */}
                        <div className="aspect-4/3 w-full bg-[#F4F3EF] border-b border-[#E5E4DF] overflow-hidden relative">
                          {!comboImgFailed[combo.id] ? (
                            <img
                              src={combo.imageUrl}
                              alt={combo.title}
                              referrerPolicy="no-referrer"
                              onError={() =>
                                setComboImgFailed((prev) => ({
                                  ...prev,
                                  [combo.id]: true,
                                }))
                              }
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full p-6 bg-[#1E3A2F] text-white flex flex-col justify-between">
                              <span className="font-mono text-xs opacity-75">
                                {combo.targetGroup}
                              </span>
                              <p className="font-display text-xl font-semibold">
                                {combo.title}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="p-6">
                          {/* Quiet Unboxed Metadata */}
                          <p className="text-xs font-mono text-[#52525B] mb-1">
                            {combo.targetGroup} · Save ₹{savings}
                          </p>
                          <h3 className="text-xl font-display font-semibold text-[#18181B]">
                            {combo.title}
                          </h3>
                          <p className="mt-1 text-xs font-medium text-[#1E3A2F]">
                            {combo.subtitle}
                          </p>
                          <p className="mt-2.5 text-xs text-[#52525B] leading-relaxed">
                            {combo.description}
                          </p>

                          {/* Itemized Kit Checklist */}
                          <div className="mt-4 pt-3.5 border-t border-[#E5E4DF]">
                            <p className="text-[11px] font-mono text-[#52525B] mb-2">
                              Included in Kit ({combo.items.reduce((s, i) => s + i.quantity, 0)} items):
                            </p>
                            <ul className="space-y-1.5 text-xs text-[#18181B]">
                              {combo.items.map((item) => (
                                <li
                                  key={item.productId}
                                  className="flex items-start gap-2"
                                >
                                  <span className="font-mono text-[#1E3A2F] font-semibold">
                                    ·
                                  </span>
                                  <span>{item.label}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Combo Purchase Footer */}
                      <div className="px-6 py-4 bg-[#F4F3EF] border-t border-[#E5E4DF] flex items-center justify-between gap-4">
                        <div className="font-mono tabular-nums">
                          <span className="text-lg font-semibold text-[#18181B]">
                            ₹{combo.comboPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="ml-2 text-xs text-[#71717A] line-through">
                            ₹{combo.regularPrice.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddComboToCart(combo)}
                          className="px-4 py-2 text-xs font-semibold bg-[#1E3A2F] text-white rounded-md hover:bg-[#14281D] transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Kit Added
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              Add Complete Kit
                            </>
                          )}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* SECTION 3: ACADEMIC BOOKS & STATIONERY CATALOG (XML + XPATH POWERED) */}
            <section
              id="catalog-section"
              className="max-w-[1200px] mx-auto px-6 py-14"
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                <div>
                  <p className="text-xs font-mono text-[#1E3A2F] mb-1.5">
                    02. Complete Store Catalog · Books &amp; Stationery
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[#18181B]">
                    Browse Academic Books &amp; Precision Stationery
                  </h2>
                </div>

                {/* Live AJAX Search Input & Sort Control */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative min-w-[260px] sm:min-w-[300px]">
                    <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search title, subject, author, ISBN..."
                      className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#D4D3CD] rounded-md text-[#18181B] focus:outline-none focus:border-[#1E3A2F]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#52525B] shrink-0" />
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          e.target.value as
                            | 'featured'
                            | 'price-asc'
                            | 'price-desc'
                            | 'title'
                        )
                      }
                      aria-label="Sort products"
                      className="px-3 py-2 text-xs bg-white border border-[#D4D3CD] rounded-md text-[#18181B] focus:outline-none focus:border-[#1E3A2F]"
                    >
                      <option value="featured">Sort: Featured Syllabus</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="title">Title: A to Z</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Interactive Category & Subcategory Filter Controls */}
              <div className="bg-white border border-[#E5E4DF] rounded-lg p-4 mb-8 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E4DF] pb-4">
                  {/* Main Category Segmented Buttons */}
                  <div className="flex items-center gap-1 p-1 bg-[#F4F3EF] rounded-md self-start">
                    {(['All', 'Books', 'Stationery'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setMainCategory(cat);
                          setSelectedSubcategory('All');
                        }}
                        className={`px-4 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                          mainCategory === cat
                            ? 'bg-[#18181B] text-white'
                            : 'text-[#52525B] hover:text-[#18181B]'
                        }`}
                      >
                        {cat === 'All' ? 'All Categories' : cat}
                      </button>
                    ))}
                  </div>

                  {/* Price Ceiling Filter */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#52525B]">Budget Filter:</span>
                    {[
                      { label: 'Any Price', val: null },
                      { label: 'Under ₹250', val: 250 },
                      { label: 'Under ₹600', val: 600 },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setMaxPriceFilter(opt.val)}
                        className={`px-2.5 py-1 rounded text-xs font-mono transition-colors whitespace-nowrap ${
                          maxPriceFilter === opt.val
                            ? 'bg-[#1E3A2F] text-white'
                            : 'bg-[#F4F3EF] text-[#52525B] hover:text-[#18181B]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subcategory Filter Buttons (All 10 Syllabus Subcategories) */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-medium text-[#52525B] mr-1">
                    Subcategory:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSubcategory('All')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                      selectedSubcategory === 'All'
                        ? 'bg-[#1E3A2F] text-white'
                        : 'bg-[#F4F3EF] text-[#52525B] hover:text-[#18181B]'
                    }`}
                  >
                    All ({availableSubcategories.length})
                  </button>
                  {availableSubcategories.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSelectedSubcategory(sub)}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                        selectedSubcategory === sub
                          ? 'bg-[#1E3A2F] text-white'
                          : 'bg-[#F4F3EF] text-[#52525B] hover:text-[#18181B]'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>

                {/* Live XPath Query Status Bar */}
                <div className="pt-3 border-t border-[#E5E4DF] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-[#52525B]">
                  <div className="flex items-center gap-2 truncate">
                    <Terminal className="w-3.5 h-3.5 text-[#1E3A2F] shrink-0" />
                    <span className="text-[#18181B] font-medium">Live XPath:</span>
                    <code className="truncate text-[#1E3A2F]">
                      {activeXPathExpression}
                    </code>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 tabular-nums">
                    <span>{filteredProducts.length} XML Nodes Matched</span>
                    <button
                      type="button"
                      onClick={() => setActiveView('webtech')}
                      className="text-[#1E3A2F] font-semibold hover:underline"
                    >
                      Inspect XML/XPath →
                    </button>
                  </div>
                </div>
              </div>

              {/* 3-Column Product Grid */}
              {filteredProducts.length === 0 ? (
                <div className="p-12 bg-white border border-[#E5E4DF] rounded-lg text-center">
                  <p className="text-base font-display font-semibold text-[#18181B]">
                    No books or stationery matched your XPath filter
                  </p>
                  <p className="mt-1 text-xs text-[#52525B]">
                    Try clearing your search term or selecting &ldquo;All Categories&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMainCategory('All');
                      setSelectedSubcategory('All');
                      setSearchQuery('');
                      setMaxPriceFilter(null);
                    }}
                    className="mt-4 px-4 py-2 text-xs font-medium bg-[#1E3A2F] text-white rounded-md"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => {
                    const isAdded = justAddedId === product.id;

                    return (
                      <article
                        key={product.id}
                        className="group bg-white border border-[#E5E4DF] rounded-lg overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-12px_rgba(24,24,27,0.12)]"
                      >
                        <div>
                          {/* Product Visual (Takes ~68% height on neutral #F4F3EF backdrop) */}
                          <div
                            onClick={() => setSelectedProduct(product)}
                            className="h-[260px] w-full border-b border-[#E5E4DF] cursor-pointer"
                          >
                            <ProductVisual product={product} size="card" />
                          </div>

                          {/* Card Body: Clean Unboxed Metadata (Zero Pills) */}
                          <div className="p-5">
                            <div className="flex items-center gap-1.5 text-xs text-[#52525B] font-mono">
                              <span>{product.category}</span>
                              <span aria-hidden="true">·</span>
                              <span>{product.subcategory}</span>
                              <span aria-hidden="true">·</span>
                              <span className="truncate">{product.semesterTag.split('·')[0]}</span>
                            </div>

                            <h3
                              onClick={() => setSelectedProduct(product)}
                              className="mt-1.5 text-base font-semibold text-[#18181B] leading-snug cursor-pointer group-hover:text-[#1E3A2F] transition-colors line-clamp-2"
                            >
                              {product.title}
                            </h3>

                            <p className="mt-1 text-xs text-[#52525B] truncate">
                              {product.authorOrBrand} · {product.bindingOrMaterial}
                            </p>
                          </div>
                        </div>

                        {/* Card Footer: Tabular Price + Actions */}
                        <div className="px-5 py-3.5 bg-[#FBFBF9] border-t border-[#E5E4DF] flex items-center justify-between gap-3">
                          <div className="font-mono tabular-nums">
                            <span className="text-[15px] font-semibold text-[#18181B]">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            {product.originalPrice && (
                              <span className="ml-2 text-xs text-[#71717A] line-through">
                                ₹{product.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedProduct(product)}
                              className="px-2.5 py-1.5 text-xs font-medium text-[#18181B] bg-[#F4F3EF] hover:bg-[#E5E4DF] rounded transition-colors whitespace-nowrap"
                            >
                              Details
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddProductToCart(product, 1)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#14281D] rounded transition-colors whitespace-nowrap inline-flex items-center gap-1"
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  Added
                                </>
                              ) : (
                                'Add to Bag'
                              )}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* VIEW 2: DEDICATED STUDENT COMBOS VIEW */}
        {activeView === 'combos' && (
          <section className="max-w-[1200px] mx-auto px-6 py-12">
            <div className="border-b border-[#E5E4DF] pb-8 mb-10">
              <p className="text-xs font-mono text-[#1E3A2F] mb-2">
                Standout Project Feature · Curated Semester Bundles
              </p>
              <h1 className="text-3xl font-display font-semibold text-[#18181B]">
                Student Combo Kits &amp; Practical Lab Bundles
              </h1>
              <p className="mt-2 text-sm text-[#52525B] max-w-2xl leading-relaxed">
                Specially assembled for engineering &amp; science students so you get every required
                lab record book, lecture notebook, calculator, pen set, and manual in a single click.
              </p>
            </div>

            <div className="space-y-8">
              {STUDENT_COMBOS.map((combo) => {
                const savings = combo.regularPrice - combo.comboPrice;
                const isAdded = justAddedId === combo.id;

                return (
                  <div
                    key={combo.id}
                    className="bg-white border border-[#E5E4DF] rounded-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12"
                  >
                    <div className="lg:col-span-5 bg-[#F4F3EF] border-b lg:border-b-0 lg:border-r border-[#E5E4DF] min-h-[280px]">
                      {!comboImgFailed[combo.id] ? (
                        <img
                          src={combo.imageUrl}
                          alt={combo.title}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setComboImgFailed((prev) => ({
                              ...prev,
                              [combo.id]: true,
                            }))
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full p-8 bg-[#1E3A2F] text-white flex flex-col justify-between">
                          <span className="font-mono text-xs">{combo.targetGroup}</span>
                          <p className="font-display text-2xl font-semibold">{combo.title}</p>
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-mono text-[#52525B]">
                          {combo.targetGroup} · Bundle Code: {combo.id.toUpperCase()}
                        </p>
                        <h2 className="mt-1 text-2xl font-display font-semibold text-[#18181B]">
                          {combo.title}
                        </h2>
                        <p className="mt-1 text-sm font-medium text-[#1E3A2F]">
                          {combo.subtitle}
                        </p>
                        <p className="mt-3 text-sm text-[#3F3F46] leading-relaxed">
                          {combo.description}
                        </p>

                        <div className="mt-5 pt-4 border-t border-[#E5E4DF]">
                          <p className="text-xs font-semibold text-[#18181B] mb-2.5">
                            Complete Itemized Contents:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {combo.items.map((item) => (
                              <div
                                key={item.productId}
                                className="p-2.5 bg-[#FBFBF9] border border-[#E5E4DF] rounded text-xs text-[#18181B]"
                              >
                                {item.label}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-5 border-t border-[#E5E4DF] flex flex-wrap items-center justify-between gap-4">
                        <div className="font-mono tabular-nums">
                          <span className="text-2xl font-semibold text-[#18181B]">
                            ₹{combo.comboPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="ml-2.5 text-sm text-[#71717A] line-through">
                            ₹{combo.regularPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="ml-3 text-xs text-[#1E3A2F] font-semibold">
                            Save ₹{savings}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddComboToCart(combo)}
                          className="px-6 py-3 text-xs font-semibold bg-[#1E3A2F] text-white rounded-md hover:bg-[#14281D] transition-colors inline-flex items-center gap-2"
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-4 h-4" />
                              Added to Shopping Bag
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4" />
                              Add Complete Combo Kit to Bag
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* VIEW 3: STUDENT ORDER HISTORY */}
        {activeView === 'orders' && (
          <StudentOrdersView
            orders={orders}
            currentUser={currentUser}
            onBackToCatalog={() => setActiveView('storefront')}
            onReorderItems={handleReorder}
          />
        )}

        {/* VIEW 4: ADMIN MODULE CONSOLE */}
        {activeView === 'admin' && (
          <AdminDashboardView
            currentUser={currentUser}
            onQuickAdminLogin={() => {
              const admin = DEMO_USERS[1];
              setCurrentUser(admin);
              rememberUserCredentialsCookie(admin.name, admin.email);
            }}
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            categories={categories}
            onAddSubcategory={handleAddSubcategory}
            onDeleteSubcategory={handleDeleteSubcategory}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {/* VIEW 5: WEB TECHNOLOGY SYLLABUS WORKBENCH (XML, XPATH, SERVLETS, JSP, SESSIONS, COOKIES) */}
        {activeView === 'webtech' && (
          <WebTechSyllabusView
            products={products}
            categories={categories}
            currentUser={currentUser}
            cart={cart}
            activeStoreXPath={activeXPathExpression}
          />
        )}
      </main>

      {/* QUIET EDITORIAL FOOTER */}
      <footer className="border-t border-[#E5E4DF] bg-[#F4F3EF] mt-16">
        <div className="max-w-[1200px] mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-[#52525B]">
          <div>
            <p className="font-display font-semibold text-sm text-[#18181B]">
              Folio &amp; Form — Student Book and Stationery Online Shopping System
            </p>
            <p className="mt-1">
              Academic Textbooks · Practical Lab Records · Engineering Instruments · Student Combo Kits
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => setActiveView('storefront')}
              className="hover:text-[#18181B]"
            >
              Store Catalog
            </button>
            <button
              type="button"
              onClick={() => setActiveView('combos')}
              className="hover:text-[#18181B]"
            >
              Student Combos
            </button>
            <button
              type="button"
              onClick={() => setActiveView('orders')}
              className="hover:text-[#18181B]"
            >
              My Orders
            </button>
            <button
              type="button"
              onClick={() => setActiveView('admin')}
              className="hover:text-[#18181B]"
            >
              Admin Console
            </button>
            <button
              type="button"
              onClick={() => setActiveView('webtech')}
              className="hover:text-[#18181B]"
            >
              XML &amp; XPath Workbench
            </button>
          </div>
        </div>
      </footer>

      {/* CONTIGUOUS PURCHASE MODULE (PRODUCT DETAIL MODAL) */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddProductToCart}
        onBuyNow={handleBuyProductNow}
      />

      {/* SLIDE-OVER SHOPPING BAG & CHECKOUT DRAWER */}
      <CartCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCart([])}
        currentUser={currentUser}
        onPlaceOrder={handlePlaceOrder}
        onViewOrders={() => setActiveView('orders')}
      />

      {/* STUDENT / ADMIN LOGIN & REGISTRATION MODAL */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => setCurrentUser(user)}
        onLogout={() => setCurrentUser(null)}
      />
    </div>
  );
}
