import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "./Home.module.css";

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  imageUrl: string;
  productCount: number;
}

interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
}

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState("");

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [
          featuredResponse,
          bestSellersResponse,
          categoriesResponse,
          testimonialsResponse,
        ] = await Promise.all([
          axios.get<Product[]>("/api/products/featured"),
          axios.get<Product[]>("/api/products/best-sellers"),
          axios.get<Category[]>("/api/categories"),
          axios.get<Testimonial[]>("/api/testimonials"),
        ]);

        setFeaturedProducts(featuredResponse.data);
        setBestSellers(bestSellersResponse.data);
        setCategories(categoriesResponse.data);
        setTestimonials(testimonialsResponse.data);
      } catch (err) {
        console.error("Error fetching home data:", err);
      }
    };

    fetchHomeData();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    setSubscribeMessage("");

    try {
      await axios.post("/api/newsletter/subscribe", { email });
      setSubscribeMessage("Thank you for subscribing!");
      setEmail("");
    } catch (err) {
      setSubscribeMessage("Failed to subscribe. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Discover Your Perfect Style</h1>
          <p>Shop the latest trends in fashion, electronics, and more.</p>
          <Link to="/products" className={styles.ctaButton}>
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Shop by Category</h2>
          <Link to="/products" className={styles.viewAll}>
            View All Categories
          </Link>
        </div>
        <div className={styles.categories}>
          {categories.map((category) => (
            <Link
              to={`/products?category=${category.id}`}
              key={category.id}
              className={styles.categoryCard}
            >
              <div className={styles.categoryImage}>
                <img src={category.imageUrl} alt={category.name} />
              </div>
              <h3>{category.name}</h3>
              <span>{category.productCount} Products</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Featured Products</h2>
          <Link to="/products?featured=true" className={styles.viewAll}>
            View All Featured
          </Link>
        </div>
        <div className={styles.productGrid}>
          {featuredProducts.map((product) => (
            <Link
              to={`/product/${product._id}`}
              key={product._id}
              className={styles.productCard}
            >
              <div className={styles.productImage}>
                <img src={product.imageUrl} alt={product.name} />
              </div>
              <div className={styles.productInfo}>
                <h3>{product.name}</h3>
                <span className={styles.price}>
                  ${product.price.toFixed(2)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Special Offers */}
      <section className={styles.specialOffers}>
        <div className={styles.offer}>
          <h2>Summer Sale</h2>
          <p>Up to 50% off on selected items</p>
          <Link to="/products?sale=true" className={styles.offerButton}>
            Shop Sale
          </Link>
        </div>
        <div className={styles.offer}>
          <h2>New Arrivals</h2>
          <p>Check out our latest collection</p>
          <Link to="/products?new=true" className={styles.offerButton}>
            Discover More
          </Link>
        </div>
      </section>

      {/* Best Sellers */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Best Sellers</h2>
          <Link to="/products?sort=best-selling" className={styles.viewAll}>
            View All Best Sellers
          </Link>
        </div>
        <div className={styles.productGrid}>
          {bestSellers.map((product) => (
            <Link
              to={`/product/${product._id}`}
              key={product._id}
              className={styles.productCard}
            >
              <div className={styles.productImage}>
                <img src={product.imageUrl} alt={product.name} />
              </div>
              <div className={styles.productInfo}>
                <h3>{product.name}</h3>
                <span className={styles.price}>
                  ${product.price.toFixed(2)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className={`${styles.section} ${styles.testimonials}`}>
        <h2>What Our Customers Say</h2>
        <div className={styles.testimonialGrid}>
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className={styles.testimonialCard}>
              <div className={styles.testimonialHeader}>
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className={styles.avatar}
                />
                <div>
                  <h3>{testimonial.name}</h3>
                  <div className={styles.rating}>
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`${styles.star} ${
                          i < testimonial.rating ? styles.filled : ""
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <p>{testimonial.comment}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className={styles.newsletter}>
        <div className={styles.newsletterContent}>
          <h2>Subscribe to Our Newsletter</h2>
          <p>Get the latest updates on new products and upcoming sales.</p>
          <form onSubmit={handleSubscribe} className={styles.subscribeForm}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
            <button
              type="submit"
              disabled={isSubscribing}
              className={`${styles.subscribeButton} ${
                isSubscribing ? styles.loading : ""
              }`}
            >
              {isSubscribing ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
          {subscribeMessage && (
            <p
              className={`${styles.message} ${
                subscribeMessage.includes("Thank you")
                  ? styles.success
                  : styles.error
              }`}
            >
              {subscribeMessage}
            </p>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className={styles.trustBadges}>
        <div className={styles.badge}>
          <i className={styles.icon}>🚚</i>
          <h3>Free Shipping</h3>
          <p>On orders over $100</p>
        </div>
        <div className={styles.badge}>
          <i className={styles.icon}>🔄</i>
          <h3>Easy Returns</h3>
          <p>30-day return policy</p>
        </div>
        <div className={styles.badge}>
          <i className={styles.icon}>🔒</i>
          <h3>Secure Payment</h3>
          <p>100% secure checkout</p>
        </div>
        <div className={styles.badge}>
          <i className={styles.icon}>💬</i>
          <h3>24/7 Support</h3>
          <p>Here to help</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
