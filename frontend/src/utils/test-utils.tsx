import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  route?: string;
}

// Create a custom render function that includes providers
const customRender = (
  ui: ReactElement,
  { route = "/", ...renderOptions }: CustomRenderOptions = {}
) => {
  // Push the route to history
  window.history.pushState({}, "Test page", route);

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything
export * from "@testing-library/react";

// Override render method
export { customRender as render };

// Custom test utilities
export const mockAxiosResponse = <T,>(data: T) => ({
  data,
  status: 200,
  statusText: "OK",
  headers: {},
  config: {},
});

export const mockAxiosError = (status: number, message: string) => ({
  response: {
    data: { message },
    status,
  },
});

export const waitForLoadingToFinish = async () => {
  // Wait for any loading states to resolve
  await new Promise((resolve) => setTimeout(resolve, 0));
};

export const createMockUser = (overrides = {}) => ({
  _id: "test-user-id",
  username: "testuser",
  email: "test@example.com",
  fullName: "Test User",
  role: "customer" as const,
  ...overrides,
});

export const createMockProduct = (overrides = {}) => ({
  _id: "test-product-id",
  name: "Test Product",
  description: "A test product",
  price: 99.99,
  stockQuantity: 10,
  category: "test-category",
  imageUrl: "test-image.jpg",
  rating: 4.5,
  reviews: [],
  ...overrides,
});

export const createMockOrder = (overrides = {}) => ({
  _id: "test-order-id",
  orderNumber: "ORD-123",
  userId: "test-user-id",
  products: [
    {
      productId: "test-product-id",
      name: "Test Product",
      price: 99.99,
      quantity: 1,
    },
  ],
  subtotal: 99.99,
  tax: 10.0,
  shipping: 5.0,
  total: 114.99,
  status: "pending" as const,
  createdAt: new Date().toISOString(),
  ...overrides,
});

// Helper to simulate user events with proper timing
export const userEvent = {
  type: async (element: HTMLElement, text: string) => {
    if (
      !(element instanceof HTMLInputElement) &&
      !(element instanceof HTMLTextAreaElement)
    ) {
      throw new Error("Element must be an input or textarea");
    }

    // Simulate realistic typing
    for (const char of text.split("")) {
      element.focus();
      await new Promise((resolve) => setTimeout(resolve, 50));
      document.activeElement?.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: char,
          bubbles: true,
        })
      );
      element.value += char;
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }
    element.blur();
  },
  selectOption: (element: HTMLSelectElement, value: string) => {
    if (!(element instanceof HTMLSelectElement)) {
      throw new Error("Element must be a select element");
    }
    element.value = value;
    element.dispatchEvent(new Event("change", { bubbles: true }));
  },
  upload: async (element: HTMLInputElement, file: File) => {
    if (!(element instanceof HTMLInputElement)) {
      throw new Error("Element must be an input element");
    }
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    element.files = dataTransfer.files;
    element.dispatchEvent(new Event("change", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
  },
};

// Helper to create test IDs
export const createTestId = (component: string, element: string): string =>
  `${component}-${element}`;

// Helper to find elements by test ID
export const byTestId = (testId: string): string => `[data-testid="${testId}"]`;

// Type guard for HTML element types
export const isInputElement = (
  element: HTMLElement
): element is HTMLInputElement => element instanceof HTMLInputElement;

export const isSelectElement = (
  element: HTMLElement
): element is HTMLSelectElement => element instanceof HTMLSelectElement;

export const isTextAreaElement = (
  element: HTMLElement
): element is HTMLTextAreaElement => element instanceof HTMLTextAreaElement;
