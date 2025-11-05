"use client";

import React from "react";
import { useAppContext } from "../context/AppContext";

const ExampleUsingContext = () => {
  const { user, isAuthenticated, theme, setTheme } = useAppContext();

  return (
    <div className={`theme-${theme}`}>
      <h2>Example Component Using Context</h2>

      <div className="info-block">
        <h3>Authentication Status:</h3>
        <p>{isAuthenticated ? "Logged In" : "Not Logged In"}</p>
      </div>

      {user && (
        <div className="info-block">
          <h3>User Information:</h3>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
      )}

      <div className="info-block">
        <h3>Current Theme: {theme}</h3>
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="theme-toggle"
        >
          Toggle Theme
        </button>
      </div>
    </div>
  );
};

export default ExampleUsingContext;
