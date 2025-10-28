import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Search,
  Event as EventIcon,
  Payment as PaymentIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NewClient from "../client/newClient";
import ViewClientDialog from "../client/clientDetails";
import WorkIcon from "@mui/icons-material/Work";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

/* ------------------ Project Card ------------------ */
const ProjectCard = ({ project, isDraft = false }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    const path = isDraft
      ? `/draftProject/${project.id}/edit`
      : `/project/${project.id}/edit`;
    navigate(path);
  };
  console.log("Project Data");
  console.log(project);

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

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            backgroundColor: "#f5f8ff",
            p: 1.5,
            borderRadius: 2,
            boxShadow: "inset 0 0 6px rgba(0,0,0,0.05)",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <PaymentIcon color="primary" />
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color="primary.main"
            >
              {project.currency} {project.amount?.toLocaleString()}
            </Typography>
          </Box>

          <Chip
            label={
              project.paymentStructure === "single"
                ? "💰 Single Payment"
                : project.paymentStructure === "multiple"
                ? "📦 Multiple Payments"
                : project.paymentStructure === "recurring"
                ? "🔁 Recurring Payment"
                : project.paymentStructure || "N/A"
            }
            sx={{
              fontWeight: 500,
              borderRadius: "12px",
              backgroundColor:
                project.paymentStructure === "single"
                  ? "#e3f2fd"
                  : project.paymentStructure === "multiple"
                  ? "#e8f5e9"
                  : project.paymentStructure === "recurring"
                  ? "#fff3e0"
                  : "#f5f5f5",
              color:
                project.paymentStructure === "single"
                  ? "#1565c0"
                  : project.paymentStructure === "multiple"
                  ? "#2e7d32"
                  : project.paymentStructure === "recurring"
                  ? "#ef6c00"
                  : "#616161",
            }}
          />
        </Box>

        <Box mt={2}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Chip
              label={project.tag || "General"}
              size="small"
              variant="outlined"
              color="primary"
            />
          </Box>
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

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");

  // Pagination
  const [projectPage, setProjectPage] = useState(1);
  const [paymentFilter, setPaymentFilter] = useState("");
  const [draftPage, setDraftPage] = useState(1);
  const [clientPage, setClientPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  // Modals
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [viewClientOpen, setViewClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const navigate = useNavigate();
  const handleCloseViewClient = () => {
    setSelectedClient(null);
    setViewClientOpen(false);
  };

  const departments = [
    {
      id: "single",
      title: "Single Payment",
      desc: "Get paid in one transaction, either before or after delivery",
      icon: <WorkIcon />,
    },
    {
      id: "multiple",
      title: "Multiple Payments",
      desc: "Split payment into milestones tied to project phases",
      icon: <DesignServicesIcon />,
    },
    {
      id: "recurring",
      title: "Recurring Payment",
      desc: "Regular fixed payments on a scheduled basis",
      icon: <SupportAgentIcon />,
    },
  ];

  const baseURL = process.env.REACT_APP_BASE_URL;

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
          paymentStructure: p.paymentStructure,
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
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseURL]);

  /* 🔹 Filter + Sort Logic */
  // ✅ Unified filtering + sorting logic for all tabs
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(lower) ||
          p.type?.toLowerCase().includes(lower) ||
          p.tag?.toLowerCase().includes(lower) ||
          p.paymentType?.toLowerCase().includes(lower)
      );
    }

    // ✅ Payment filter
    if (paymentFilter)
      filtered = filtered.filter(
        (p) =>
          p.paymentStructure?.toLowerCase() ===
          paymentFilter.toLowerCase().replace(" payment", "")
      );

    // ✅ Status filter
    if (statusFilter)
      filtered = filtered.filter(
        (p) => p.status?.toLowerCase() === statusFilter.toLowerCase()
      );

    // ✅ Type filter
    if (typeFilter)
      filtered = filtered.filter(
        (p) => p.type?.toLowerCase() === typeFilter.toLowerCase()
      );

    // ✅ Sorting
    if (sortOrder === "latest")
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortOrder === "oldest")
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortOrder === "amount-high")
      filtered.sort(
        (a, b) => parseFloat(b.amount || 0) - parseFloat(a.amount || 0)
      );
    else if (sortOrder === "amount-low")
      filtered.sort(
        (a, b) => parseFloat(a.amount || 0) - parseFloat(b.amount || 0)
      );

    return filtered;
  }, [projects, search, statusFilter, typeFilter, sortOrder, paymentFilter]);
  // ✅ Drafts
  const filteredDrafts = useMemo(() => {
    let filtered = [...drafts];

    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(lower) ||
          p.type?.toLowerCase().includes(lower) ||
          p.tag?.toLowerCase().includes(lower)
      );
    }

    if (typeFilter)
      filtered = filtered.filter(
        (p) => p.type?.toLowerCase() === typeFilter.toLowerCase()
      );

    if (sortOrder === "latest")
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortOrder === "oldest")
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return filtered;
  }, [drafts, search, typeFilter, sortOrder]);

  // ✅ Clients
  const filteredClients = useMemo(() => {
    let filtered = [...clients];

    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name?.toLowerCase().includes(lower) ||
          c.email?.toLowerCase().includes(lower) ||
          c.phone?.toLowerCase().includes(lower)
      );
    }

    if (sortOrder === "latest")
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortOrder === "oldest")
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return filtered;
  }, [clients, search, sortOrder]);

  /* 🔹 Pagination */
  const paginate = (data, page) =>
    data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const paginatedProjects = paginate(filteredProjects, projectPage);
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

      {/* 🔹 Filter Bar for Projects */}
      {activeTab === 0 && (
        <Box
          display="flex"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          mb={3}
          sx={{ bgcolor: "#f9f9f9", p: 2, borderRadius: 2 }}
        >
          <TextField
            size="small"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />

          {/* 🔹 Payment Filter */}
          <Select
            size="small"
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              // reset others
              setStatusFilter("");
              setTypeFilter("");
            }}
            displayEmpty
          >
            <MenuItem value="">All Payment Types</MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.title}>
                {dept.title}
              </MenuItem>
            ))}
          </Select>

          {/* 🔹 Status Filter */}
          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              // reset others
              setPaymentFilter("");
              setTypeFilter("");
            }}
            displayEmpty
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="In Process">In Process</MenuItem>
            <MenuItem value="Contract Signed & Uploaded">
              Contract Signed & Uploaded
            </MenuItem>
            <MenuItem value="Project Started">Project Started</MenuItem>
            <MenuItem value="Project Completed">Project Completed</MenuItem>
            <MenuItem value="Project Delayed">Project Delayed</MenuItem>
          </Select>

          {/* 🔹 Type Filter */}
          <Select
            size="small"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              // reset others
              setPaymentFilter("");
              setStatusFilter("");
            }}
            displayEmpty
          >
            <MenuItem value="">All Types</MenuItem>
            {[...new Set(projects.map((p) => p.type))].map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>

          <IconButton
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setTypeFilter("");
              setPaymentFilter("");
              setSortOrder("latest");
            }}
          >
            <FilterListIcon />
          </IconButton>
        </Box>
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
      {/* 🔹 Projects Tab */}
      {activeTab === 0 &&
        (paginatedProjects.length > 0 ? (
          <>
            {paginatedProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={Math.ceil(filteredProjects.length / rowsPerPage)}
                page={projectPage}
                onChange={(e, value) => setProjectPage(value)}
              />
            </Box>
          </>
        ) : (
          <Typography>No matching projects found.</Typography>
        ))}

      {/* Clients and Drafts remain same as your original */}
      {/* You can easily add similar filters to those tabs too if you want */}
    </Box>
  );
};

export default ProjectList;
