import { type LoaderFunctionArgs } from '@shopify/remix-oxygen';

const PRODUCTS_QUERY = `#graphql
  query Products {
    products(first: 8) {
      nodes {
        id
        title
        handle
        description
        images(first: 12) {
          nodes {
            url
            altText
          }
        }
        variants(first: 30) {
          nodes {
            id
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }` as const;

export async function loader({ context }: LoaderFunctionArgs) {
  try {
    console.log('Fetching cart products...');
    const result = await context.storefront.query(PRODUCTS_QUERY);
    
    //console.log('Products query result:', JSON.stringify(result, null, 2));
    
    return new Response(
      JSON.stringify({ products: result.products?.nodes || [] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch products' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}