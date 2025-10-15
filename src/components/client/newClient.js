import React, { useState } from "react";
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Button,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const NewClient = ({ onClose }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    clientType: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    contactPersonName: "",
    contactPersonRole: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ----------------------------
  // Handlers
  // ----------------------------
  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[+]?[\d\s\-()]{7,15}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number";
    }

    if (!formData.clientType) {
      newErrors.clientType = "Client type is required";
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8080/api/clients", formData);

      console.log("✅ Client created:", res.data);
      onClose(); // Close modal after success
    } catch (err) {
      if (err.response) {
        console.error("❌ API Error:", err.response.data.message);
        alert(err.response.data.message); // show backend error (e.g. duplicate phone)
      } else {
        console.error("❌ Network Error:", err.message);
        alert("Network error, please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <>
      <DialogTitle sx={{ fontWeight: "bold" }}>Add New Client</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {/* Full Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Full Name *"
              value={formData.fullName}
              onChange={handleChange("fullName")}
              fullWidth
              size="small"
              error={!!errors.fullName}
              helperText={errors.fullName}
            />
          </Grid>

          {/* Company */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Company"
              value={formData.company}
              onChange={handleChange("company")}
              fullWidth
              size="small"
            />
          </Grid>

          {/* Client Type */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Client Type *"
              value={formData.clientType}
              onChange={handleChange("clientType")}
              fullWidth
              size="small"
              error={!!errors.clientType}
              helperText={errors.clientType}
              SelectProps={{ fullWidth: true }}
            >
              <MenuItem value="">Select a client type</MenuItem>
              <MenuItem value="individual">Individual</MenuItem>
              <MenuItem value="brand">Brand</MenuItem>
            </TextField>
          </Grid>

          {/* Email */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email *"
              value={formData.email}
              onChange={handleChange("email")}
              fullWidth
              size="small"
              type="email"
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>

          {/* Contact Person Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Contact Person Name"
              value={formData.contactPersonName}
              onChange={handleChange("contactPersonName")}
              fullWidth
              size="small"
            />
          </Grid>

          {/* Contact Person Role */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Contact Person Role"
              value={formData.contactPersonRole}
              onChange={handleChange("contactPersonRole")}
              fullWidth
              size="small"
            />
          </Grid>

          {/* Phone */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Phone *"
              value={formData.phone}
              onChange={handleChange("phone")}
              fullWidth
              size="small"
              type="tel"
              error={!!errors.phone}
              helperText={errors.phone}
            />
          </Grid>

          {/* Address (full width) */}
          <Grid item xs={12}>
            <TextField
              label="Address"
              value={formData.address}
              onChange={handleChange("address")}
              fullWidth
              size="small"
              multiline
              minRows={2}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} /> : null}
        >
          {loading ? "Creating..." : "Create Client"}
        </Button>
      </DialogActions>
    </>
  );
};

export default NewClient;
