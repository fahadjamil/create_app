import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Divider,
  Avatar,
  Grid,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    clientType: "",
    contactPersonName: "",
    contactPersonRole: "",
  });
  const [saving, setSaving] = useState(false);

  // ✅ Fetch client
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/clients/${id}`);
        setClient(res.data);
        setFormData(res.data);
      } catch (err) {
        console.error("Error fetching client:", err);
        setError("Failed to load client details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchClient();
  }, [id]);

  const handleOpenEdit = () => setOpenEdit(true);
  const handleCloseEdit = () => setOpenEdit(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Handle client update
  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await axios.put(`http://localhost:8080/api/clients/${id}`, formData);
      setClient(res.data.client);
      handleCloseEdit();
    } catch (err) {
      console.error("Error updating client:", err);
      alert(err.response?.data?.message || "Failed to update client");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!client) {
    return <Alert severity="info">No client found.</Alert>;
  }

  return (
    <Box
      sx={{
        bgcolor: "#f8f9fb",
        p: 3,
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header Section */}
      <Grid container alignItems="center" spacing={2}>
        <Grid item>
          <Avatar sx={{ width: 64, height: 64, bgcolor: "#f0f2f5" }}>
            <PersonOutlineIcon sx={{ fontSize: 36, color: "#6b7280" }} />
          </Avatar>
        </Grid>
        <Grid item xs>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {client.fullName}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
            {client.company || "—"}
          </Typography>
        </Grid>
        <Grid item>
          <Chip
            label={client.status || "active"}
            color="primary"
            size="small"
            sx={{
              textTransform: "capitalize",
              bgcolor: "#1e2a47",
              color: "#fff",
            }}
          />
        </Grid>
      </Grid>

      {/* Contact Info */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ mt: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <EmailOutlinedIcon sx={{ color: "text.secondary" }} />
          <Typography>{client.email}</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <PhoneOutlinedIcon sx={{ color: "text.secondary" }} />
          <Typography>{client.phone}</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <LocationOnOutlinedIcon sx={{ color: "text.secondary" }} />
          <Typography>{client.address || "—"}</Typography>
        </Stack>
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Details */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Client Type
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {client.clientType || "—"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Contact Person
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {client.contactPersonName || "—"}{" "}
            {client.contactPersonRole && (
              <span style={{ color: "#6b7280" }}>
                ({client.contactPersonRole})
              </span>
            )}
          </Typography>
        </Grid>
      </Grid>

      {/* Buttons */}
      <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
        <Button variant="contained" color="primary" onClick={handleOpenEdit}>
          Edit Client
        </Button>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>

      {/* ✏️ Edit Dialog */}
      <Dialog open={openEdit} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Client Details</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                name="fullName"
                fullWidth
                value={formData.fullName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Company"
                name="company"
                fullWidth
                value={formData.company || ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                name="email"
                fullWidth
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                name="phone"
                fullWidth
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Address"
                name="address"
                fullWidth
                value={formData.address || ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Client Type"
                name="clientType"
                fullWidth
                value={formData.clientType || ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Contact Person Name"
                name="contactPersonName"
                fullWidth
                value={formData.contactPersonName || ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Contact Person Role"
                name="contactPersonRole"
                fullWidth
                value={formData.contactPersonRole || ""}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientDetails;
