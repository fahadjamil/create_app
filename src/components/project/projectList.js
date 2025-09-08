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
  Divider,
  LinearProgress,
  CircularProgress,
  Alert,
  Pagination,
  Select,
  MenuItem,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import PaymentIcon from "@mui/icons-material/Payment";

const ProjectCard = ({ project, isDraft = false }) => {
  const navigate = useNavigate();

  return (
    <Card
      elevation={4}
      sx={{ mb: 3, borderRadius: 3, cursor: "pointer" }}
      onClick={() =>
        isDraft
          ? navigate(`/draftProject/${project.id}/edit`)
          : navigate(`/project/${project.id}/edit`)
      }
    >
      <CardContent>
        {/* Title + Status */}
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

        {/* Type + Due Date */}
        <Box mt={1}>
          <Typography variant="body2" color="text.secondary">
            {project.type}
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
            <EventIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              Due: {project.dueDate || "Not set"}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Payment + Currency */}
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

        {/* Tags + Progress */}
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

const ProjectList = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [projects, setProjects] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination states (per tab)
  const [projectPage, setProjectPage] = useState(1);
  const [draftPage, setDraftPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.uid) {
          setError("User not logged in.");
          setLoading(false);
          return;
        }

        const payload = { userId: user?.uid };

        const [projectsRes, draftsRes] = await Promise.all([
          axios.post("https://create-backend-two.vercel.app/project/all_projects", payload),
          axios.post("https://create-backend-two.vercel.app/project/all_draftProject", payload),
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
          createdAt: p.createdAt || p.updatedAt || null, // ✅ for sorting
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
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Paginate data
  const paginatedProjects = projects.slice(
    (projectPage - 1) * rowsPerPage,
    projectPage * rowsPerPage
  );
  const paginatedDrafts = drafts.slice(
    (draftPage - 1) * rowsPerPage,
    draftPage * rowsPerPage
  );

  return (
    <Box p={3}>
      {/* Tabs */}
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

      {/* Loading / Error */}
      {loading && (
        <Box textAlign="center" mt={3}>
          <CircularProgress />
          <Typography variant="body2" mt={1}>
            Loading projects...
          </Typography>
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* List */}
      {!loading && !error && (
        <>
          {/* Projects Tab */}
          {activeTab === 0 &&
            (paginatedProjects.length > 0 ? (
              <>
                {paginatedProjects.map((p, i) => (
                  <ProjectCard key={i} project={p} />
                ))}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={3}
                >
                  <Pagination
                    count={Math.ceil(projects.length / rowsPerPage)}
                    page={projectPage}
                    onChange={(e, value) => setProjectPage(value)}
                    color="primary"
                  />
                  <Select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(e.target.value);
                      setProjectPage(1);
                      setDraftPage(1);
                    }}
                    size="small"
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                  </Select>
                </Box>
              </>
            ) : (
              <Typography color="text.secondary">
                No projects available.
              </Typography>
            ))}

          {/* Drafts Tab */}
          {activeTab === 2 &&
            (paginatedDrafts.length > 0 ? (
              <>
                {paginatedDrafts.map((d, i) => (
                  <ProjectCard key={i} project={d} isDraft />
                ))}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={3}
                >
                  <Pagination
                    count={Math.ceil(drafts.length / rowsPerPage)}
                    page={draftPage}
                    onChange={(e, value) => setDraftPage(value)}
                    color="primary"
                  />
                  <Select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(e.target.value);
                      setProjectPage(1);
                      setDraftPage(1);
                    }}
                    size="small"
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                  </Select>
                </Box>
              </>
            ) : (
              <Typography color="text.secondary">
                No draft projects available.
              </Typography>
            ))}

          {/* Clients Tab */}
          {activeTab === 1 && (
            <Typography color="text.secondary">
              Client list goes here...
            </Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default ProjectList;
