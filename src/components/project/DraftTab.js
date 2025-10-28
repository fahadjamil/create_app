import React from "react";
import { Box, Typography, Pagination } from "@mui/material";
import ProjectCard from "./projectCard";

const DraftTab = ({ loading, drafts, filteredCount, rowsPerPage, page, setPage }) => {
  if (loading)
    return (
      <Box textAlign="center" mt={3}>
        <Typography>Loading drafts...</Typography>
      </Box>
    );

  return (
    <>
      {drafts.length ? (
        drafts.map((d) => <ProjectCard key={d.id} project={d} isDraft />)
      ) : (
        <Typography>No draft projects found.</Typography>
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

export default DraftTab;
