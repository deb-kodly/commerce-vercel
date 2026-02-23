import { CCRZ_CART_API_URL, CCRZ_PRODUCT_API_URL } from 'lib/constants';
import { Cart, CartItem } from './types';
import { makeSfdcApiCall, HttpMethod } from './sfdcApiUtil';
import { getCartIdFromCookie, setCartIdInCookie } from 'app/api/auth/cookieUtils';

/**
 * Creates a new active cart and stores its ENCID in the cartId cookie.
 */
export async function createCart(): Promise<Cart> {
  const response = await makeSfdcApiCall(CCRZ_CART_API_URL + '/create', HttpMethod.POST, {
    CARTS: [{ cartType: 'Cart', activeCart: true }],
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  const cartRaw = data?.cartList?.[0];
  if (cartRaw?.ENCID) {
    await setCartIdInCookie(cartRaw.ENCID);
  }
  return mapCart(cartRaw);
}

/**
 * Adds a product to the cart. Creates a cart if none exists.
 */
export async function addToCart(lines: {
  productId: string;
  quantity: number;
  type?: string;
}): Promise<Cart> {
  let encId = await getCartIdFromCookie();
  if (!encId) {
    await createCart();
    encId = await getCartIdFromCookie();
    if (!encId) return mapCart(null);
  }

  await makeSfdcApiCall(CCRZ_CART_API_URL + '/addto', HttpMethod.POST, {
    ENCID: encId,
    LINEITEMS: [{ PRODUCTID: lines.productId, quantity: lines.quantity }],
  });

  // Price the cart after adding items
  await makeSfdcApiCall(CCRZ_CART_API_URL + '/price', HttpMethod.POST, { ENCID: encId });

  return (await getCart()) ?? mapCart(null);
}

/**
 * Removes a cart line item by its SFID.
 */
export async function removeFromCart(cartItemId: string): Promise<void> {
  const encId = await getCartIdFromCookie();
  if (!encId) return;

  await makeSfdcApiCall(CCRZ_CART_API_URL + '/removefrom', HttpMethod.POST, {
    ENCID: encId,
    LINEITEMS: [{ SFID: cartItemId }],
  });
}

/**
 * Updates the quantity of a cart item. CloudCraze has no direct update —
 * implemented as remove + add.
 * @param cartItemId - The SFID of the existing cart line item to remove.
 * @param productId  - The product SFID to re-add.
 * @param quantity   - The new quantity.
 */
export async function updateCart(
  cartItemId: string,
  productId: string,
  quantity: number
): Promise<Cart> {
  await removeFromCart(cartItemId);
  return addToCart({ productId, quantity });
}

/**
 * Retrieves the current active cart with full line-item and product details.
 */
export async function getCart(): Promise<Cart | undefined> {
  try {
    const response = await makeSfdcApiCall(CCRZ_CART_API_URL + '/getactive', HttpMethod.POST, {});
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!data?.success || !Array.isArray(data.cartList) || data.cartList.length === 0) {
      return undefined;
    }

    const cartRaw = data.cartList[0];

    // Persist the ENCID into the cart cookie if it wasn't already set
    if (cartRaw?.ENCID && !(await getCartIdFromCookie())) {
      await setCartIdInCookie(cartRaw.ENCID);
    }
    const cartItems: any[] = cartRaw.ECartItems || [];

    // Fetch full product details for all products in the cart
    const productSfids: string[] = [
      ...new Set(cartItems.map((ci: any) => ci.product).filter(Boolean)),
    ] as string[];

    let productMap: Record<string, any> = {};
    let priceResults: Record<string, any> = {};

    if (productSfids.length > 0) {
      const prodResponse = await makeSfdcApiCall(CCRZ_PRODUCT_API_URL + '/fetch', HttpMethod.POST, {
        PRODUCTLIST: productSfids,
        ISPRICED: true,
      });
      const prodText = await prodResponse.text();
      const prodData = prodText ? JSON.parse(prodText) : null;
      if (prodData?.success && Array.isArray(prodData.productList)) {
        priceResults = prodData.PriceResults || {};
        for (const p of prodData.productList) {
          productMap[p.sfid] = p;
        }
      }
    }

    const mappedItems: CartItem[] = cartItems.map((ci: any) =>
      mapCartItem(ci, productMap, priceResults)
    );
    const cart = mapCart(cartRaw);
    cart.lines = mappedItems;
    return cart;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return undefined;
  }
}

function mapCart(raw: any): Cart {
  return {
    id: raw?.sfid,
    checkoutUrl: '',
    cost: {
      subtotalAmount: {
        amount: String(raw?.subTotalAmount || raw?.totalAmount || '0'),
        currencyCode: raw?.currencyISOCode || 'USD',
      },
      totalAmount: {
        amount: String(raw?.totalAmount || '0'),
        currencyCode: raw?.currencyISOCode || 'USD',
      },
      totalTaxAmount: {
        amount: String(raw?.totalTaxAmount || '0'),
        currencyCode: raw?.currencyISOCode || 'USD',
      },
    },
    lines: [],
    totalQuantity: Number(raw?.totalCartItems) || 0,
  };
}

function mapCartItem(
  ci: any,
  productMap: Record<string, any>,
  priceResults: Record<string, any>
): CartItem {
  const product = productMap[ci.product] || {};
  const sku = product.SKU || '';
  const priceEntry = priceResults?.[sku]?.priceEntries?.[0];
  const currency = priceEntry?.currencyCode || 'USD';

  const images: any[] = product.EProductMedias || [];
  const imageUrl = images[0]?.URI || '';

  return {
    id: ci.sfid,
    quantity: Number(ci.quantity) || 0,
    cost: {
      totalAmount: {
        amount: String(ci.subAmount || '0'),
        currencyCode: currency,
      },
    },
    merchandise: {
      id: ci.product, // product SFID — used to re-add when updateCart is called
      title: product.sfdcName || '',
      selectedOptions: [],
      product: {
        id: ci.product,
        handle: sku,
        title: product.sfdcName || '',
        featuredImage: {
          url: imageUrl,
          altText: product.sfdcName || '',
          width: 0,
          height: 0,
        },
      },
    },
  };
}
