"use client";

import { useState, useRef, useEffect } from "react";

export default function BarcodeForm() {
  const [items, setItems] = useState({}); // { barcode: { name, quantity, rate, itemId } }
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, [items]);

  const handleScan = async (e) => {
    if (e.key === "Enter") {
      const barcode = e.target.value.trim();
      if (!barcode) return;

      try {
        // 🔹 Call backend API
        const res = await fetch("/api/barcodeScan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ barcode }),
        });

        if (!res.ok) {
          const err = await res.json();
          alert(err.message);
          e.target.value = "";
          return;
        }

        const { data } = await res.json();

        setItems((prevItems) => {
          const existingItem = prevItems[barcode];

          if (existingItem) {
            return {
              ...prevItems,
              [barcode]: {
                ...existingItem,
                quantity: existingItem.quantity + 1,
              },
            };
          } else {
            return {
              ...prevItems,
              [barcode]: {
                name: data.itemName,
                quantity: 1,
                rate: data.rate,
                itemId: data._id,
                unit: data.stockUnit,
              },
            };
          }
        });

        e.target.value = ""; // clear input
      } catch (error) {
        console.error("Scan error:", error);
        alert("Error scanning barcode");
      }
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
            <th style={{ border: "1px solid black", padding: "5px" }}>Rate</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(items).map(([barcode, item]) => (
            <tr key={barcode}>
              <td style={{ border: "1px solid black", padding: "5px" }}>{barcode}</td>
              <td style={{ border: "1px solid black", padding: "5px" }}>{item.name}</td>
              <td style={{ border: "1px solid black", padding: "5px" }}>{item.quantity}</td>
              <td style={{ border: "1px solid black", padding: "5px" }}>{item.rate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
