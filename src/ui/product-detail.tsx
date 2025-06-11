'use client'

import { useState, useEffect } from "react"
import { addItemToCart, fetchProductById } from "@/services/product-service";
import Image from "next/image";

import { useParams } from 'next/navigation';
import { useAuth } from "@/context/auth-context";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  category: {
    id: number;
    name: string;
  } | null;
  image: string | null;
  created_at: string;
  updated_at: string;
}


export default function ProductDetailPage() {

  const params = useParams();
  const productId = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null)

  const [addingToCart, setAddingToCart] = useState(false);
  const [addToCartMessage, setAddToCartMessage] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      // Clear previous error and product data
      setError(null);
      setProduct(null);
      setAddToCartMessage(null);

      console.log(`ProductDetailPage: Attempting to fetch product with ID: ${productId}`);

      try {
        const productData = await fetchProductById(productId as string);

        setProduct(productData);
        console.log(`ProductDetailPage: Fetch for product ${productId} complete.`);
      } catch (err) {

        console.error(`ProductDetailPage: Error fetching product ${productId}:`, err);
        setError(`Failed to load product ${productId}. Please try again later.`);
      } finally {
        setLoading(false)
      }

    }

    if (productId) {
      console.log(`ProductDetailPage useEffect: productId is valid (${productId}), proceeding with fetch.`);
      loadProduct();
    } else {
      console.log("ProductDetailPage useEffect: productId is invalid or not yet available from useParams, skipping fetch.");
      setLoading(false);
      setError("Invalid product ID provided in URL.");
    }
  }, [productId]);


  // Add to cart button handler
  const handleAddToCart = async () => {
    // Ensure data is loaded and user is authenticated
    if (!product || !isAuthenticated) {
      console.warn("Cannot add to cart: Product data not loaded or user not authenticated.");
      setAddToCartMessage("Please log in to add items to your cart.");
      return;
    }

    setAddingToCart(true);
    setAddToCartMessage(null); // Clean previous messages


    try {
      // Call the service function to add the item to the cart
      const quantityToAdd = 1;
      console.log(`Attempting to add product ${product.id} with quantity ${quantityToAdd} to cart.`);
      const cartItem = await addItemToCart(product.id, quantityToAdd)

      console.log("Item added to cart successfully:", cartItem);
      setAddToCartMessage(`${cartItem.product.name} added to cart (${cartItem.quantity} total).`);

    } catch (err) {
      console.error("Error adding item to cart:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to add item to cart.";
      if (errorMessage.includes("Authentication token not available")) {
        setAddToCartMessage("Authentication required. Please log in.");
      } else {
        setAddToCartMessage(errorMessage);
      }
    } finally {
      setAddingToCart(false);
    }
  }

  if (loading) {
    return <p>Loading product details...</p>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (!product) {
    return <p>Product not found.</p>;
  }

  return (
    // Main div
    <div className="max-w-6xl mx-auto p-4 bg-white border border-gray-200 rounded-lg shadow-sm">

      {/* Section for images, product-detail, and seller-details */}
      <div className="grid md:grid-cols-12 gap-6">

        {/* Product image */}
        <div className="md:col-span-4">
          {product.image && (
            <Image
              src={product.image}
              alt={product.name}
              width={300}
              height={300}
              className="rounded-lg mb-5 h-auto"
            />
          )}
        </div>

        {/* Product name, price, stock, category, add to cart */}
        <div className="md:col-span-5">
          <h1 className="text-xl font-semibold">{product.name}</h1>
          <p className="text-lg text-gray-700">Price: {product.price}</p>
          <p className="text-lg text-gray-700">Category: {product.category.id}</p>
          <p className={`text-base ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            Stock: {product.stock}
          </p>
          <p className="text-sm text-gray-500">{product.description}</p>

          {/* Conditional Add to Cart Section */}
          {isAuthenticated ? (
            product.stock > 0 ? (
              <div>
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className={`mt-4 py-2 px-4 text-base rounded border-0
                bg-green-600 text-white
                ${addingToCart ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-green-700'}`}
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>

                {addToCartMessage && (
                  <p className={`mt-2 ${error ? 'text-red-600' : 'text-green-600'}`}>
                    {addToCartMessage}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-4 text-red-600">Out of Stock</p>
            )
          ) : (
            <p className="mt-4 text-gray-600">Log in to add to cart.</p>
          )}
        </div>

        {/* Seller details — placed to the right */}
        <div className="md:col-span-3 bg-gray-100 p-4 rounded shadow-sm flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Seller Info</h2>
          <p className="text-sm text-gray-700">Name: Seller</p>
          <p className="text-sm text-gray-700">Rating: ⭐ 4.5</p>
          <p className="text-sm text-gray-700">Location: Your Basement</p>
          <button className="mt-2 py-2 px-4 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
            View Seller
          </button>
        </div>
      </div>

      {/* Product description section */}
      <div className="max-w-6xl mx-auto mt-20 p-4 bg-white border-amber-500 rounded-lg shadow-sm">
        <h1 className="mb-9 text-2xl md:text-3xl font-bold text-gray-900 mb-4">Descriptions:</h1>
        <h5 className="text-2xl md:text-3xl font-medium text-gray-900 mb-4">
          Lenovo LOQ 15 (AMD Ryzen 5 7235HS, RTX 3050 6GB)
        </h5>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700 italic text-sm">
            <span className="font-semibold">Note:</span> The image is for reference only. Always read labels/warnings before use.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Key Specifications:</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li><span className="font-medium">Processor:</span> AMD Ryzen 5 7235HS | 3.2GHz (Base) – 4.2GHz (Max) | 4 Cores | 8 Threads</li>
            <li><span className="font-medium">Display:</span> 15.6″ FHD (1920×1080) IPS | 144Hz | 300Nits Anti-glare</li>
            <li><span className="font-medium">Memory:</span> 12GB DDR5-4800 RAM | 512GB NVMe SSD</li>
            <li><span className="font-medium">Graphics:</span> NVIDIA RTX 3050 6GB GDDR6 (95W TGP)</li>
            <li><span className="font-medium">OS/Battery:</span> Windows 11 Home | 60Wh (6Hrs) | Rapid Charge Pro (80min to 100%)</li>
            <li><span className="font-medium">Warranty:</span> 1 Year against manufacturing defects</li>
          </ul>
        </div>

        <div className="prose prose-sm sm:prose-base max-w-none text-gray-600">
          <h3 className="text-lg font-semibold text-gray-800">Overview</h3>
          <p className="mt-2">
            The Lenovo LOQ 15 packs a powerful AMD Ryzen 5 processor and NVIDIA RTX 3050 GPU,
            making it ideal for gaming and multitasking. The 144Hz FHD display ensures smooth visuals,
            while DDR5 RAM and NVMe SSD deliver blazing-fast performance. Pre-loaded with Windows 11
            and backed by a 1-year warranty, it's built for reliability.
          </p>
        </div>
      </div>
    </div>
  )
}
