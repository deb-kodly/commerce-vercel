export type Maybe<T> = T | null;

export type Connection<T> = {
  edges: Array<Edge<T>>;
};

export type Edge<T> = {
  node: T;
};

export type Cart = Omit<SfdcCart, 'lines'> & {
  lines: CartItem[];
};

export type CartProduct = {
  id: string;
  handle: string;
  title: string;
  featuredImage: Image;
};

export type CartItem = {
  id: string | undefined;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    product: CartProduct;
  };
};

export type Collection = SfdcCollection & {
  path: string;
};

export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Page = {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo?: SEO;
  createdAt: string;
  updatedAt: string;
};

export type Product = Omit<SfdcProduct, 'images'> & {
  images: Image[];
  price: Money;
};

export type SEO = {
  title: string;
  description: string;
};

export type SfdcCart = {
  id: string | undefined;
  checkoutUrl: string;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
  };
  lines: Connection<CartItem>;
  totalQuantity: number;
};

export type SfdcCollection = {
  handle: string;
  title: string;
  description: string;
  seo: SEO;
  updatedAt: string;
};

export type SfdcProduct = {
  id: string;
  handle: string;
  availableForSale: boolean;
  title: string;
  description: string;
  descriptionHtml: string;
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  featuredImage: Image;
  images: Connection<Image>;
  seo: SEO;
  tags: string[];
  updatedAt: string;
  // CloudCraze-specific fields
  subtitle?: string;          // Product subtitle / ingredients line
  alternateName?: string;     // Display name override (shown instead of sfdcName)
  brandColor?: string;        // Hex color for the brand tag badge
  ean?: string;               // EAN-13 barcode (shopXTXTEAN13)
  sku?: string;               // Explicit SKU (same as handle, kept for display)
  unitsPerBox?: number;       // shopXNUMUnitsPerBox
  unitWeight?: string;        // Formatted weight per unit (e.g. "85g", "1.2kg")
  isFrozen?: boolean;         // Shows frozen icon when true
  basePrice?: Money;          // Original price before discount
  promos?: Record<string, string>; // Promo code → promo name map
  productType?: string;       // Product type/category (e.g. "Snack", "Wet Food")
};

export type Category = {
  parentCategoryName?: string;
  parentCategoryId?: string;
  categoryName: string;
  categoryId: string;    // ccrz__CategoryID__c — used for URL routing
  sfid?: string;         // Salesforce record Id — used for CloudCraze product API CATEGORYIDS
  numberOfProducts?: number;
  path?: string;
  updatedAt?: string;
}

export type ProductFilterValue = {
  value: string;
  count?: number;
  selected?: boolean;
  enabled?: boolean;
};

export type ProductFilter = {
  sfid: string;
  sfdcName: string;
  filterType?: string;
  collapsed?: boolean;
  specValues: ProductFilterValue[];
};

export type PricingApiResponse = {
  unitPrice: string,
  listPrice: string
  currencyIsoCode: string,
};

export interface CookieOptions {
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export const defaultCookieOptions: CookieOptions = {
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'lax'
};
