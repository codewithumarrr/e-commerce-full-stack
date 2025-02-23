import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./PrivateRoute.module.css";

interface User {
  _id: string;
  username: string;
  role: "admin" | "customer";
}

interface PrivateRouteProps {
  component: React.ComponentType<any>;
  roles?: Array<"admin" | "customer">;
  [key: string]: any;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  roles,
  ...rest
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");
  const location = useLocation();

  useEffect(() => {
    const validateToken = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get<User>("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err) {
        // Token is invalid or expired
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        setError("Your session has expired. Please log in again.");
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>Authenticating...</p>
      </div>
    );
  }

  if (error) {
    return <Navigate to="/login" state={{ from: location, error }} replace />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className={styles.unauthorized}>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <button
          onClick={() => window.history.back()}
          className={styles.backButton}
        >
          Go Back
        </button>
      </div>
    );
  }

  // Set up axios interceptor for token refresh
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("No refresh token");

          const response = await axios.post("/api/auth/refresh-token", {
            refreshToken,
          });

          const { token } = response.data;
          localStorage.setItem("token", token);

          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return axios(originalRequest);
        } catch (err) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          sessionStorage.removeItem("token");
          window.location.href = `/login?redirect=${encodeURIComponent(
            window.location.pathname
          )}`;
          return Promise.reject(error);
        }
      }
      return Promise.reject(error);
    }
  );

  return <Component {...rest} user={user} />;
};

export default PrivateRoute;
