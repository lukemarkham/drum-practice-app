import React from "react";

// Simple button component
export const Button = ({ onClick, children }) => (
  <button onClick={onClick} style={{ padding: "10px", margin: "5px", fontSize: "16px" }}>
    {children}
  </button>
);

// Simple card component
export const Card = ({ children }) => (
  <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px", borderRadius: "5px" }}>
    {children}
  </div>
);

// Card content wrapper
export const CardContent = ({ children }) => <div>{children}</div>;

// Simple slider component
export const Slider = ({ value, min, max, onChange }) => (
  <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(e.target.value)} />
);