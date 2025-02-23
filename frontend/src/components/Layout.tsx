import React from "react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="layout">
      <header>
        <h1>E-Commerce Application</h1>
      </header>
      <main>{children}</main>
      <footer>
        <p>&copy; 2025 E-Commerce Application</p>
      </footer>
    </div>
  );
};
