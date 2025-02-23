import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Signup.module.css";

interface SignupForm {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface SignupError {
  message: string;
  field?: keyof SignupForm;
}

const Signup: React.FC = () => {
  const [formData, setFormData] = useState<SignupForm>({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<SignupError | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    return (
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar &&
      isLongEnough
    );
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      setError({ message: "Full name is required", field: "fullName" });
      return false;
    }

    if (!validateEmail(formData.email)) {
      setError({
        message: "Please enter a valid email address",
        field: "email",
      });
      return false;
    }

    if (formData.username.length < 3) {
      setError({
        message: "Username must be at least 3 characters long",
        field: "username",
      });
      return false;
    }

    if (!validatePassword(formData.password)) {
      setError({
        message:
          "Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters",
        field: "password",
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError({ message: "Passwords do not match", field: "confirmPassword" });
      return false;
    }

    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      await axios.post("/api/auth/signup", {
        fullName: formData.fullName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        setError({ message: err.response.data.message || "Signup failed" });
      } else {
        setError({
          message: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.signupBox}>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Join our community today</p>

        {error && <div className={styles.error}>{error.message}</div>}
        {success && (
          <div className={styles.success}>
            Account created successfully! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSignup} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleInputChange}
              disabled={isLoading}
              className={`${styles.input} ${
                error?.field === "fullName" ? styles.inputError : ""
              }`}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
              className={`${styles.input} ${
                error?.field === "email" ? styles.inputError : ""
              }`}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleInputChange}
              disabled={isLoading}
              className={`${styles.input} ${
                error?.field === "username" ? styles.inputError : ""
              }`}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              className={`${styles.input} ${
                error?.field === "password" ? styles.inputError : ""
              }`}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={isLoading}
              className={`${styles.input} ${
                error?.field === "confirmPassword" ? styles.inputError : ""
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`${styles.button} ${isLoading ? styles.loading : ""}`}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className={styles.loginPrompt}>
          Already have an account?{" "}
          <Link to="/login" className={styles.loginLink}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
