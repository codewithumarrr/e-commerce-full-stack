/// <reference types="@testing-library/jest-dom" />
/// <reference types="jest" />

declare namespace NodeJS {
  interface Global {
    document: Document;
    window: Window;
    navigator: Navigator;
  }
}

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.svg" {
  import React = require("react");
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.json" {
  const content: any;
  export default content;
}

declare module "@testing-library/jest-dom/extend-expect";

declare namespace jest {
  interface Matchers<R> {
    toBeInTheDocument(): R;
    toHaveClass(className: string): R;
    toHaveStyle(style: { [key: string]: any }): R;
    toBeVisible(): R;
    toBeDisabled(): R;
    toHaveAttribute(attr: string, value?: string): R;
    toHaveTextContent(text: string | RegExp): R;
    toHaveValue(value: string | string[] | number): R;
    toBeChecked(): R;
    toBeEmpty(): R;
    toBeRequired(): R;
    toHaveFocus(): R;
    toBeValid(): R;
    toBeInvalid(): R;
    toContainElement(element: HTMLElement | null): R;
    toContainHTML(html: string): R;
    toMatchSnapshot(): R;
  }
}

interface Window {
  matchMedia(query: string): MediaQueryList;
  IntersectionObserver: {
    new (
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit
    ): IntersectionObserver;
  };
}

declare module "@testing-library/react" {
  export interface RenderOptions {
    route?: string;
  }
}

// Add any additional type declarations needed for tests
declare module "identity-obj-proxy";
