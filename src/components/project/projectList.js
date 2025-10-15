import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Dialog,
  Button,
  Divider,
  LinearProgress,
  CircularProgress,
  Alert,
  Pagination,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import PaymentIcon from "@mui/icons-material/Payment";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NewClient from "../client/newClient";
import ViewClientDialog from "../client/clientDetails";

/* ------------------ Project Card ------------------ */
const ProjectCard = ({ project, isDraft = false }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    const path = isDraft
      ? `/draftProject/${project.id}/edit`
      : `/project/${project.id}/edit`;
    navigate(path);
  };

  return (
    <Card
      elevation={4}
      sx={{
        mb: 3,
        borderRadius: 3,
        cursor: "pointer",
        transition: "0.3s",
        "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
      }}
      onClick={handleNavigate}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            {project.name}
          </Typography>
          <Chip
            label={project.status}
            color={project.status === "Draft" ? "warning" : "info"}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" mt={1}>
          {project.type}
        </Typography>

        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
          <EventIcon fontSize="small" color="action" />
          <Typography variant="caption" color="text.secondary">
            Due: {project.dueDate || "Not set"}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight="bold">
            {project.currency} {project.amount}
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5}>
            <PaymentIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {project.paymentType}
            </Typography>
          </Box>
        </Box>

        <Box mt={2}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Chip
              label={project.tag || "General"}
              size="small"
              variant="outlined"
              color="primary"
            />
            <Typography variant="caption" color="text.secondary">
              {project.progress ?? 0}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={project.progress ?? 0}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

/* ------------------ Main Component ------------------ */
const ProjectList = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [projects, setProjects] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [projectPage, setProjectPage] = useState(1);
  const [draftPage, setDraftPage] = useState(1);
  const [clientPage, setClientPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  // Modals
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [viewClientOpen, setViewClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const navigate = useNavigate();

  const baseURL = process.env.REACT_APP_BASE_URL;

  /* 🔹 Handle Client View */
  const handleViewClient = async (clientId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${baseURL}/api/clients/${clientId}`);
      setSelectedClient(res.data);
      setViewClientOpen(true);
    } catch (err) {
      console.error("Error fetching client details:", err);
      setError("Failed to load client details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseViewClient = () => {
    setSelectedClient(null);
    setViewClientOpen(false);
  };

  /* 🔹 Fetch Data */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.uid) throw new Error("User not logged in.");

        const payload = { userId: user.uid };
        const [projectsRes, draftsRes, clientsRes] = await Promise.all([
          axios.post(`${baseURL}/project/all_projects`, payload),
          axios.post(`${baseURL}/project/all_draftProject`, payload),
          axios.get(`${baseURL}/api/clients`),
        ]);

        const normalizeProject = (p, isDraft = false) => ({
          id: p.pid || p.dpid,
          name: p.projectName,
          type: p.projectType,
          dueDate: p.endDate,
          currency: p.currency,
          amount: p.projectAmount,
          paymentType: p.paymentType,
          status: isDraft ? "Draft" : p.projectStatus,
          tag: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags,
          progress: 0,
          createdAt: p.createdAt || p.updatedAt || null,
        });

        setProjects(
          (projectsRes.data?.data || [])
            .map((p) => normalizeProject(p))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
        setDrafts(
          (draftsRes.data?.data || [])
            .map((d) => normalizeProject(d, true))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
        setClients(clientsRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err.message || "Failed to fetch data. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseURL]);

  /* 🔹 Pagination Helpers */
  const paginate = (data, page) =>
    data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const paginatedProjects = paginate(projects, projectPage);
  const paginatedDrafts = paginate(drafts, draftPage);
  const paginatedClients = paginate(clients, clientPage);

  /* ------------------ Render ------------------ */
  if (loading)
    return (
      <Box textAlign="center" mt={3}>
        <CircularProgress />
        <Typography variant="body2" mt={1}>
          Loading data...
        </Typography>
      </Box>
    );

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box p={3}>
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab label="Projects" />
        <Tab label="Clients" />
        <Tab label="Drafts" />
      </Tabs>

      {/* ------------------ Clients Tab ------------------ */}
      {activeTab === 1 && (
        <>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              onClick={() => setClientModalOpen(true)}
            >
              Add New Client
            </Button>
          </Box>

          <Grid container spacing={3} justifyContent="center">
            {paginatedClients.map((c) => (
              <Grid item key={c.id}>
                <Card
                  elevation={4}
                  sx={{
                    width: 280, // ✅ fixed width
                    height: 300, // ✅ fixed height
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "0.3s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      overflow: "hidden",
                    }}
                  >
                    {/* Header */}
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" fontWeight="bold" noWrap>
                          {c.fullName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          {c.company || "No company"}
                        </Typography>
                      </Box>
                      <Chip label={c.clientType} color="primary" size="small" />
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Info */}
                    <Box
                      display="flex"
                      flexDirection="column"
                      gap={1}
                      flexGrow={1}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2" noWrap>
                          {c.email}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2" noWrap>
                          {c.phone}
                        </Typography>
                      </Box>
                      {c.address && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOnIcon fontSize="small" color="action" />
                          <Typography variant="body2" noWrap>
                            {c.address}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Footer */}
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                      >
                        Contact: {c.contactPersonName || "N/A"} (
                        {c.contactPersonRole || "N/A"})
                      </Typography>

                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => navigate(`/client/${c.cid}`)}
                      >
                        View
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          <Box display="flex" justifyContent="space-between" mt={3}>
            <Pagination
              count={Math.ceil(clients.length / rowsPerPage)}
              page={clientPage}
              onChange={(e, value) => setClientPage(value)}
              color="primary"
              shape="rounded"
            />
            <Select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(e.target.value);
                setClientPage(1);
              }}
              size="small"
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
            </Select>
          </Box>

          {/* Modals */}
          <Dialog
            open={clientModalOpen}
            onClose={() => setClientModalOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <NewClient onClose={() => setClientModalOpen(false)} />
          </Dialog>

          <ViewClientDialog
            open={viewClientOpen}
            onClose={handleCloseViewClient}
            client={selectedClient}
          />
        </>
      )}

      {/* ------------------ Drafts Tab ------------------ */}
      {activeTab === 2 &&
        (paginatedDrafts.length > 0 ? (
          <>
            {paginatedDrafts.map((d) => (
              <ProjectCard key={d.id} project={d} isDraft />
            ))}
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={Math.ceil(drafts.length / rowsPerPage)}
                page={draftPage}
                onChange={(e, value) => setDraftPage(value)}
              />
            </Box>
          </>
        ) : (
          <Typography>No draft projects available.</Typography>
        ))}

      {/* ------------------ Projects Tab ------------------ */}
      {activeTab === 0 &&
        (paginatedProjects.length > 0 ? (
          <>
            {paginatedProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={Math.ceil(projects.length / rowsPerPage)}
                page={projectPage}
                onChange={(e, value) => setProjectPage(value)}
              />
            </Box>
          </>
        ) : (
          <Typography>No projects found.</Typography>
        ))}
    </Box>
  );
};

export default ProjectList;
