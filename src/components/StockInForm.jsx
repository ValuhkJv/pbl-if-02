import React, { useState } from "react";
import { TextField, Button, Grid } from "@mui/material";

const StockInForm = ({ data, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    item_id: data?.item_id || "",
    quantity: data?.quantity || "",
    notes: data?.notes || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="ID Barang"
            name="item_id"
            value={formData.item_id}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Jumlah"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Catatan"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} textAlign="right">
          <Button variant="contained" color="primary" type="submit">
            Simpan
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onCancel}
            style={{ marginLeft: 8 }}
          >
            Batal
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default StockInForm;
