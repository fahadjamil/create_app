import { Box, Container, Typography, Paper } from "@mui/material";
import ProjectForm from "./projectForm";
import ProjectStepper from "./projectStepper";

const NewProject = () => {
  return (
    <Box component="main" sx={{ flex: 1, bgcolor: "background.default" }}>
      <Container maxWidth={false} disableGutters>
        <Paper>
          <ProjectForm />
        </Paper>
      </Container>
    </Box>
  );
};

export default NewProject;
