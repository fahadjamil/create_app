import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  LinearProgress,
} from "@mui/material";
import { Event, Payment } from "@mui/icons-material";

const ProjectCard = React.memo(({ project, isDraft = false }) => {
  const navigate = useNavigate();

  const handleNavigate = useCallback(() => {
    navigate(isDraft ? `/draftProject/${project.id}/edit` : `/project/${project.id}/edit`);
  }, [isDraft, project.id, navigate]);

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
          <Typography variant="h6" fontWeight="bold" noWrap>
            {project.name}
          </Typography>
          <Chip label={project.status} color={isDraft ? "warning" : "info"} size="small" />
        </Box>

        <Typography variant="body2" color="text.secondary" mt={1} noWrap>
          {project.type}
        </Typography>

        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
          <Event fontSize="small" color="action" />
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
            <Payment fontSize="small" color="action" />
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
});

export default ProjectCard;
