import "@testing-library/jest-dom";
import { ReactElement } from "react";

declare module "@testing-library/react" {
  export interface RenderResult {
    container: HTMLElement;
    baseElement: HTMLElement;
    debug: (baseElement?: HTMLElement | DocumentFragment) => void;
    rerender: (ui: ReactElement) => void;
    unmount: () => void;
    asFragment: () => DocumentFragment;
  }

  export interface RenderOptions {
    container?: HTMLElement;
    baseElement?: HTMLElement;
    hydrate?: boolean;
    wrapper?: React.ComponentType<{ children: React.ReactNode }>;
    route?: string;
  }

  export function render(
    ui: ReactElement,
    options?: RenderOptions
  ): RenderResult & { [key: string]: any };

  export const screen: {
    getByText: (text: string | RegExp) => HTMLElement;
    getByRole: (
      role: string,
      options?: { name?: string | RegExp }
    ) => HTMLElement;
    getByPlaceholderText: (text: string | RegExp) => HTMLElement;
    getByTestId: (testId: string) => HTMLElement;
    queryByText: (text: string | RegExp) => HTMLElement | null;
    queryByRole: (
      role: string,
      options?: { name?: string | RegExp }
    ) => HTMLElement | null;
    queryByPlaceholderText: (text: string | RegExp) => HTMLElement | null;
    queryByTestId: (testId: string) => HTMLElement | null;
    findByText: (text: string | RegExp) => Promise<HTMLElement>;
    findByRole: (
      role: string,
      options?: { name?: string | RegExp }
    ) => Promise<HTMLElement>;
    findByPlaceholderText: (text: string | RegExp) => Promise<HTMLElement>;
    findByTestId: (testId: string) => Promise<HTMLElement>;
    getAllByText: (text: string | RegExp) => HTMLElement[];
    getAllByRole: (
      role: string,
      options?: { name?: string | RegExp }
    ) => HTMLElement[];
    getAllByPlaceholderText: (text: string | RegExp) => HTMLElement[];
    getAllByTestId: (testId: string) => HTMLElement[];
  };

  export const fireEvent: {
    click: (element: HTMLElement) => boolean;
    change: (
      element: HTMLElement,
      options?: { target: { value: string } }
    ) => boolean;
    submit: (element: HTMLElement) => boolean;
    keyDown: (element: HTMLElement, options?: { key: string }) => boolean;
    keyUp: (element: HTMLElement, options?: { key: string }) => boolean;
    keyPress: (element: HTMLElement, options?: { key: string }) => boolean;
    focus: (element: HTMLElement) => boolean;
    blur: (element: HTMLElement) => boolean;
  };

  export function waitFor<T>(
    callback: () => T | Promise<T>,
    options?: {
      container?: HTMLElement;
      timeout?: number;
      interval?: number;
      mutationObserverOptions?: MutationObserverInit;
    }
  ): Promise<T>;
}

declare module "@testing-library/jest-dom/extend-expect";

declare namespace jest {
  type Mocked<T> = {
    [P in keyof T]: T[P] extends Function
      ? jest.MockInstance<ReturnType<T[P]>, Parameters<T[P]>>
      : T[P];
  } & T;

  interface MockInstance<T, Y extends any[]> {
    new (...args: Y): T;
    (...args: Y): T;
    mockClear(): void;
    mockReset(): void;
    mockImplementation(fn: (...args: Y) => T): this;
    mockImplementationOnce(fn: (...args: Y) => T): this;
    mockReturnValue(value: T): this;
    mockReturnValueOnce(value: T): this;
    mockResolvedValue(value: T): this;
    mockResolvedValueOnce(value: T): this;
    mockRejectedValue(value: any): this;
    mockRejectedValueOnce(value: any): this;
  }
}

declare module "axios" {
  interface AxiosStatic {
    isAxiosError(payload: any): payload is AxiosError;
  }
}
