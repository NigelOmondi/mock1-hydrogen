import {useOptimisticCart, Image} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import { Progress } from './ui/progress';
import {Await, useLoaderData, Link} from 'react-router';
import { FEATURED_COLLECTION_QUERY, CartUpsell } from '~/routes/($locale)._index';
import { useState } from 'react';
import {useCartUpsellProducts} from '~/lib/contexts/CartUpsellProductsContext';
import {AddToCartButton} from './AddToCartButton';



/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 * @param {CartMainProps}
 */
export function CartMain({layout, cart: originalCart}) {
  const [toastMessage, setToastMessage] = useState('');
  const [loadingId, setLoadingId] = useState(null);
  const {close} = useAside();
  const {products, loading, error} = useCartUpsellProducts();

  // Render loading state
  if (loading) {
    return (
      <div className="cart-main-loading">
        <h2 className="text-lg font-bold mb-2">Related Products</h2>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="product-card">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="cart-main-error">
        <p>Error loading products: {error.message}</p>
      </div>
    );
  }

  // Render empty state
  if (!products.length) {
    return (
      <div className="cart-main-empty">
        <p>No related products found</p>
      </div>
    );
  }

  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

   const featuredCollection = useLoaderData();
 
  
  //log the featured collection here from cart upsell

  const FREE_SHIPPING_GOAL = 200;
  const subtotal = Math.round(Number(cart?.cost?.subtotalAmount?.amount)) || 0;
  //console.log('Cart Subtotal:', subtotal);
  const progressPercent = Math.min((subtotal / FREE_SHIPPING_GOAL) * 100, 100);
  const isFreeShippingUnlocked = subtotal >= FREE_SHIPPING_GOAL;

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;

  return (
     <div className="flex flex-col md:flex-row gap-4">

      {/* left */}
      <div className="flex flex-col flex-1 border-r-1 pr-4 cart-upsell-products">
       
         <h2 className="text-lg font-bold mb-2">Related Products</h2>
      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => {
          const variantId = product?.variants?.nodes?.[0]?.id;
          if (!variantId) return null;

          const isLoading = loadingId === product.id;

          return (
            <div key={product.id} className="items-center flex flex-col">
              <Link
                to={`/products/${product.handle}`}
                onClick={close}
                className="block mb-2"
                prefetch="intent"
              >
                <p className="font-semibold">{product.title}</p>
                {product.images?.nodes?.[0] ? (
                  <img
                    src={product.images.nodes[0].url}
                    alt={product.images.nodes[0].altText || product.title}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-32 flex items-center justify-center">
                    <span>No image</span>
                  </div>
                )}
              </Link>

              <AddToCartButton
                lines={[{merchandiseId: variantId, quantity: 1}]}
                onClick={async () => {
                  setLoadingId(product.id);
                  try {
                    // If AddToCartButton does not handle the actual add, you may need to call your add-to-cart logic here.
                    // Otherwise, just handle UI feedback.
                    setToastMessage(`${product.title} added to cart`);
                  } finally {
                    setLoadingId(null);
                    setTimeout(() => setToastMessage(''), 2000);
                  }
                }}
              >
                <span className="inline-block bg-black text-white px-10 md:px-12 py-2 rounded text-sm">
                  {isLoading ? 'Adding...' : 'Add to Cart'}
                </span>
              </AddToCartButton>
            </div>
          );
        })}
      </div>
       
        {/* <div className="grid grid-cols-2 gap-4 cart-upsell-products ">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="rounded shadow">
              <img
                alt="Recommended"
                className="h-auto object-cover rounded"
                src="/zola-light-men.webp"
              />
              <p className="mt-8 font-medium text-sm">Product Names</p>
              <p className="text-sm text-gray-500">KSh 1,250</p>
              <button
                className="mt-2 w-full bg-black text-white text-xs py-2 rounded"
               
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div> */}
      </div>

      {/* right */}
      <div className={className}>
       {/* <div className='sticky top-0 left-0 right-0 pb-2 bg-white'>
        <h2>Shipping Goal</h2>
        <Progress value={40} className="mb-4" />
       </div> */}
            {cartHasItems && (
                  <div className="sticky top-0 left-0 right-0 pb-2 bg-white">
                    <p
                      className={`mb-2 mx-4 text-center font-semibold ${isFreeShippingUnlocked ? "text-green-600" : "text-purple-700"}`}
                    >
                      {isFreeShippingUnlocked ? (
                        <>
                          🎉 Hurray! You earned <strong>Free Shipping!</strong>
                        </>
                      ) : (
                        <>
                          Spend{" "}
                          <strong>KSh {FREE_SHIPPING_GOAL - subtotal}</strong>{" "}
                          more and get <br />
                          Free Shipping!!
                        </>
                      )}
                    </p>
                    <Progress
                   
                      aria-label="Free shipping progress"
                      className="max-w-md"
                      color={isFreeShippingUnlocked ? "success" : "secondary"}
                      value={progressPercent}
                    />
                  </div>
                )}

        <CartEmpty hidden={linesCount} layout={layout} />
          {toastMessage && (
        <div className="fixed top-3 left-1/2 transform -translate-x-1/2 w-full bg-green-600 text-white px-4 py-2 shadow-lg z-50">
          {toastMessage}
        </div>
      )}
        <div className="cart-details">
          <div aria-labelledby="cart-lines">
             

            <ul>
              {(cart?.lines?.nodes ?? []).map((line) => (
                <CartLineItem key={line.id} line={line} layout={layout} />
              ))}
            </ul>
          </div>
          {cartHasItems && <CartSummary cart={cart} layout={layout} />}
        </div>
      </div>
    </div>
  );
}

function FeaturedCollection({collection}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
     <div>CHECK OUT THIS COLLECTION</div>
      <h1>{collection.title}</h1>
    </Link>
  );
}

/**
 * @param {{
 *   hidden: boolean;
 *   layout?: CartMainProps['layout'];
 * }}
 */
function CartEmpty({hidden = false}) {
  const {close} = useAside();
  return (
    <div hidden={hidden}>
      <br />
      <p>
        Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
        started!
      </p>
      <br />
      <Link to="/collections" onClick={close} prefetch="viewport">
        Continue shopping →
      </Link>
    </div>
  );
}

/** @typedef {'page' | 'aside'} CartLayout */
/**
 * @typedef {{
 *   cart: CartApiQueryFragment | null;
 *   layout: CartLayout;
 * }} CartMainProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
