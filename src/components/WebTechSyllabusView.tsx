import React, { useState, useMemo } from 'react';
import { CartItem, CategoryTree, Product, User } from '../types/store';
import {
  buildCatalogXmlString,
  evaluateXPathOnCatalog,
} from '../utils/xmlXpathEngine';
import {
  getActiveSessionId,
  getRememberedPreferences,
  setBrowserCookie,
} from '../utils/sessionCookieManager';
import { Copy, Check, Play, Terminal, FileCode, Database, Cookie } from 'lucide-react';

interface WebTechSyllabusViewProps {
  products: Product[];
  categories: CategoryTree;
  currentUser: User | null;
  cart: CartItem[];
  activeStoreXPath: string;
  onNavigateToCatalogWithXPath?: (category: 'All' | 'Books' | 'Stationery', subcategory: string, search: string) => void;
}

const PRESET_XPATH_QUERIES = [
  {
    label: 'All Web Technology Books',
    xpath: "//campusStoreCatalog/products/product[category='Books' and subcategory='Web Technology']",
  },
  {
    label: 'Stationery Under ₹200',
    xpath: "//campusStoreCatalog/products/product[category='Stationery' and price < 200]",
  },
  {
    label: 'All Programming & Database Books',
    xpath: "//campusStoreCatalog/products/product[subcategory='Programming' or subcategory='Database']",
  },
  {
    label: 'Extract Only Product Titles (Under ₹550)',
    xpath: '//campusStoreCatalog/products/product[price <= 550]/title',
  },
  {
    label: 'Count Total Products in XML',
    xpath: 'count(//campusStoreCatalog/products/product)',
  },
];

