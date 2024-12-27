import React, { useState } from "react";
import axios from "axios";

function ItemForm() {
  const [formData, setFormData] = useState({
    item_code: "",
    item_name: "",
    category_id: "",
    unit: "",
    stock: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/items", formData);
      alert("Barang berhasil ditambahkan");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="item_code"
        placeholder="Kode Barang"
        value={formData.item_code}
        onChange={handleChange}
      />
      <input
        name="item_name"
        placeholder="Nama Barang"
        value={formData.item_name}
        onChange={handleChange}
      />
      <input
        name="category_id"
        placeholder="ID Kategori"
        value={formData.category_id}
        onChange={handleChange}
      />
      <input
        name="unit"
        placeholder="Satuan"
        value={formData.unit}
        onChange={handleChange}
      />
      <input
        name="stock"
        placeholder="Stok"
        value={formData.stock}
        onChange={handleChange}
      />
      <button type="submit">Simpan</button>
    </form>
  );
}

export default ItemForm;
