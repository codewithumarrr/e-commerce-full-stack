import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock navigate function
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Authentication", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockNavigate.mockClear();
    mockedAxios.post.mockClear();
  });

  describe("Login Component", () => {
    const renderLogin = () =>
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

    it("renders login form correctly", () => {
      renderLogin();
      expect(
        screen.getByPlaceholderText("Enter your username")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter your password")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();
    });

    it("handles successful login", async () => {
      const mockToken = "mock-token";
      const mockUser = {
        id: "1",
        username: "testuser",
        role: "customer",
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: { token: mockToken, user: mockUser },
      });

      renderLogin();

      fireEvent.change(screen.getByPlaceholderText("Enter your username"), {
        target: { value: "testuser" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
        target: { value: "password123" },
      });

      // Check "Remember me"
      fireEvent.click(screen.getByRole("checkbox"));

      // Submit form
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith("/api/auth/login", {
          username: "testuser",
          password: "password123",
        });
        expect(localStorage.getItem("token")).toBe(mockToken);
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("handles login error", async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { message: "Invalid credentials" } },
      });

      renderLogin();

      fireEvent.change(screen.getByPlaceholderText("Enter your username"), {
        target: { value: "wronguser" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
        target: { value: "wrongpass" },
      });

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
        expect(localStorage.getItem("token")).toBeNull();
      });
    });
  });

  describe("Signup Component", () => {
    const renderSignup = () =>
      render(
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      );

    it("renders signup form correctly", () => {
      renderSignup();
      expect(
        screen.getByPlaceholderText("Enter your full name")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter your email")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Choose a username")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Create a password")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Confirm your password")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /create account/i })
      ).toBeInTheDocument();
    });

    it("validates password requirements", async () => {
      renderSignup();

      fireEvent.change(screen.getByPlaceholderText("Create a password"), {
        target: { value: "weak" },
      });

      fireEvent.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(
          screen.getByText(
            /password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters/i
          )
        ).toBeInTheDocument();
      });
    });

    it("handles successful signup", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { message: "Signup successful" },
      });

      renderSignup();

      fireEvent.change(screen.getByPlaceholderText("Enter your full name"), {
        target: { value: "Test User" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Choose a username"), {
        target: { value: "testuser" },
      });
      fireEvent.change(screen.getByPlaceholderText("Create a password"), {
        target: { value: "TestPass123!" },
      });
      fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
        target: { value: "TestPass123!" },
      });

      fireEvent.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith("/api/auth/signup", {
          fullName: "Test User",
          email: "test@example.com",
          username: "testuser",
          password: "TestPass123!",
        });
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });

    it("handles signup error", async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { message: "Username already exists" } },
      });

      renderSignup();

      fireEvent.change(screen.getByPlaceholderText("Enter your full name"), {
        target: { value: "Test User" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Choose a username"), {
        target: { value: "existinguser" },
      });
      fireEvent.change(screen.getByPlaceholderText("Create a password"), {
        target: { value: "TestPass123!" },
      });
      fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
        target: { value: "TestPass123!" },
      });

      fireEvent.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText("Username already exists")).toBeInTheDocument();
      });
    });
  });
});
