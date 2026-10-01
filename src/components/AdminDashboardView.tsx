import React, { useState } from 'react';
import {
  CategoryTree,
  MainCategory,
  Order,
  OrderStatus,
  Product,
  User,
} from '../types/store';
import { Plus, Edit3, Trash2, Check, X, Package, FolderTree, ShoppingBag } from 'lucide-react';

interface AdminDashboardViewProps {
  currentUser: User | null;
  onQuickAdminLogin: () => void;
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  categories: CategoryTree;
  onAddSubcategory: (mainCategory: MainCategory, subcategory: string) => void;
  onDeleteSubcategory: (mainCategory: MainCategory, subcategory: string) => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
}

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  'Order Placed',
  'Packed at Campus Store',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const COVER_PALETTES = [
  { bgHex: '#1E3A2F', accentHex: '#D4A373', textHex: '#FBFBF9' },
  { bgHex: '#1D2D44', accentHex: '#748CAB', textHex: '#F0EBD8' },
  { bgHex: '#4A154B', accentHex: '#ECB22E', textHex: '#FBFBF9' },
  { bgHex: '#0F4C5C', accentHex: '#E36414', textHex: '#FBFBF9' },
  { bgHex: '#2F3E46', accentHex: '#CAD2C5', textHex: '#FBFBF9' },
];

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  onQuickAdminLogin,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  categories,
  onAddSubcategory,
  onDeleteSubcategory,
  orders,
  onUpdateOrderStatus,
}) => {
  const [activeSection, setActiveSection] = useState<'products' | 'categories' | 'orders'>('products');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Product Form State
  const [title, setTitle] = useState('');
  const [authorOrBrand, setAuthorOrBrand] = useState('');
  const [category, setCategory] = useState<MainCategory>('Books');
  const [subcategory, setSubcategory] = useState<string>(categories.Books[0] || 'Programming');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [semesterTag, setSemesterTag] = useState('All Semesters');
  const [bindingOrMaterial, setBindingOrMaterial] = useState('Paperback · 420 Pages');
  const [description, setDescription] = useState('');

  // Category Form State
  const [newSubcatMain, setNewSubcatMain] = useState<MainCategory>('Books');
  const [newSubcatName, setNewSubcatName] = useState('');
  const [catFeedback, setCatFeedback] = useState<string | null>(null);

  // If user is not logged in as admin, offer a 1-click Admin Login gate
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <section className="max-w-[720px] mx-auto px-6 py-16">
        <div className="bg-white border border-[#E5E4DF] rounded-lg p-8">
          <p className="text-xs font-mono text-[#52525B] mb-2">
            Admin Module · Restricted Access
          </p>
          <h1 className="text-2xl font-display font-semibold text-[#18181B]">
            Campus Store Administrator Console
          </h1>
          <p className="mt-2 text-sm text-[#52525B] leading-relaxed">
            You are currently browsing as{' '}
            <span className="font-semibold text-[#18181B]">
              {currentUser ? `${currentUser.name} (Student)` : 'Guest'}
            </span>
            . Switch to the Faculty Store Administrator session to add/edit/delete products,
            manage book & stationery categories, and update student order statuses.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onQuickAdminLogin}
              className="px-5 py-2.5 text-xs font-medium bg-[#1E3A2F] text-white rounded-md hover:bg-[#14281D] transition-colors whitespace-nowrap"
            >
              Authenticate as Store Admin (1-Click Demo)
            </button>
          </div>
        </div>
      </section>
    );
  }

  const openAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setAuthorOrBrand('');
    setCategory('Books');
    setSubcategory(categories.Books[0] || 'Programming');
    setSku(`ISBN-978-81-${Math.floor(1000 + Math.random() * 9000)}`);
    setPrice('450');
    setStock('25');
    setSemesterTag('Semester V · Core');
    setBindingOrMaterial('Paperback · 520 Pages');
    setDescription('');
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setTitle(product.title);
    setAuthorOrBrand(product.authorOrBrand);
    setCategory(product.category);
    setSubcategory(product.subcategory);
    setSku(product.sku);
    setPrice(String(product.price));
    setStock(String(product.stock));
    setSemesterTag(product.semesterTag);
    setBindingOrMaterial(product.bindingOrMaterial);
    setDescription(product.description);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleCategoryChangeInForm = (newCat: MainCategory) => {
    setCategory(newCat);
    const availableSubs = categories[newCat];
    setSubcategory(availableSubs[0] || '');
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !authorOrBrand.trim() || !sku.trim()) {
      setFormError('Please provide Product Title, Author/Brand, and SKU/ISBN.');
      return;
    }
    const numericPrice = Number(price);
    const numericStock = Number(stock);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setFormError('Price must be a valid positive number.');
      return;
    }
    if (isNaN(numericStock) || numericStock < 0) {
      setFormError('Stock quantity must be zero or greater.');
      return;
    }

    const palette =
      COVER_PALETTES[products.length % COVER_PALETTES.length];

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        title: title.trim(),
        authorOrBrand: authorOrBrand.trim(),
        category,
        subcategory,
        sku: sku.trim(),
        price: numericPrice,
        stock: numericStock,
        semesterTag: semesterTag.trim() || 'All Semesters',
        bindingOrMaterial: bindingOrMaterial.trim() || 'Standard Campus Edition',
        description:
          description.trim() ||
          'Approved university textbook and stationery supply item.',
      };
      onUpdateProduct(updated);
    } else {
      const newProduct: Product = {
        id: `prd-${Date.now()}`,
        sku: sku.trim(),
        title: title.trim(),
        authorOrBrand: authorOrBrand.trim(),
        category,
        subcategory,
        price: numericPrice,
        originalPrice: Math.round(numericPrice * 1.15),
        stock: numericStock,
        semesterTag: semesterTag.trim() || 'All Semesters',
        bindingOrMaterial: bindingOrMaterial.trim() || 'Standard Campus Edition',
        description:
          description.trim() ||
          'Approved university textbook and stationery supply item.',
        specs: {
          CatalogCode: sku.trim(),
          Category: `${category} / ${subcategory}`,
          Availability: 'Campus Store Inventory',
        },
        coverStyle: {
          ...palette,
          editionLabel: 'CAMPUS EDITION · 2026',
          codeLabel: sku.trim().slice(0, 8).toUpperCase(),
        },
      };
      onAddProduct(newProduct);
    }

    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleAddSubcatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newSubcatName.trim();
    if (!cleaned) return;
    if (categories[newSubcatMain].some((s) => s.toLowerCase() === cleaned.toLowerCase())) {
      setCatFeedback(`Subcategory "${cleaned}" already exists under ${newSubcatMain}.`);
      return;
    }
    onAddSubcategory(newSubcatMain, cleaned);
    setNewSubcatName('');
    setCatFeedback(`Added "${cleaned}" to ${newSubcatMain} XML hierarchy.`);
    setTimeout(() => setCatFeedback(null), 3000);
  };

  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-10">
      {/* Header & Admin Summary Metrics */}
      <div className="border-b border-[#E5E4DF] pb-8 mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-mono text-[#52525B] mb-2">
            Admin Module · {currentUser.name} · {currentUser.rollNumber}
          </p>
          <h1 className="text-3xl font-display font-semibold tracking-tight text-[#18181B]">
            Inventory, Category & Order Management
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#52525B] font-mono tabular-nums">
            <span>{products.length} Active SKUs</span>
            <span aria-hidden="true">·</span>
            <span>
              {categories.Books.length + categories.Stationery.length} Subcategories
            </span>
            <span aria-hidden="true">·</span>
            <span>{orders.length} Customer Orders</span>
            <span aria-hidden="true">·</span>
            <span>Total Volume: ₹{totalRevenue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#F4F3EF] border border-[#E5E4DF] rounded-lg self-start">
          <button
            type="button"
            onClick={() => setActiveSection('products')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'products'
                ? 'bg-[#18181B] text-white'
                : 'text-[#52525B] hover:text-[#18181B]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Products ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('categories')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'categories'
                ? 'bg-[#18181B] text-white'
                : 'text-[#52525B] hover:text-[#18181B]'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            Categories ({categories.Books.length + categories.Stationery.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('orders')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'orders'
                ? 'bg-[#18181B] text-white'
                : 'text-[#52525B] hover:text-[#18181B]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Customer Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* SECTION 1: MANAGE PRODUCTS (ADD / EDIT / DELETE) */}
      {activeSection === 'products' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-display font-semibold text-[#18181B]">
                Product Catalog Table
              </h2>
              <p className="text-xs text-[#52525B]">
                Changes immediately sync with the store&apos;s XML document and XPath filter engine.
              </p>
            </div>
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 text-xs font-medium bg-[#1E3A2F] text-white rounded-md hover:bg-[#14281D] transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Product
            </button>
          </div>

          {/* Add / Edit Product Form Panel */}
          {isFormOpen && (
            <form
              onSubmit={handleSaveProduct}
              className="mb-8 p-6 bg-white border border-[#18181B] rounded-lg"
            >
              <div className="flex items-center justify-between border-b border-[#E5E4DF] pb-4 mb-5">
                <h3 className="text-base font-display font-semibold text-[#18181B]">
                  {editingProduct ? `Edit Product: ${editingProduct.title}` : 'Add New Book or Stationery Item'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-xs text-[#52525B] hover:text-[#18181B] flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Close
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[#18181B] mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Compiler Design: Principles, Techniques & Tools"
                    className="w-full px-3 py-2 text-sm bg-[#FBFBF9] border border-[#D4D3CD] rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#18181B] mb-1">
                    SKU / ISBN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="ISBN-978-81-..."
                    className="w-full px-3 py-2 text-sm font-mono bg-[#FBFBF9] border border-[#D4D3CD] rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#18181B] mb-1">
                    Author / Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorOrBrand}
                    onChange={(e) => setAuthorOrBrand(e.target.value)}
                    placeholder="e.g. Alfred V. Aho / Staedtler"
                    className="w-full px-3 py-2 text-sm bg-[#FBFBF9] border border-[#D4D3CD] rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#18181B] mb-1">
                    Main Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      handleCategoryChangeInForm(e.target.value as MainCategory)
                    }
                    className="w-full px-3 py-2 text-sm bg-[#FBFBF9] border border-[#D4D3CD] rounded-md"
                  >
                    <option value="Books">Books</option>
                    <option value="Stationery">Stationery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#18181B] mb-1">
                    Subcategory *
                  </label>
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FBFBF9] border border-[#D4D3CD] rounded-md"
                  >
                    {categories[category].map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#18181B] mb-1">
                    Unit Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-[#FBFBF9] border border-[#D4D3CD] rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#18181B] mb-1">
                    Available Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-[#FBFBF9] border border-[#D4D3CD] rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#18181B] mb-1">
                    Binding / Material Spec
                  </label>
                  <input
                    type="text"
                    value={bindingOrMaterial}
                    onChange={(e) => setBindingOrMaterial(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FBFBF9] border border-[#D4D3CD] rounded-md"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-[#18181B] mb-1">
                    Syllabus & Product Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed syllabus coverage or stationery technical specifications..."
                    className="w-full px-3 py-2 text-sm bg-[#FBFBF9] border border-[#D4D3CD] rounded-md"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#52525B] hover:text-[#18181B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium bg-[#1E3A2F] text-white rounded-md hover:bg-[#14281D] transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  {editingProduct ? 'Save Product Changes' : 'Create Product in XML Catalog'}
                </button>
              </div>
            </form>
          )}

          {/* Products Table */}
          <div className="bg-white border border-[#E5E4DF] rounded-lg overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E4DF] bg-[#F4F3EF] text-[11px] font-mono text-[#52525B]">
                  <th className="py-3 px-4">SKU / ISBN</th>
                  <th className="py-3 px-4">Product Title & Author/Brand</th>
                  <th className="py-3 px-4">Category · Subcategory</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-right">Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E4DF] text-sm">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#FBFBF9] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-[#52525B] whitespace-nowrap">
                      {prod.sku}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-[#18181B]">{prod.title}</p>
                      <p className="text-xs text-[#52525B]">{prod.authorOrBrand}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#52525B] whitespace-nowrap">
                      {prod.category} · {prod.subcategory}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-medium text-[#18181B] whitespace-nowrap">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs whitespace-nowrap">
                      <span
                        className={
                          prod.stock > 10 ? 'text-[#1E3A2F]' : 'text-amber-700 font-semibold'
                        }
                      >
                        {prod.stock} units
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(prod)}
                          className="px-2.5 py-1 text-xs font-medium text-[#18181B] bg-[#F4F3EF] hover:bg-[#E5E4DF] rounded transition-colors inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteProduct(prod.id)}
                          className="px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: MANAGE CATEGORIES */}
      {activeSection === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Subcategory Form */}
          <div className="bg-white border border-[#E5E4DF] rounded-lg p-6 self-start">
            <h2 className="text-lg font-display font-semibold text-[#18181B] mb-1">
              Add Subcategory
            </h2>
            <p className="text-xs text-[#52525B] mb-4">
              Extend the store&apos;s Books or Stationery taxonomy. New subcategories immediately
              appear in student filter bars.
            </p>
            {catFeedback && (
              <div className="mb-4 p-3 bg-[#F4F3EF] border border-[#1E3A2F] rounded text-xs text-[#1E3A2F]">
                {catFeedback}
              </div>
            )}
            <form onSubmit={handleAddSubcatSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#18181B] mb-1">
                  Parent Category
                </label>
                <select
                  value={newSubcatMain}
                  onChange={(e) => setNewSubcatMain(e.target.value as MainCategory)}
                  className="w-full px-3 py-2 text-sm bg-[#FBFBF9] border border-[#D4D3CD] rounded-md"
                >
                  <option value="Books">Books</option>
                  <option value="Stationery">Stationery</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#18181B] mb-1">
                  New Subcategory Name
                </label>
                <input
                  type="text"
                  required
                  value={newSubcatName}
                  onChange={(e) => setNewSubcatName(e.target.value)}
                  placeholder="e.g. Artificial Intelligence or Lab Coats"
                  className="w-full px-3 py-2 text-sm bg-[#FBFBF9] border border-[#D4D3CD] rounded-md"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-medium bg-[#1E3A2F] text-white rounded-md hover:bg-[#14281D] transition-colors"
              >
                Add to Category Tree
              </button>
            </form>
          </div>

          {/* Existing Categories List */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {(['Books', 'Stationery'] as MainCategory[]).map((mainCat) => (
              <div
                key={mainCat}
                className="bg-white border border-[#E5E4DF] rounded-lg overflow-hidden"
              >
                <div className="px-5 py-3.5 bg-[#F4F3EF] border-b border-[#E5E4DF] flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#18181B]">{mainCat}</h3>
                  <span className="text-xs font-mono text-[#52525B] tabular-nums">
                    {categories[mainCat].length} subcategories
                  </span>
                </div>
                <ul className="divide-y divide-[#E5E4DF]">
                  {categories[mainCat].map((sub) => {
                    const count = products.filter(
                      (p) => p.category === mainCat && p.subcategory === sub
                    ).length;
                    return (
                      <li
                        key={sub}
                        className="px-5 py-3 flex items-center justify-between text-sm"
                      >
                        <div>
                          <span className="font-medium text-[#18181B]">{sub}</span>
                          <span className="ml-2 text-xs font-mono text-[#52525B] tabular-nums">
                            · {count} item{count === 1 ? '' : 's'}
                          </span>
                        </div>
                        {count === 0 && (
                          <button
                            type="button"
                            onClick={() => onDeleteSubcategory(mainCat, sub)}
                            className="text-xs text-red-700 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: VIEW & UPDATE CUSTOMER ORDERS */}
      {activeSection === 'orders' && (
        <div className="space-y-4">
          <div className="mb-4">
            <h2 className="text-lg font-display font-semibold text-[#18181B]">
              Student Orders & Fulfillment Status
            </h2>
            <p className="text-xs text-[#52525B]">
              Update order statuses in real time. Students see updated status immediately in My Orders.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 bg-white border border-[#E5E4DF] rounded-lg text-center text-sm text-[#52525B]">
              No customer orders recorded yet.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-[#E5E4DF] rounded-lg p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E5E4DF] pb-4 mb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#52525B] tabular-nums">
                      <span className="font-semibold text-[#18181B]">{order.id}</span>
                      <span aria-hidden="true">·</span>
                      <span>{order.createdAt}</span>
                      <span aria-hidden="true">·</span>
                      <span>{order.paymentMethod}</span>
                    </div>
                    <p className="mt-1 text-base font-semibold text-[#18181B]">
                      {order.studentName}{' '}
                      <span className="font-normal text-xs font-mono text-[#52525B]">
                        ({order.rollNumber} · {order.department})
                      </span>
                    </p>
                    <p className="text-xs text-[#52525B] mt-0.5">
                      Delivery: {order.deliveryAddress} · Contact: {order.phone} ({order.email})
                    </p>
                  </div>

                  {/* Status Updater Control */}
                  <div className="flex items-center gap-3 self-start lg:self-center">
                    <label
                      htmlFor={`status-${order.id}`}
                      className="text-xs font-medium text-[#52525B] whitespace-nowrap"
                    >
                      Order Status:
                    </label>
                    <select
                      id={`status-${order.id}`}
                      value={order.status}
                      onChange={(e) =>
                        onUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                      }
                      className="px-3 py-1.5 text-xs font-medium bg-[#F4F3EF] border border-[#D4D3CD] rounded-md text-[#18181B] focus:outline-none focus:border-[#1E3A2F]"
                    >
                      {ORDER_STATUS_OPTIONS.map((statusOpt) => (
                        <option key={statusOpt} value={statusOpt}>
                          {statusOpt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Order Items Breakdown */}
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div
                      key={`${order.id}-${item.id}-${idx}`}
                      className="flex items-center justify-between text-xs py-1"
                    >
                      <div className="text-[#18181B]">
                        <span className="font-mono font-medium">{item.quantity}×</span>{' '}
                        <span className="font-medium">{item.title}</span>{' '}
                        <span className="text-[#52525B] font-mono">({item.sku})</span>
                      </div>
                      <span className="font-mono tabular-nums text-[#18181B]">
                        ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E4DF] flex flex-wrap items-center justify-between text-xs font-mono tabular-nums text-[#52525B]">
                  <div>
                    <span>Subtotal: ₹{order.subtotal.toLocaleString('en-IN')}</span>
                    {order.comboSavings > 0 && (
                      <span> · Combo Discount: -₹{order.comboSavings.toLocaleString('en-IN')}</span>
                    )}
                    <span>
                      {' '}
                      · Delivery: {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-[#18181B]">
                    Total Paid: ₹{order.total.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
};
