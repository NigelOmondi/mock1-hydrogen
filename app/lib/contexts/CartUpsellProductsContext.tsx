import {Product} from '@shopify/hydrogen/storefront-api-types';
import {createContext, useContext, useState, useEffect} from 'react';

interface CartUpsellProductsType {
  products: Product[];
  loading: boolean;
  error: Error | null;
}

const CartUpsellProducts = createContext<CartUpsellProductsType | null>(null);

export function CartUpsellProductsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        console.log('Fetching products from API...');
        const response = await fetch('/api/cart-upsell-products');
        const data: unknown = await response.json();
        //console.log('API response:', data);

        if (response.ok) {
          if (
            typeof data === 'object' &&
            data !== null &&
            'products' in data &&
            Array.isArray((data as any).products)
          ) {
            setProducts((data as {products: Product[]}).products);
            console.log(
              'Products set in context:',
              (data as {products: Product[]}).products,
            );
          } else {
            throw new Error('Invalid response format: missing products array');
          }
        } else {
          throw new Error(
            typeof data === 'object' && data !== null && 'error' in data
              ? (data as any).error
              : 'Failed to fetch products',
          );
        }
      } catch (err) {
        console.error('Error in fetchProducts:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <CartUpsellProducts.Provider value={{products, loading, error}}>
      {children}
    </CartUpsellProducts.Provider>
  );
}

export function useCartUpsellProducts() {
  const context = useContext(CartUpsellProducts);
  if (!context) {
    throw new Error(
      'useCartProducts must be used within a CartProductsProvider',
    );
  }
  return context;
}
