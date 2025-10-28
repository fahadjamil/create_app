// components/ProjectTab.jsx
import React from "react";
import { Box, Typography, Pagination } from "@mui/material";
import ProjectCard from "./projectCard";

const ProjectTab = ({
  loading,
  projects,
  filteredCount,
  rowsPerPage,
  page,
  setPage,
}) => {
  if (loading)
    return (
      <Box textAlign="center" mt={3}>
        <Typography>Loading projects...</Typography>
      </Box>
    );

  return (
    <>
      {projects.length ? (
        projects.map((p) => <ProjectCard key={p.id} project={p} />)
      ) : (
        <Typography>No projects found.</Typography>
      )}

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={Math.ceil(filteredCount / rowsPerPage)}
          page={page}
          onChange={(e, val) => setPage(val)}
          color="primary"
        />
      </Box>
    </>
  );
};

export default ProjectTab;
