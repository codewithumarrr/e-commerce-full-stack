import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./ProductCatalog.module.css";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl: string;
  rating: number;
  reviews: number;
}

interface ProductResponse {
  products: Product[];
  total: number;
  totalPages: number;
}

type SortOption = "price-asc" | "price-desc" | "rating-desc" | "newest";

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  const categories = [
    "Electronics",
    "Clothing",
    "Books",
    "Home & Kitchen",
    "Sports",
    "Beauty",
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Newest Arrivals" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "rating-desc", label: "Highest Rated" },
  ];

  const fetchProducts = async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: "12",
        ...(category && { category }),
        ...(searchQuery && { search: searchQuery }),
        ...(priceRange.min && { minPrice: priceRange.min }),
        ...(priceRange.max && { maxPrice: priceRange.max }),
        sort: sortBy,
      });

      const response = await axios.get<ProductResponse>(
        `/api/products?${params}`
      );
      setProducts(response.data.products);
      setPagination({
        currentPage: pagination.currentPage,
        totalPages: response.data.totalPages,
        totalItems: response.data.total,
      });
    } catch (err) {
      setError("Failed to load products. Please try again later.");
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [pagination.currentPage, category, searchQuery, priceRange, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handlePriceRangeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "min" | "max"
  ) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setPriceRange((prev) => ({ ...prev, [type]: value }));
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await axios.post("/api/cart/add", {
        productId,
        quantity: 1,
      });
      // Show success toast or feedback
    } catch (err) {
      // Show error toast or feedback
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxButtons = 5;
    let startPage = Math.max(1, pagination.currentPage - 2);
    let endPage = Math.min(pagination.totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPagination({ ...pagination, currentPage: i })}
          className={`${styles.pageButton} ${
            pagination.currentPage === i ? styles.activePage : ""
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className={styles.pagination}>
        <button
          onClick={() =>
            setPagination({
              ...pagination,
              currentPage: pagination.currentPage - 1,
            })
          }
          disabled={pagination.currentPage === 1}
          className={styles.pageButton}
        >
          Previous
        </button>
        {pages}
        <button
          onClick={() =>
            setPagination({
              ...pagination,
              currentPage: pagination.currentPage + 1,
            })
          }
          disabled={pagination.currentPage === pagination.totalPages}
          className={styles.pageButton}
        >
          Next
        </button>
      </div>
    );
  };

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={fetchProducts} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Filters and Search Section */}
      <aside className={styles.sidebar}>
        <div className={styles.filterSection}>
          <h2>Filters</h2>

          <div className={styles.searchBox}>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchButton}>
                Search
              </button>
            </form>
          </div>

          <div className={styles.filterGroup}>
            <h3>Category</h3>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPagination({ ...pagination, currentPage: 1 });
              }}
              className={styles.select}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat.toLowerCase()}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <h3>Price Range</h3>
            <div className={styles.priceInputs}>
              <input
                type="text"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => handlePriceRangeChange(e, "min")}
                className={styles.priceInput}
              />
              <span>to</span>
              <input
                type="text"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => handlePriceRangeChange(e, "max")}
                className={styles.priceInput}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.controls}>
          <div className={styles.results}>
            {pagination.totalItems} Products Found
          </div>

          <div className={styles.viewControls}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className={styles.select}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className={styles.viewToggle}>
              <button
                onClick={() => setViewMode("grid")}
                className={`${styles.viewButton} ${
                  viewMode === "grid" ? styles.active : ""
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`${styles.viewButton} ${
                  viewMode === "list" ? styles.active : ""
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        <div
          className={`${styles.productGrid} ${
            viewMode === "list" ? styles.listView : ""
          }`}
        >
          {isLoading
            ? // Skeleton Loading
              Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className={styles.productCardSkeleton}>
                  <div className={styles.imageSkeleton}></div>
                  <div className={styles.contentSkeleton}>
                    <div className={styles.titleSkeleton}></div>
                    <div className={styles.priceSkeleton}></div>
                  </div>
                </div>
              ))
            : // Product Cards
              products.map((product) => (
                <div key={product._id} className={styles.productCard}>
                  <Link
                    to={`/product/${product._id}`}
                    className={styles.productLink}
                  >
                    <div className={styles.productImage}>
                      <img src={product.imageUrl} alt={product.name} />
                    </div>
                    <div className={styles.productInfo}>
                      <h3 className={styles.productName}>{product.name}</h3>
                      <p className={styles.productDescription}>
                        {product.description}
                      </p>
                      <div className={styles.productMeta}>
                        <span className={styles.productPrice}>
                          ${product.price.toFixed(2)}
                        </span>
                        <div className={styles.productRating}>
                          {/* Star rating component */}⭐ {product.rating} (
                          {product.reviews})
                        </div>
                      </div>
                      {product.stockQuantity === 0 ? (
                        <span className={styles.outOfStock}>Out of Stock</span>
                      ) : (
                        <span className={styles.inStock}>
                          In Stock: {product.stockQuantity}
                        </span>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    disabled={product.stockQuantity === 0}
                    className={styles.addToCartButton}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
        </div>

        {!isLoading && renderPagination()}
      </main>
    </div>
  );
};

export default ProductCatalog;
