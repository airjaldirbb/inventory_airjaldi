"use client";

import { useState, useRef, useEffect } from "react";

export default function BarcodeForm() {
  const [items, setItems] = useState({}); // { barcode: { name, quantity } }
  const inputRef = useRef(null);

  // Keep input focused for continuous scanning
  useEffect(() => {
    inputRef.current.focus();
  }, [items]);

  const handleScan = (e) => {
    if (e.key === "Enter") {
      const barcode = e.target.value.trim();
      if (!barcode) return;

      setItems((prevItems) => {
        // Check if barcode already exists
        const existingItem = prevItems[barcode];

        if (existingItem) {
          // Increment quantity
          return {
            ...prevItems,
            [barcode]: {
              ...existingItem,
              quantity: existingItem.quantity + 1,
            },
          };
        } else {
          // New item, set quantity to 1
          return {
            ...prevItems,
            [barcode]: { name: `Item ${barcode}`, quantity: 1 },
          };
        }
      });

      e.target.value = ""; // Clear input for next scan
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Scan Items</h1>
      <input
        ref={inputRef}
        type="text"
        placeholder="Scan barcode here"
        onKeyDown={handleScan}
        style={{ padding: "10px", fontSize: "16px", width: "300px" }}
        autoFocus
      />

      <h2>Scanned Items</h2>
      <table style={{ marginTop: "20px", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black", padding: "5px" }}>Barcode</th>
            <th style={{ border: "1px solid black", padding: "5px" }}>Name</th>
            <th style={{ border: "1px solid black", padding: "5px" }}>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(items).map(([barcode, item]) => (
            <tr key={barcode}>
              <td style={{ border: "1px solid black", padding: "5px" }}>{barcode}</td>
              <td style={{ border: "1px solid black", padding: "5px" }}>{item.name}</td>
              <td style={{ border: "1px solid black", padding: "5px" }}>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
