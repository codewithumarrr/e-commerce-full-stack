import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Cart.module.css";

interface CartItem {
  productId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stockQuantity: number;
}

interface CartTotal {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

const Cart: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState<CartTotal>({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  const calculateTotals = (items: CartItem[]): CartTotal => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;

    return {
      subtotal,
      tax,
      shipping,
      total,
    };
  };

  const fetchCart = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.get<{ items: CartItem[] }>("/api/cart");
      setCart(response.data.items);
      setTotals(calculateTotals(response.data.items));
    } catch (err) {
      setError("Failed to load your cart. Please try again.");
      console.error("Error fetching cart:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (
    productId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    const item = cart.find((i) => i.productId === productId);
    if (!item || newQuantity > item.stockQuantity) return;

    setIsUpdating(true);
    try {
      await axios.put(`/api/cart/${productId}`, { quantity: newQuantity });

      const updatedCart = cart.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      );
      setCart(updatedCart);
      setTotals(calculateTotals(updatedCart));
    } catch (err) {
      setError("Failed to update quantity. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async (productId: string) => {
    setIsUpdating(true);
    try {
      await axios.delete(`/api/cart/${productId}`);
      const updatedCart = cart.filter((item) => item.productId !== productId);
      setCart(updatedCart);
      setTotals(calculateTotals(updatedCart));
    } catch (err) {
      setError("Failed to remove item. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setError("");

    try {
      await axios.post("/api/cart/checkout");
      setCart([]);
      setTotals({
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
      });
      navigate("/order-confirmation");
    } catch (err) {
      setError("Checkout failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchCart} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyCart}>
          <h2>Your Cart is Empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className={styles.continueShoppingButton}>
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Shopping Cart</h1>

      <div className={styles.content}>
        <div className={styles.cartItems}>
          {cart.map((item) => (
            <div key={item.productId} className={styles.cartItem}>
              <div className={styles.itemImage}>
                <img src={item.imageUrl} alt={item.name} />
              </div>

              <div className={styles.itemDetails}>
                <Link
                  to={`/product/${item.productId}`}
                  className={styles.itemName}
                >
                  {item.name}
                </Link>
                <p className={styles.itemDescription}>{item.description}</p>
                <p className={styles.itemPrice}>
                  ${item.price.toFixed(2)} × {item.quantity} ={" "}
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </p>

                <div className={styles.itemControls}>
                  <div className={styles.quantityControls}>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.productId, item.quantity - 1)
                      }
                      disabled={isUpdating || item.quantity <= 1}
                      className={styles.quantityButton}
                    >
                      -
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.productId, item.quantity + 1)
                      }
                      disabled={
                        isUpdating || item.quantity >= item.stockQuantity
                      }
                      className={styles.quantityButton}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemove(item.productId)}
                    disabled={isUpdating}
                    className={styles.removeButton}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.summary}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>

          <div className={styles.summaryDetails}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Tax (10%)</span>
              <span>${totals.tax.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>
                {totals.shipping === 0
                  ? "Free"
                  : `$${totals.shipping.toFixed(2)}`}
              </span>
            </div>
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total</span>
              <span>${totals.total.toFixed(2)}</span>
            </div>
          </div>

          {totals.subtotal < 100 && (
            <p className={styles.shippingNote}>
              Add ${(100 - totals.subtotal).toFixed(2)} more to get free
              shipping!
            </p>
          )}

          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className={`${styles.checkoutButton} ${
              isCheckingOut ? styles.loading : ""
            }`}
          >
            {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
          </button>

          <Link to="/products" className={styles.continueShoppingLink}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
