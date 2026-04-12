import React from "react";
import { useConfig } from "../context/ConfigContext";

const TakaIcon = ({ className = "" }) => {
  const { config } = useConfig();
  const symbol = config?.currency_symbol;

  if (symbol) {
    return <span className={`font-semibold ${className}`}>{symbol}</span>;
  }

  // Fallback to Taka SVG if no symbol is configured
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 w-4 h-4 ${className}`}
    >
      <path d="M15.5 15.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
      <path d="M7 7a2 2 0 1 1 4 0v9a3 3 0 0 0 6 0v-.5" />
      <path d="M8 11h6" />
    </svg>
  );
};

export default TakaIcon;