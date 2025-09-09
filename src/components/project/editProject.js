import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
  InputGroup,
  Modal,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";
import { TextField, MenuItem } from "@mui/material";

export default function EditProject() {
  const { id } = useParams();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const baseURL = process.env.REACT_APP_BASE_URL;

  const [project, setProject] = useState({
    projectName: "",
    client: "",
    projectType: "",
    projectStatus: "Pending",
    startDate: "",
    endDate: "",
    description: "",
    paymentStructure: "Single Payment",
    projectAmount: "",
    currency: "PKR",
    tags: [],
    media: [], // ✅ Added media field
  });

  const [newTag, setNewTag] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Dropdown Options
  const projectStatuses = [
    "In Process",
    "Contract Signed & Uploaded",
    "Project Started",
    "Project Completed",
    "Project Delayed",
  ];

  // ✅ Fetch project details
  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${baseURL}/project/${id}`);
        if (res.data?.data) {
          setProject(res.data.data);
        } else {
          setError("Project not found");
        }
      } catch (err) {
        setError("❌ Failed to fetch project details");
        console.error("Error fetching project:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // ✅ Handle form input changes
  const handleChange = (e) => {
    setProject((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Add new tag
  const handleAddTag = () => {
    if (newTag.trim() !== "" && !project.tags.includes(newTag.trim())) {
      setProject((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  // ✅ Remove tag
  const handleRemoveTag = (tag) => {
    setProject((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // ✅ Save updated project
  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await axios.put(
        `${baseURL}/project/update_project/${id}`,
        project
      );
      if (res.data.success) {
        alert("✅ Project updated successfully");
        setEditMode(false);
      } else {
        alert("⚠️ Failed to update project");
      }
    } catch (err) {
      console.error("Error updating project:", err);
      alert("❌ Error updating project");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center mt-5">
        <Spinner animation="border" role="status" />
        <span className="ms-2">Loading project...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card className="shadow-sm">
        <Card.Body>
          {/* Header */}
          <Row className="mb-3 align-items-center">
            <Col>
              <h5 className="mb-0">Project Details</h5>
            </Col>
            <Col className="text-end">
              {editMode ? (
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setEditMode(true)}
                >
                  Edit Details
                </Button>
              )}
            </Col>
          </Row>

          {/* Project Info */}
          <Row>
            <Col md={12} className="mb-3">
              <TextField
                label="Project Name"
                name="projectName"
                value={project.projectName || ""}
                onChange={handleChange}
                fullWidth
                required
                disabled={!editMode}
              />
            </Col>

            <Col md={6}>
              <TextField
                label="Client"
                name="client"
                select
                value={project.client || ""}
                onChange={handleChange}
                fullWidth
                disabled={!editMode}
              >
                <MenuItem value="" disabled>
                  Select a Client type
                </MenuItem>
                <MenuItem value="individual">Individual</MenuItem>
                <MenuItem value="brand">Brand</MenuItem>
              </TextField>
            </Col>

            <Col md={6}>
              <TextField
                label="Project Status"
                name="projectStatus"
                select
                value={project.projectStatus || ""}
                onChange={handleChange}
                fullWidth
                disabled={!editMode}
              >
                <MenuItem value="" disabled>
                  Select project status
                </MenuItem>
                {projectStatuses.map((status, index) => (
                  <MenuItem key={index} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Col>
          </Row>

          {/* Dates */}
          <Row className="mt-3">
            <Col md={6}>
              <TextField
                label="Start Date"
                name="startDate"
                type="date"
                value={project.startDate ? project.startDate.substring(0, 10) : ""}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={!editMode}
              />
            </Col>

            <Col md={6}>
              <TextField
                label="End Date"
                name="endDate"
                type="date"
                value={project.endDate ? project.endDate.substring(0, 10) : ""}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={!editMode}
              />
            </Col>
          </Row>

          {/* Description */}
          <Row className="mt-3">
            <Col>
              <TextField
                label="Description"
                name="description"
                multiline
                rows={3}
                value={project.description || ""}
                onChange={handleChange}
                fullWidth
                disabled={!editMode}
              />
            </Col>
          </Row>

          {/* Tags */}
          <Row className="mt-3">
            <Col>
              <h6>Tags</h6>
              <div className="mb-2">
                {project.tags?.length > 0 ? (
                  project.tags.map((tag, idx) => (
                    <Badge key={idx} bg="secondary" className="me-2 mb-2 p-2">
                      {tag}{" "}
                      {editMode && (
                        <Button
                          variant="light"
                          size="sm"
                          onClick={() => handleRemoveTag(tag)}
                          style={{ marginLeft: "5px", padding: "0px 4px" }}
                        >
                          ✕
                        </Button>
                      )}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted">No tags added</p>
                )}
              </div>

              {editMode && (
                <InputGroup className="mb-3">
                  <TextField
                    label="New Tag"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                  />
                  <Button variant="outline-primary" onClick={handleAddTag}>
                    Add
                  </Button>
                </InputGroup>
              )}
            </Col>
          </Row>

          {/* Payment Info */}
          <h6 className="mt-4">Payment Information</h6>
          <Row>
            <Col md={6}>
              <Card className="shadow-lg border-0 rounded-4 overflow-hidden mt-3 mt-md-0">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="text-uppercase text-muted mb-0">
                      Project Amount
                    </h6>
                    <span className="badge bg-gradient bg-primary text-white">
                      {project.currency}
                    </span>
                  </div>
                  <h2 className="fw-bold text-primary text-center mb-4">
                    {project.projectAmount
                      ? new Intl.NumberFormat("en-US").format(
                          project.projectAmount
                        )
                      : "0"}
                  </h2>
                  <hr />
                  <div className="d-flex justify-content-around">
                    <div className="text-center">
                      <small className="text-muted d-block">Method</small>
                      <span className="fw-semibold text-dark">
                        {project.paymentMethod || "N/A"}
                      </span>
                    </div>
                    <div className="text-center">
                      <small className="text-muted d-block">Structure</small>
                      <span className="fw-semibold text-dark">
                        {project.paymentStructure || "N/A"}
                      </span>
                    </div>
                  </div>
                </Card.Body>
                <div
                  className="p-1"
                  style={{
                    background:
                      "linear-gradient(90deg, #0d6efd, #6610f2, #d63384)",
                  }}
                ></div>
              </Card>
            </Col>
          </Row>

          {/* ✅ Media Section */}
          <h6 className="mt-4">Project Media</h6>
          <Row>
            {project.media?.length > 0 ? (
              project.media.map((img, idx) => (
                <Col key={idx} md={4} className="mb-3">
                  <Card
                    className="shadow-sm border-0 cursor-pointer"
                    onClick={() => {
                      setSelectedImage(img);
                      setShowImageModal(true);
                    }}
                  >
                    <Card.Img
                      variant="top"
                      src={img}
                      alt={`media-${idx}`}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                  </Card>
                </Col>
              ))
            ) : (
              <p className="text-muted">No media available</p>
            )}
          </Row>
        </Card.Body>
      </Card>

      {/* ✅ Image Modal */}
      <Modal
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        centered
        size="lg"
      >
        <Modal.Body className="p-0">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Expanded view"
              className="w-100"
              style={{ maxHeight: "80vh", objectFit: "contain" }}
            />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
