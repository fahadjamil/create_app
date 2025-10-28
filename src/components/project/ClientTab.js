import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
  Chip,
  Dialog,
} from "@mui/material";
import { Email, Phone, LocationOn } from "@mui/icons-material";
import NewClient from "../client/newClient"; // ✅ adjust capitalization
// Remove import of ViewClientDialog — not needed anymore

const ClientTab = ({
  clients = [],
  clientModalOpen,
  setClientModalOpen,
}) => {
  const navigate = useNavigate();

  return (
    <>
      {/* --- Add New Client Button --- */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          onClick={() => setClientModalOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Add New Client
        </Button>
      </Box>

      {/* --- Clients Grid --- */}
      {clients.length > 0 ? (
        <Grid container spacing={3}>
          {clients.map((client) => (
            <Grid item key={client.id}>
              <Card
                elevation={4}
                sx={{
                  width: 280,
                  height: 300,
                  borderRadius: 3,
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                  }}
                >
                  {/* --- Header --- */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h6" fontWeight="bold" noWrap>
                        {client.fullName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {client.company || "No company"}
                      </Typography>
                    </Box>
                    <Chip
                      label={client.clientType}
                      color="primary"
                      size="small"
                    />
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {/* --- Contact Info --- */}
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2" noWrap>
                        {client.email || "—"}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2" noWrap>
                        {client.phone || "—"}
                      </Typography>
                    </Box>
                    {client.address && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2" noWrap>
                          {client.address}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {/* --- Footer --- */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="caption" color="text.secondary" noWrap>
                      Contact: {client.contactPersonName || "N/A"} (
                      {client.contactPersonRole || "N/A"})
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/clients/${client.id}`)} // ✅ navigate to details
                    >
                      View
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography textAlign="center" mt={4}>
          No clients found.
        </Typography>
      )}

      {/* --- Add Client Dialog --- */}
      <Dialog
        open={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <NewClient onClose={() => setClientModalOpen(false)} />
      </Dialog>
    </>
  );
};

export default ClientTab;
