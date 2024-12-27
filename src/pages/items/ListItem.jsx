import React, { useState, useEffect } from "react";
import axios from "axios";

function ItemList({ categoryId }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`/api/items/category/${categoryId}`);
        setItems(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchItems();
  }, [categoryId]);

  return (
    <div>
      <h2>Daftar Barang</h2>
      <ul>
        {items.map((item) => (
          <li key={item.item_id}>
            {item.item_name} - {item.stock} {item.unit}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ItemList;