export const WebTechSyllabusView: React.FC<WebTechSyllabusViewProps> = ({
  products,
  categories,
  currentUser,
  cart,
  activeStoreXPath,
}) => {
  const [activeTab, setActiveTab] = useState<'xpath' | 'session' | 'servlet'>('xpath');
  const [customXPath, setCustomXPath] = useState<string>(
    activeStoreXPath || PRESET_XPATH_QUERIES[0].xpath
  );
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);
  const [cookieRefreshTick, setCookieRefreshTick] = useState(0);

  const xmlDocumentString = useMemo(
    () => buildCatalogXmlString(products, categories),
    [products, categories]
  );

  const xpathEvaluation = useMemo(
    () => evaluateXPathOnCatalog(xmlDocumentString, customXPath),
    [xmlDocumentString, customXPath]
  );

  const cookieState = useMemo(() => {
    void cookieRefreshTick;
    return getRememberedPreferences();
  }, [cookieRefreshTick]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBlock(id);
    setTimeout(() => setCopiedBlock(null), 1800);
  };

  const servletReferenceCode = `// ProductXPathServlet.java — Java Servlet + XML + XPath Filter Controller
package com.campusstore.controller;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.*;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

@WebServlet("/api/products")
public class ProductXPathServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String category = request.getParameter("category");
        String subcategory = request.getParameter("subcategory");
        String search = request.getParameter("q");

        // Store recent category preference in HTTP Cookie (14 days)
        if (category != null && !category.isEmpty()) {
            Cookie prefCookie = new Cookie("folio_recent_category", category);
            prefCookie.setMaxAge(14 * 24 * 60 * 60);
            response.addCookie(prefCookie);
        }

        try {
            String xmlPath = getServletContext().getRealPath("/WEB-INF/catalog.xml");
            Document doc = DocumentBuilderFactory.newInstance()
                    .newDocumentBuilder().parse(xmlPath);
            XPath xpath = XPathFactory.newInstance().newXPath();

            String expr = "${customXPath.replace(/"/g, '\\"')}";
            NodeList matchedNodes = (NodeList) xpath.evaluate(
                    expr, doc, XPathConstants.NODESET);

            request.setAttribute("productsNodeList", matchedNodes);
            request.setAttribute("executedXPath", expr);
            request.getRequestDispatcher("/catalog.jsp").forward(request, response);
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }
}`;

  const jspSessionCartCode = `<%-- cart.jsp — JSP Session Cart & Cookie Preference View --%>
<%@ page import="java.util.*, com.campusstore.model.CartItem" %>
<%@ page session="true" contentType="text/html;charset=UTF-8" %>
<%
    // Retrieve active Student Session & Cart
    String studentName = (String) session.getAttribute("studentName");
    List<CartItem> cart = (List<CartItem>) session.getAttribute("shoppingCart");
    if (cart == null) {
        cart = new ArrayList<>();
        session.setAttribute("shoppingCart", cart);
    }

    // Read remembered username cookie if session is new
    String rememberedUser = "";
    Cookie[] cookies = request.getCookies();
    if (cookies != null) {
        for (Cookie c : cookies) {
            if ("folio_remembered_user".equals(c.getName())) {
                rememberedUser = java.net.URLDecoder.decode(c.getValue(), "UTF-8");
            }
        }
    }
%>
<div class="cart-summary">
    <h2>Shopping Bag for <%= (studentName != null) ? studentName : rememberedUser %></h2>
    <p>Session ID: <%= session.getId() %> · Total Items: <%= cart.size() %></p>
</div>`;

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="border-b border-[#E5E4DF] pb-8 mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-mono text-[#52525B] mb-2">
            Web Technology Micro-Project · Live Architecture Workbench
          </p>
          <h1 className="text-3xl font-display font-semibold tracking-tight text-[#18181B]">
            Syllabus Implementation & Live XML / XPath Inspector
          </h1>
          <p className="mt-2 text-[15px] text-[#52525B] max-w-2xl leading-relaxed">
            Every store action executes real client-side XML serialization, XPath 1.0 DOM querying,
            browser cookie persistence, and session cart management. Use this workbench during your
            project demonstration to inspect live queries and export reference Servlet/JSP code.
          </p>
        </div>

        {/* Interactive Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#F4F3EF] border border-[#E5E4DF] rounded-lg self-start">
          <button
            type="button"
            onClick={() => setActiveTab('xpath')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'xpath'
                ? 'bg-[#18181B] text-white'
                : 'text-[#52525B] hover:text-[#18181B]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            XML & XPath Engine
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('session')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'session'
                ? 'bg-[#18181B] text-white'
                : 'text-[#52525B] hover:text-[#18181B]'
            }`}
          >
            <Cookie className="w-3.5 h-3.5" />
            Sessions, Cookies & AJAX
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('servlet')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'servlet'
                ? 'bg-[#18181B] text-white'
                : 'text-[#52525B] hover:text-[#18181B]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Servlet & JSP Code
          </button>
        </div>
      </div>

      {/* Syllabus Mapping Matrix */}
      <div className="mb-10 border border-[#E5E4DF] rounded-lg bg-white overflow-hidden">
        <div className="px-5 py-3.5 bg-[#F4F3EF] border-b border-[#E5E4DF] flex items-center justify-between">
          <span className="text-xs font-semibold text-[#18181B]">
            10-Point Web Technology Syllabus Coverage Matrix
          </span>
          <span className="text-xs font-mono text-[#52525B] tabular-nums">
            {products.length} Active XML Nodes · {Object.values(categories).flat().length} Subcategories
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#E5E4DF]">
          <div className="p-4">
            <p className="text-xs font-mono font-semibold text-[#1E3A2F]">01. HTML5 & CSS3</p>
            <p className="mt-1 text-xs text-[#52525B] leading-relaxed">
              Semantic registration, login, product filter, and checkout forms styled with responsive grid architecture.
            </p>
          </div>
          <div className="p-4">
            <p className="text-xs font-mono font-semibold text-[#1E3A2F]">02. JavaScript & AJAX</p>
            <p className="mt-1 text-xs text-[#52525B] leading-relaxed">
              Instant non-reloading catalog search, form validation, quantity steppers, and combo discount math.
            </p>
          </div>
          <div className="p-4">
            <p className="text-xs font-mono font-semibold text-[#1E3A2F]">03. XML & XPath 1.0</p>
            <p className="mt-1 text-xs text-[#52525B] leading-relaxed">
              Live DOMParser XML catalog with real browser <code className="font-mono">document.evaluate()</code> XPath filtering.
            </p>
          </div>
          <div className="p-4">
            <p className="text-xs font-mono font-semibold text-[#1E3A2F]">04. HTTP Sessions</p>
            <p className="mt-1 text-xs text-[#52525B] leading-relaxed">
              Persistent session state tracking student/admin authentication and live itemized shopping bag.
            </p>
          </div>
          <div className="p-4">
            <p className="text-xs font-mono font-semibold text-[#1E3A2F]">05. Browser Cookies</p>
            <p className="mt-1 text-xs text-[#52525B] leading-relaxed">
              Real <code className="font-mono">document.cookie</code> storage for remembered student login and recent category filters.
            </p>
          </div>
        </div>
      </div>

      {/* TAB 1: Live XML & XPath Evaluator */}
      {activeTab === 'xpath' && (
        <div className="space-y-6">
          <div className="p-5 bg-white border border-[#E5E4DF] rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <label
                htmlFor="xpath-input"
                className="text-sm font-semibold text-[#18181B] flex items-center gap-2"
              >
                <Terminal className="w-4 h-4 text-[#1E3A2F]" />
                Interactive XPath 1.0 Query Evaluator (Runs against Live XML Catalog)
              </label>
              <span className="text-xs font-mono text-[#52525B] tabular-nums">
                {xpathEvaluation.error
                  ? 'Syntax Error'
                  : `${xpathEvaluation.matchedXmlNodes.length} XML Result Node(s) Matched`}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="xpath-input"
                type="text"
                value={customXPath}
                onChange={(e) => setCustomXPath(e.target.value)}
                className="flex-1 font-mono text-xs px-3.5 py-2.5 bg-[#FBFBF9] border border-[#D4D3CD] rounded-md text-[#18181B] focus:outline-none focus:border-[#1E3A2F]"
                placeholder="Enter an XPath 1.0 expression, e.g. //campusStoreCatalog/products/product[price < 500]"
              />
              <button
                type="button"
                onClick={() => handleCopy('xpath-expr', customXPath)}
                className="px-4 py-2.5 text-xs font-medium bg-[#1E3A2F] text-white rounded-md hover:bg-[#14281D] transition-colors whitespace-nowrap flex items-center justify-center gap-1.5"
              >
                {copiedBlock === 'xpath-expr' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied XPath
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy XPath
                  </>
                )}
              </button>
            </div>

            {/* Preset Query Buttons */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#52525B] mr-1">Sample Queries:</span>
              {PRESET_XPATH_QUERIES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setCustomXPath(preset.xpath)}
                  className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors whitespace-nowrap flex items-center gap-1 ${
                    customXPath === preset.xpath
                      ? 'bg-[#1E3A2F] text-white border-[#1E3A2F]'
                      : 'bg-[#F4F3EF] text-[#18181B] border-[#E5E4DF] hover:border-[#18181B]'
                  }`}
                >
                  <Play className="w-2.5 h-2.5" />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Split View: Left = Live XML Source, Right = XPath Evaluation Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* XML Source */}
            <div className="border border-[#E5E4DF] rounded-lg bg-white overflow-hidden flex flex-col">
              <div className="px-4 py-3 bg-[#F4F3EF] border-b border-[#E5E4DF] flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-[#18181B]">
                  /WEB-INF/catalog.xml (Live Store XML Document)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy('xml-doc', xmlDocumentString)}
                  className="text-xs font-medium text-[#1E3A2F] hover:underline flex items-center gap-1"
                >
                  {copiedBlock === 'xml-doc' ? 'Copied XML' : 'Copy Full XML'}
                </button>
              </div>
              <pre className="p-4 text-[11.5px] font-mono text-[#27272A] bg-[#FBFBF9] overflow-auto max-h-[420px] leading-relaxed">
                {xmlDocumentString}
              </pre>
            </div>

            {/* XPath Output */}
            <div className="border border-[#E5E4DF] rounded-lg bg-white overflow-hidden flex flex-col">
              <div className="px-4 py-3 bg-[#F4F3EF] border-b border-[#E5E4DF] flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-[#18181B]">
                  XPathResult Output ({xpathEvaluation.matchedXmlNodes.length} matches)
                </span>
                <span className="text-xs font-mono text-[#52525B]">
                  DOMParser + document.evaluate()
                </span>
              </div>
              <div className="p-4 bg-[#FBFBF9] overflow-auto max-h-[420px] flex-1">
                {xpathEvaluation.error ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded text-xs font-mono text-red-800">
                    {xpathEvaluation.error}
                  </div>
                ) : xpathEvaluation.matchedXmlNodes.length === 0 ? (
                  <p className="text-xs font-mono text-[#52525B]">
                    No XML nodes matched the current XPath expression.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {xpathEvaluation.matchedXmlNodes.map((nodeXml, idx) => (
                      <pre
                        key={idx}
                        className="p-3 bg-white border border-[#E5E4DF] rounded text-[11.5px] font-mono text-[#18181B] overflow-x-auto leading-relaxed"
                      >
                        {nodeXml}
                      </pre>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Sessions, Cookies & AJAX State */}
      {activeTab === 'session' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active HTTP Session Inspector */}
          <div className="border border-[#E5E4DF] rounded-lg bg-white p-6">
            <h2 className="text-lg font-display font-semibold text-[#18181B] mb-1">
              Active HTTP Session State (sessionStorage)
            </h2>
            <p className="text-xs text-[#52525B] mb-4">
              Demonstrates syllabus requirement: &ldquo;Sessions: User login and shopping cart&rdquo;
            </p>

            <div className="space-y-3 text-xs font-mono bg-[#FBFBF9] p-4 rounded-md border border-[#E5E4DF]">
              <div className="flex justify-between py-1 border-b border-[#E5E4DF]">
                <span className="text-[#52525B]">Session ID:</span>
                <span className="font-semibold text-[#18181B]">{getActiveSessionId()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E5E4DF]">
                <span className="text-[#52525B]">Authenticated Role:</span>
                <span className="font-semibold text-[#1E3A2F]">
                  {currentUser ? `${currentUser.role.toUpperCase()} (${currentUser.name})` : 'GUEST'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E5E4DF]">
                <span className="text-[#52525B]">Roll Number / ID:</span>
                <span className="text-[#18181B]">{currentUser?.rollNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#52525B]">Session Cart Payload:</span>
                <span className="text-[#18181B] tabular-nums">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} item(s) in session
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-[#18181B] mb-2">
              Serialized Session Cart JSON:
            </p>
            <pre className="p-3 bg-[#F4F3EF] rounded text-[11px] font-mono text-[#18181B] overflow-auto max-h-[200px]">
              {JSON.stringify(cart, null, 2)}
            </pre>
          </div>

          {/* Browser Cookie Inspector */}
          <div className="border border-[#E5E4DF] rounded-lg bg-white p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-display font-semibold text-[#18181B]">
                Browser Cookies Inspector (document.cookie)
              </h2>
              <button
                type="button"
                onClick={() => {
                  setBrowserCookie('folio_recent_category', 'Web Technology', 14);
                  setCookieRefreshTick((t) => t + 1);
                }}
                className="px-3 py-1.5 text-xs font-medium bg-[#F4F3EF] hover:bg-[#E5E4DF] text-[#18181B] rounded transition-colors"
              >
                Write Test Cookie
              </button>
            </div>
            <p className="text-xs text-[#52525B] mb-4">
              Demonstrates syllabus requirement: &ldquo;Cookies: Remember username/recent preferences&rdquo;
            </p>

            <div className="space-y-3 text-xs font-mono bg-[#FBFBF9] p-4 rounded-md border border-[#E5E4DF]">
              <div className="flex justify-between py-1 border-b border-[#E5E4DF]">
                <span className="text-[#52525B]">folio_remembered_user:</span>
                <span className="font-semibold text-[#18181B]">
                  {cookieState.rememberedName || '(not set)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E5E4DF]">
                <span className="text-[#52525B]">folio_remembered_email:</span>
                <span className="text-[#18181B]">
                  {cookieState.rememberedEmail || '(not set)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E5E4DF]">
                <span className="text-[#52525B]">folio_recent_category:</span>
                <span className="text-[#1E3A2F] font-semibold">
                  {cookieState.recentCategory || 'All Categories'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#52525B]">folio_recent_search:</span>
                <span className="text-[#18181B]">
                  {cookieState.recentSearch || '(none)'}
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-[#18181B] mb-2">
              Raw Browser <code className="font-mono">document.cookie</code> String:
            </p>
            <pre className="p-3 bg-[#F4F3EF] rounded text-[11px] font-mono text-[#18181B] overflow-x-auto whitespace-pre-wrap break-all">
              {cookieState.rawCookieHeader}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: Reference Java Servlet & JSP Code */}
      {activeTab === 'servlet' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-[#E5E4DF] rounded-lg bg-white overflow-hidden">
            <div className="px-4 py-3 bg-[#F4F3EF] border-b border-[#E5E4DF] flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-[#18181B]">
                ProductXPathServlet.java (Java Servlet + XPath + Cookie)
              </span>
              <button
                type="button"
                onClick={() => handleCopy('servlet-code', servletReferenceCode)}
                className="text-xs font-medium text-[#1E3A2F] hover:underline"
              >
                {copiedBlock === 'servlet-code' ? 'Copied' : 'Copy Code'}
              </button>
            </div>
            <pre className="p-4 text-[11.5px] font-mono text-[#18181B] bg-[#FBFBF9] overflow-auto max-h-[420px] leading-relaxed">
              {servletReferenceCode}
            </pre>
          </div>

          <div className="border border-[#E5E4DF] rounded-lg bg-white overflow-hidden">
            <div className="px-4 py-3 bg-[#F4F3EF] border-b border-[#E5E4DF] flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-[#18181B]">
                cart.jsp (JSP Session Cart & Cookie Reader)
              </span>
              <button
                type="button"
                onClick={() => handleCopy('jsp-code', jspSessionCartCode)}
                className="text-xs font-medium text-[#1E3A2F] hover:underline"
              >
                {copiedBlock === 'jsp-code' ? 'Copied' : 'Copy Code'}
              </button>
            </div>
            <pre className="p-4 text-[11.5px] font-mono text-[#18181B] bg-[#FBFBF9] overflow-auto max-h-[420px] leading-relaxed">
              {jspSessionCartCode}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
};
