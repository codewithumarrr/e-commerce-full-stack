import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./NotFound.module.css";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.illustration}>
          <div className={styles.errorCode}>404</div>
          <div className={styles.errorImage}>
            {/* Simple CSS art for shopping bag */}
            <div className={styles.bag}>
              <div className={styles.bagHandle}></div>
            </div>
          </div>
        </div>

        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.description}>
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className={styles.actions}>
          <button
            onClick={() => navigate(-1)}
            className={`${styles.button} ${styles.secondary}`}
          >
            Go Back
          </button>
          <Link to="/" className={`${styles.button} ${styles.primary}`}>
            Back to Home
          </Link>
        </div>

        <div className={styles.helpLinks}>
          <h2>You might want to check out:</h2>
          <div className={styles.links}>
            <Link to="/products" className={styles.link}>
              Browse Products
            </Link>
            <Link to="/cart" className={styles.link}>
              Shopping Cart
            </Link>
            <Link to="/orders" className={styles.link}>
              Order History
            </Link>
            <Link to="/contact" className={styles.link}>
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
