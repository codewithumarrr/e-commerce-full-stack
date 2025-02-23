import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./OrderHistory.module.css";

interface OrderProduct {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  products: OrderProduct[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
}

interface OrdersResponse {
  orders: Order[];
  total: number;
  totalPages: number;
}

type SortOption = "date-desc" | "date-asc" | "total-desc" | "total-asc";

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
  });

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "date-desc", label: "Newest First" },
    { value: "date-asc", label: "Oldest First" },
    { value: "total-desc", label: "Highest Amount" },
    { value: "total-asc", label: "Lowest Amount" },
  ];

  const statusOptions = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const fetchOrders = async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: "10",
        sort: sortBy,
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await axios.get<OrdersResponse>(`/api/orders?${params}`);
      setOrders(response.data.orders);
      setPagination({
        currentPage: pagination.currentPage,
        totalPages: response.data.totalPages,
        totalOrders: response.data.total,
      });
    } catch (err) {
      setError("Failed to load your orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [pagination.currentPage, statusFilter, sortBy]);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const handleReorder = async (orderId: string) => {
    try {
      await axios.post(`/api/orders/${orderId}/reorder`);
      // Redirect to cart or show success message
    } catch (err) {
      setError("Failed to reorder. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return styles.statusPending;
      case "processing":
        return styles.statusProcessing;
      case "shipped":
        return styles.statusShipped;
      case "delivered":
        return styles.statusDelivered;
      case "cancelled":
        return styles.statusCancelled;
      default:
        return "";
    }
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchOrders} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Order History</h1>

      <div className={styles.controls}>
        <div className={styles.filters}>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination({ ...pagination, currentPage: 1 });
            }}
            className={styles.select}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as SortOption);
              setPagination({ ...pagination, currentPage: 1 });
            }}
            className={styles.select}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.results}>
          {pagination.totalOrders} Order{pagination.totalOrders !== 1 && "s"}
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>No Orders Found</h2>
          <p>You haven't placed any orders yet.</p>
          <Link to="/products" className={styles.shopButton}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  <span className={styles.orderNumber}>
                    Order #{order.orderNumber}
                  </span>
                  <span className={styles.orderDate}>
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                <div className={styles.orderMeta}>
                  <span
                    className={`${styles.statusBadge} ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <span className={styles.orderTotal}>
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div
                className={`${styles.orderDetails} ${
                  expandedOrders.has(order._id) ? styles.expanded : ""
                }`}
              >
                {order.products.map((product) => (
                  <div key={product.productId} className={styles.productRow}>
                    <div className={styles.productImage}>
                      <img src={product.imageUrl} alt={product.name} />
                    </div>
                    <div className={styles.productInfo}>
                      <Link
                        to={`/product/${product.productId}`}
                        className={styles.productName}
                      >
                        {product.name}
                      </Link>
                      <div className={styles.productMeta}>
                        <span>Qty: {product.quantity}</span>
                        <span>${product.price.toFixed(2)} each</span>
                      </div>
                    </div>
                    <div className={styles.productTotal}>
                      ${(product.price * product.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}

                <div className={styles.orderSummary}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Tax</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Shipping</span>
                    <span>${order.shipping.toFixed(2)}</span>
                  </div>
                  <div className={`${styles.summaryRow} ${styles.total}`}>
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className={styles.tracking}>
                    Tracking Number: {order.trackingNumber}
                  </div>
                )}

                <div className={styles.shippingAddress}>
                  <h3>Shipping Address</h3>
                  <p>
                    {order.shippingAddress.street}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.zipCode}
                  </p>
                </div>
              </div>

              <div className={styles.orderActions}>
                <button
                  onClick={() => toggleOrderExpansion(order._id)}
                  className={styles.expandButton}
                >
                  {expandedOrders.has(order._id) ? "Show Less" : "Show Details"}
                </button>
                <button
                  onClick={() => handleReorder(order._id)}
                  className={styles.reorderButton}
                >
                  Reorder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && orders.length > 0 && (
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
          <span className={styles.pageInfo}>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
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
      )}
    </div>
  );
};

export default OrderHistory;
