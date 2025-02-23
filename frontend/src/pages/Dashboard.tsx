import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./Dashboard.module.css";

interface User {
  _id: string;
  username: string;
  email: string;
  role: "admin" | "customer";
  fullName: string;
}

interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
}

interface AdminStats extends DashboardStats {
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockProducts: Array<{
    _id: string;
    name: string;
    stockQuantity: number;
  }>;
  recentUsers: Array<{
    _id: string;
    username: string;
    createdAt: string;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  topProducts: Array<{
    _id: string;
    name: string;
    totalSales: number;
    revenue: number;
  }>;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [userResponse, statsResponse] = await Promise.all([
          axios.get<User>("/api/auth/me"),
          axios.get<DashboardStats | AdminStats>("/api/dashboard/stats"),
        ]);

        setUser(userResponse.data);
        setStats(statsResponse.data);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        Loading dashboard...
      </div>
    );
  }

  if (error || !user || !stats) {
    return (
      <div className={styles.error}>
        <p>{error || "Something went wrong"}</p>
        <button
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Retry
        </button>
      </div>
    );
  }

  const isAdmin = user.role === "admin";
  const adminStats = stats as AdminStats;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.welcome}>
          <h1>Welcome back, {user.fullName}</h1>
          <p>{isAdmin ? "Admin Dashboard" : "Customer Dashboard"}</p>
        </div>
        <div className={styles.profile}>
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.fullName
            )}&background=random`}
            alt={user.fullName}
            className={styles.avatar}
          />
          <div className={styles.profileInfo}>
            <span className={styles.name}>{user.fullName}</span>
            <span className={styles.email}>{user.email}</span>
          </div>
        </div>
      </header>

      <div className={styles.stats}>
        {isAdmin ? (
          <>
            <div className={styles.statCard}>
              <h3>Total Revenue</h3>
              <p>{formatCurrency(adminStats.totalRevenue)}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Total Orders</h3>
              <p>{adminStats.totalOrders}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Total Products</h3>
              <p>{adminStats.totalProducts}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Total Customers</h3>
              <p>{adminStats.totalCustomers}</p>
            </div>
          </>
        ) : (
          <>
            <div className={styles.statCard}>
              <h3>Total Orders</h3>
              <p>{stats.totalOrders}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Total Spent</h3>
              <p>{formatCurrency(stats.totalSpent)}</p>
            </div>
          </>
        )}
      </div>

      <div className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Recent Orders</h2>
              <Link to="/orders" className={styles.viewAll}>
                View All
              </Link>
            </div>
            <div className={styles.recentOrders}>
              {stats.recentOrders.length === 0 ? (
                <p className={styles.empty}>No recent orders</p>
              ) : (
                stats.recentOrders.map((order) => (
                  <Link
                    to={`/order/${order._id}`}
                    key={order._id}
                    className={styles.orderCard}
                  >
                    <div className={styles.orderInfo}>
                      <span className={styles.orderNumber}>
                        #{order.orderNumber}
                      </span>
                      <span className={styles.orderDate}>
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div className={styles.orderMeta}>
                      <span
                        className={`${styles.status} ${styles[order.status]}`}
                      >
                        {order.status}
                      </span>
                      <span className={styles.total}>
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {isAdmin && (
            <>
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2>Top Products</h2>
                  <Link to="/products" className={styles.viewAll}>
                    Manage Products
                  </Link>
                </div>
                <div className={styles.topProducts}>
                  {adminStats.topProducts.map((product) => (
                    <Link
                      to={`/product/${product._id}`}
                      key={product._id}
                      className={styles.productCard}
                    >
                      <div className={styles.productInfo}>
                        <h3>{product.name}</h3>
                        <p>Total Sales: {product.totalSales}</p>
                      </div>
                      <span className={styles.revenue}>
                        {formatCurrency(product.revenue)}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2>Inventory Alerts</h2>
                </div>
                <div className={styles.lowStock}>
                  {adminStats.lowStockProducts.length === 0 ? (
                    <p className={styles.empty}>No low stock alerts</p>
                  ) : (
                    adminStats.lowStockProducts.map((product) => (
                      <Link
                        to={`/product/${product._id}`}
                        key={product._id}
                        className={styles.alertCard}
                      >
                        <span className={styles.alertName}>{product.name}</span>
                        <span className={styles.stockQuantity}>
                          Only {product.stockQuantity} left
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </section>
            </>
          )}
        </div>

        <div className={styles.rightColumn}>
          {isAdmin && (
            <>
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2>Monthly Revenue</h2>
                </div>
                <div className={styles.chart}>
                  {/* Chart component would go here */}
                  <div className={styles.monthlyRevenue}>
                    {adminStats.monthlyRevenue.map((data) => (
                      <div key={data.month} className={styles.monthBar}>
                        <div
                          className={styles.bar}
                          style={{
                            height: `${
                              (data.revenue /
                                Math.max(
                                  ...adminStats.monthlyRevenue.map(
                                    (d) => d.revenue
                                  )
                                )) *
                              100
                            }%`,
                          }}
                        ></div>
                        <span className={styles.month}>{data.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2>Recent Users</h2>
                  <Link to="/users" className={styles.viewAll}>
                    View All
                  </Link>
                </div>
                <div className={styles.recentUsers}>
                  {adminStats.recentUsers.map((user) => (
                    <div key={user._id} className={styles.userCard}>
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.username
                        )}&background=random`}
                        alt={user.username}
                        className={styles.userAvatar}
                      />
                      <div className={styles.userInfo}>
                        <span className={styles.username}>{user.username}</span>
                        <span className={styles.joinDate}>
                          Joined {formatDate(user.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Quick Actions</h2>
            </div>
            <div className={styles.actions}>
              {isAdmin ? (
                <>
                  <Link to="/products/new" className={styles.actionButton}>
                    Add New Product
                  </Link>
                  <Link to="/orders" className={styles.actionButton}>
                    Manage Orders
                  </Link>
                  <Link to="/users" className={styles.actionButton}>
                    Manage Users
                  </Link>
                  <Link to="/settings" className={styles.actionButton}>
                    Store Settings
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/products" className={styles.actionButton}>
                    Browse Products
                  </Link>
                  <Link to="/cart" className={styles.actionButton}>
                    View Cart
                  </Link>
                  <Link to="/orders" className={styles.actionButton}>
                    Track Orders
                  </Link>
                  <Link to="/profile" className={styles.actionButton}>
                    Edit Profile
                  </Link>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
