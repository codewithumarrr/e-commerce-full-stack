import React from "react";
import { screen, waitFor } from "@testing-library/react";
import { render, mockAxiosResponse, userEvent } from "../utils/test-utils";
import axios from "axios";
import ProductCatalog from "../pages/ProductCatalog";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ProductCatalog", () => {
  const mockProducts = [
    {
      _id: "1",
      name: "Test Product 1",
      description: "Description 1",
      price: 99.99,
      imageUrl: "test1.jpg",
      category: "electronics",
      stockQuantity: 10,
      rating: 4.5,
      reviews: 12,
    },
    {
      _id: "2",
      name: "Test Product 2",
      description: "Description 2",
      price: 149.99,
      imageUrl: "test2.jpg",
      category: "clothing",
      stockQuantity: 5,
      rating: 4.0,
      reviews: 8,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {}));
    render(<ProductCatalog />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders products after successful fetch", async () => {
    mockedAxios.get.mockResolvedValueOnce(
      mockAxiosResponse({
        products: mockProducts,
        total: 2,
        totalPages: 1,
      })
    );

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      expect(screen.getByText("Test Product 2")).toBeInTheDocument();
    });

    expect(screen.getByText("$99.99")).toBeInTheDocument();
    expect(screen.getByText("$149.99")).toBeInTheDocument();
  });

  it("handles error state", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Failed to load products"));
    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load products/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it("filters products by category", async () => {
    mockedAxios.get.mockResolvedValueOnce(
      mockAxiosResponse({
        products: mockProducts,
        total: 2,
        totalPages: 1,
      })
    );

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    select.value = "electronics";
    select.dispatchEvent(new Event("change", { bubbles: true }));

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining("category=electronics")
    );
  });

  it("implements pagination", async () => {
    mockedAxios.get.mockResolvedValueOnce(
      mockAxiosResponse({
        products: mockProducts,
        total: 4,
        totalPages: 2,
      })
    );

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    const nextButton = screen.getByRole("button", { name: /next/i });
    nextButton.click();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining("page=2")
    );
  });

  it("handles search functionality", async () => {
    mockedAxios.get.mockResolvedValueOnce(
      mockAxiosResponse({
        products: mockProducts,
        total: 2,
        totalPages: 1,
      })
    );

    render(<ProductCatalog />);

    const searchInput = screen.getByPlaceholderText(
      /search products/i
    ) as HTMLInputElement;
    searchInput.value = "test";
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("search=test")
      );
    });
  });

  it("adds product to cart", async () => {
    mockedAxios.get.mockResolvedValueOnce(
      mockAxiosResponse({
        products: mockProducts,
        total: 2,
        totalPages: 1,
      })
    );

    mockedAxios.post.mockResolvedValueOnce(
      mockAxiosResponse({
        message: "Product added to cart",
      })
    );

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    const addToCartButton = screen.getAllByRole("button", {
      name: /add to cart/i,
    })[0];

    addToCartButton.click();

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/api/cart/add",
        expect.objectContaining({
          productId: "1",
          quantity: 1,
        })
      );
    });
  });

  it("displays out of stock message", async () => {
    const productsWithOutOfStock = [
      {
        ...mockProducts[0],
        stockQuantity: 0,
      },
    ];

    mockedAxios.get.mockResolvedValueOnce(
      mockAxiosResponse({
        products: productsWithOutOfStock,
        total: 1,
        totalPages: 1,
      })
    );

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
    });

    const addToCartButton = screen.getByRole("button", {
      name: /add to cart/i,
    });
    expect(addToCartButton).toBeDisabled();
  });

  it("handles price range filtering", async () => {
    mockedAxios.get.mockResolvedValueOnce(
      mockAxiosResponse({
        products: mockProducts,
        total: 2,
        totalPages: 1,
      })
    );

    render(<ProductCatalog />);

    const minPriceInput = screen.getByPlaceholderText(
      /min/i
    ) as HTMLInputElement;
    const maxPriceInput = screen.getByPlaceholderText(
      /max/i
    ) as HTMLInputElement;

    minPriceInput.value = "50";
    minPriceInput.dispatchEvent(new Event("input", { bubbles: true }));

    maxPriceInput.value = "100";
    maxPriceInput.dispatchEvent(new Event("input", { bubbles: true }));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("minPrice=50")
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("maxPrice=100")
      );
    });
  });

  it("handles sorting", async () => {
    mockedAxios.get.mockResolvedValueOnce(
      mockAxiosResponse({
        products: mockProducts,
        total: 2,
        totalPages: 1,
      })
    );

    render(<ProductCatalog />);

    const sortSelect = screen.getByRole("combobox", {
      name: /sort/i,
    }) as HTMLSelectElement;

    sortSelect.value = "price-asc";
    sortSelect.dispatchEvent(new Event("change", { bubbles: true }));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("sort=price-asc")
      );
    });
  });
});
