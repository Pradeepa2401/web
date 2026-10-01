import { CategoryTree, MainCategory, Product } from '../types/store';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates a well-formed XML document representing the current store catalog
 * and category hierarchy, matching the Web Technology syllabus requirement:
 * "XML: Store product/category data"
 */
export function buildCatalogXmlString(
  products: Product[],
  categories: CategoryTree
): string {
  const categoryLines: string[] = [];
  (Object.keys(categories) as MainCategory[]).forEach((mainCat) => {
    const subs = categories[mainCat]
      .map((sub) => `      <subcategory>${escapeXml(sub)}</subcategory>`)
      .join('\n');
    categoryLines.push(
      `    <category name="${escapeXml(mainCat)}">\n${subs}\n    </category>`
    );
  });

  const productLines = products
    .map(
      (p) => `    <product id="${escapeXml(p.id)}" sku="${escapeXml(p.sku)}">
      <title>${escapeXml(p.title)}</title>
      <authorOrBrand>${escapeXml(p.authorOrBrand)}</authorOrBrand>
      <category>${escapeXml(p.category)}</category>
      <subcategory>${escapeXml(p.subcategory)}</subcategory>
      <price>${p.price}</price>
      <stock>${p.stock}</stock>
      <semesterTag>${escapeXml(p.semesterTag)}</semesterTag>
      <bindingOrMaterial>${escapeXml(p.bindingOrMaterial)}</bindingOrMaterial>
    </product>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<campusStoreCatalog>
  <categories>
${categoryLines.join('\n')}
  </categories>
  <products>
${productLines}
  </products>
</campusStoreCatalog>`;
}

/**
 * Builds a valid XPath 1.0 query string from the user's active filter and search controls.
 * Demonstrates "XPath: Search/filter products from XML"
 */
export function buildXPathQuery(params: {
  mainCategory: 'All' | MainCategory;
  subcategory: string;
  searchQuery: string;
  maxPrice?: number | null;
}): string {
  const predicates: string[] = [];

  if (params.mainCategory !== 'All') {
    predicates.push(`category='${params.mainCategory}'`);
  }

  if (params.subcategory && params.subcategory !== 'All') {
    const safeSub = params.subcategory.replace(/'/g, '');
    predicates.push(`subcategory='${safeSub}'`);
  }

  if (params.maxPrice && params.maxPrice > 0) {
    predicates.push(`price <= ${params.maxPrice}`);
  }

  const trimmedSearch = params.searchQuery.trim().toLowerCase().replace(/'/g, '');
  if (trimmedSearch.length > 0) {
    predicates.push(
      `(contains(translate(title, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${trimmedSearch}') or contains(translate(subcategory, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${trimmedSearch}') or contains(translate(authorOrBrand, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${trimmedSearch}') or contains(translate(sku, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${trimmedSearch}'))`
    );
  }

  if (predicates.length === 0) {
    return '//campusStoreCatalog/products/product';
  }

  return `//campusStoreCatalog/products/product[${predicates.join(' and ')}]`;
}

/**
 * Evaluates a real XPath 1.0 query against the parsed XML DOM using browser XPathEvaluator
 * and returns matching Product IDs along with XML node serialization for inspection.
 */
export function evaluateXPathOnCatalog(
  xmlString: string,
  xpathExpression: string
): {
  matchedIds: string[];
  matchedXmlNodes: string[];
  error: string | null;
} {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      return {
        matchedIds: [],
        matchedXmlNodes: [],
        error: 'XML Parse Error: ' + parseError.textContent,
      };
    }

    const result = xmlDoc.evaluate(
      xpathExpression,
      xmlDoc,
      null,
      XPathResult.ANY_TYPE,
      null
    );

    const matchedIds: string[] = [];
    const matchedXmlNodes: string[] = [];
    const serializer = new XMLSerializer();

    if (result.resultType === XPathResult.NUMBER_TYPE) {
      matchedXmlNodes.push(String(result.numberValue));
      return { matchedIds, matchedXmlNodes, error: null };
    }
    if (result.resultType === XPathResult.STRING_TYPE) {
      matchedXmlNodes.push(result.stringValue);
      return { matchedIds, matchedXmlNodes, error: null };
    }
    if (result.resultType === XPathResult.BOOLEAN_TYPE) {
      matchedXmlNodes.push(String(result.booleanValue));
      return { matchedIds, matchedXmlNodes, error: null };
    }

    let node = result.iterateNext();
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const idAttr = el.getAttribute('id');
        if (idAttr) {
          matchedIds.push(idAttr);
        } else if (el.parentElement?.tagName === 'product') {
          const parentId = el.parentElement.getAttribute('id');
          if (parentId && !matchedIds.includes(parentId)) {
            matchedIds.push(parentId);
          }
        }
        matchedXmlNodes.push(serializer.serializeToString(el));
      } else if (node.nodeValue) {
        matchedXmlNodes.push(node.nodeValue);
      }
      node = result.iterateNext();
    }

    return { matchedIds, matchedXmlNodes, error: null };
  } catch (err) {
    return {
      matchedIds: [],
      matchedXmlNodes: [],
      error: err instanceof Error ? err.message : 'Invalid XPath expression',
    };
  }
}
