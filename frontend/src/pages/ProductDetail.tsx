import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import styles from "./ProductDetail.module.css";

interface Review {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  images: string[];
  rating: number;
  reviews: Review[];
  features: string[];
  specifications: Record<string, string>;
  variants?: {
    size?: string[];
    color?: string[];
  };
}

interface RelatedProduct {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  rating: number;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartError, setAddToCartError] = useState<string>("");

  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [productResponse, relatedResponse] = await Promise.all([
          axios.get<Product>(`/api/products/${id}`),
          axios.get<RelatedProduct[]>(`/api/products/${id}/related`),
        ]);

        setProduct(productResponse.data);
        setRelatedProducts(relatedResponse.data);

        // Initialize variant selection if available
        if (productResponse.data.variants) {
          const initialVariants: Record<string, string> = {};
          Object.entries(productResponse.data.variants).forEach(
            ([key, values]) => {
              if (values && values.length > 0) {
                initialVariants[key] = values[0];
              }
            }
          );
          setSelectedVariants(initialVariants);
        }
      } catch (err) {
        setError("Failed to load product details. Please try again.");
        console.error("Error fetching product:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleQuantityChange = (newQuantity: number) => {
    if (!product) return;
    if (newQuantity < 1 || newQuantity > product.stockQuantity) return;
    setQuantity(newQuantity);
  };

  const handleVariantChange = (type: string, value: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    setAddToCartError("");

    try {
      await axios.post("/api/cart/add", {
        productId: product?._id,
        quantity,
        variants: selectedVariants,
      });
      navigate("/cart");
    } catch (err) {
      setAddToCartError("Failed to add item to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const renderStockStatus = () => {
    if (!product) return null;

    if (product.stockQuantity === 0) {
      return <span className={styles.outOfStock}>Out of Stock</span>;
    }

    if (product.stockQuantity < 10) {
      return (
        <span className={styles.lowStock}>
          Only {product.stockQuantity} left in stock!
        </span>
      );
    }

    return <span className={styles.inStock}>In Stock</span>;
  };

  const renderRatingStars = (rating: number) => {
    return (
      <div className={styles.rating}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${styles.star} ${star <= rating ? styles.filled : ""}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.error}>
        <p>{error || "Product not found"}</p>
        <Link to="/products" className={styles.backButton}>
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <nav className={styles.breadcrumbs}>
        <Link to="/products">Products</Link>
        <span className={styles.separator}>/</span>
        <Link to={`/products?category=${product.category}`}>
          {product.category}
        </Link>
        <span className={styles.separator}>/</span>
        <span>{product.name}</span>
      </nav>

      <div className={styles.content}>
        {/* Product Images */}
        <div className={styles.imageGallery}>
          <div className={styles.mainImage}>
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className={styles.productImage}
            />
          </div>
          <div className={styles.thumbnails}>
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`${styles.thumbnail} ${
                  selectedImage === index ? styles.selected : ""
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} thumbnail ${index + 1}`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className={styles.productInfo}>
          <h1 className={styles.title}>{product.name}</h1>

          <div className={styles.meta}>
            {renderRatingStars(product.rating)}
            <span className={styles.reviewCount}>
              ({product.reviews.length} reviews)
            </span>
            {renderStockStatus()}
          </div>

          <div className={styles.price}>${product.price.toFixed(2)}</div>

          <p className={styles.description}>{product.description}</p>

          {/* Variant Selection */}
          {product.variants && (
            <div className={styles.variants}>
              {Object.entries(product.variants).map(([type, values]) => (
                <div key={type} className={styles.variantGroup}>
                  <label>{type.charAt(0).toUpperCase() + type.slice(1)}:</label>
                  <div className={styles.variantOptions}>
                    {values.map((value) => (
                      <button
                        key={value}
                        onClick={() => handleVariantChange(type, value)}
                        className={`${styles.variantButton} ${
                          selectedVariants[type] === value
                            ? styles.selected
                            : ""
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity Selection and Add to Cart */}
          <div className={styles.addToCart}>
            <div className={styles.quantityControls}>
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || product.stockQuantity === 0}
                className={styles.quantityButton}
              >
                -
              </button>
              <span className={styles.quantity}>{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={
                  quantity >= product.stockQuantity ||
                  product.stockQuantity === 0
                }
                className={styles.quantityButton}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stockQuantity === 0}
              className={`${styles.addToCartButton} ${
                isAddingToCart ? styles.loading : ""
              }`}
            >
              {isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
            </button>
          </div>

          {addToCartError && <p className={styles.error}>{addToCartError}</p>}

          {/* Features and Specifications */}
          <div className={styles.details}>
            <div className={styles.features}>
              <h2>Key Features</h2>
              <ul>
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className={styles.specifications}>
              <h2>Specifications</h2>
              <table>
                <tbody>
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td>{value}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className={styles.reviews}>
        <h2>Customer Reviews</h2>
        {product.reviews.length === 0 ? (
          <p className={styles.noReviews}>No reviews yet</p>
        ) : (
          <div className={styles.reviewsList}>
            {product.reviews.map((review) => (
              <div key={review._id} className={styles.review}>
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewAuthor}>{review.userName}</span>
                  {renderRatingStars(review.rating)}
                  <span className={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className={styles.reviewComment}>{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className={styles.relatedProducts}>
          <h2>Related Products</h2>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((relatedProduct) => (
              <Link
                to={`/product/${relatedProduct._id}`}
                key={relatedProduct._id}
                className={styles.relatedProduct}
              >
                <img
                  src={relatedProduct.imageUrl}
                  alt={relatedProduct.name}
                  className={styles.relatedImage}
                />
                <h3>{relatedProduct.name}</h3>
                <div className={styles.relatedMeta}>
                  <span className={styles.relatedPrice}>
                    ${relatedProduct.price.toFixed(2)}
                  </span>
                  {renderRatingStars(relatedProduct.rating)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
