import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";

import {
  Container,
  Row,
  Col,
  Card as BootstrapCard,
  Modal,
  Form,
} from "react-bootstrap";

import {
  Typography,
  Stepper,
  Step,
  StepLabel,
  TextField,
  MenuItem,
  Avatar,
  Radio,
  Button,
  Card as MuiCard,
  CardContent,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  RadioGroup,
  Checkbox,
  Box,
  Chip,
  Divider,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PaymentIcon from "@mui/icons-material/Payment";
import DescriptionIcon from "@mui/icons-material/Description";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import { useParams } from "react-router-dom";

const MultiStepDraftProjectForm = () => {
  const today = new Date().toISOString().split("T")[0];
  const [errors, setErrors] = useState({});
  const { id } = useParams(); // get dpid from route
  const [draft, setDraft] = useState(null);
  const navigate = useNavigate();
  const baseURL = process.env.REACT_APP_BASE_URL;
  const [formData, setFormData] = useState({
    projectName: "",
    projectType: "",
    client: "",
    startDate: "", // keep empty, will fill from API
    endDate: "",
    description: "",
    tags: [],
    media: [],
    pointName: "",
    pointRole: "",
    pointBrand: "",
    pointEmail: "",
    pointMobile: "",
    paymentType: "",
    amount: "",
    dueDate: "",
    projectAmount: "",
    currency: "",
    taxHandling: "",
    paymentFrequency: "",
    paymentStartDate: "", // ✅ fix naming
    contractDuration: "",
    financing: "",
    paymentMethod: "",
    paymentStructure: "",
    milestones: [],
    agree: false,
    projectStatus: "", // ✅ add this
    contactName: "",
    contactEmail: "",
    contactNumber: "",
    contactRole: "",
    contactBrand: "",
  });

  const [activeStep, setActiveStep] = useState(0);

  const [showTagModal, setShowTagModal] = useState(false);
  const [newTag, setNewTag] = useState("");
  const projectAmount = formData.projectAmount ? formData.projectAmount : "";
  const serviceFee = (projectAmount * 20) / 100;
  const receiveAmount = projectAmount - serviceFee;
  const departments = [
    {
      id: "single",
      title: "Single Payment",
      desc: "Get paid in one transaction , either before or after delivery",
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
      desc: "Regular fixed payments on scheduled basis",
      icon: <SupportAgentIcon />,
    },
  ];
  const projectTypes = [
    "Product Photography",
    "Event Photography",
    "Portrait Photography",
    "Wedding Photography",
    "Commercial Photography",
    "Social Media Content",
    "Video Production",
    "Graphic Design",
    "Web Development",
    "Content Creation",
  ];
  const projectStatuses = [
    "In Process",
    "Contract Signed & Uploaded",
    "Project Started",
    "Project Completed",
    "Project Delayed",
  ];

  const validateForm = (step) => {
    const newErrors = {};

    if (step === 0) {
      if (!(formData.projectName || "").trim())
        newErrors.projectName = "Project Name is required";
      if (!(formData.projectType || "").trim())
        newErrors.projectType = "Project Type is required";
      if (!(formData.client || "").trim())
        newErrors.client = "Client is required";
      if (!(formData.projectStatus || "").trim())
        newErrors.projectStatus = "Project Status is required";
      if (!formData.startDate) newErrors.startDate = "Start Date is required";
      if (!formData.endDate) newErrors.endDate = "End Date is required";
    }

    if (step === 1) {
      if (!(formData.paymentStructure || "").trim())
        newErrors.paymentStructure = "Payment Type is required";
    }

    if (step === 2) {
      if (!formData.projectAmount)
        newErrors.projectAmount = "Project Amount is required";
      if (!(formData.currency || "").trim())
        newErrors.currency = "Currency is required";
      if (
        formData.paymentStructure === "multiple" &&
        (!formData.milestones || formData.milestones.length === 0)
      ) {
        newErrors.milestones = "At least one milestone is required";
      }
      if (
        formData.paymentStructure === "recurring" &&
        (!formData.contractDuration || Number(formData.contractDuration) <= 0)
      ) {
        newErrors.contractDuration = "Contract Duration is required";
      }
    }

    if (step === 3 && formData.financing === "yes" && !formData.agree) {
      newErrors.agree = "You must agree to financing terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateForm(activeStep)) return; // ✅ pass current step

    if (activeStep === steps.length - 1) {
      // Last step → submit form
      handleSubmitForm();
    } else {
      setActiveStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev; // don’t go beyond last step
      });
    }
  };

  const uploadPictures = async () => {
    try {
      const endpoint = `${baseURL}/project/upload_pictures`;

      // Create a FormData object
      const formDataToSend = new FormData();
      formData.media.forEach((file) => {
        formDataToSend.append("images", file); // match backend key
      });

      const res = await axios.post(endpoint, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        // Parse media JSON string into array
        const uploadedMedia = JSON.parse(res.data.project.media);

        // Update formData.media with server paths
        setFormData((prev) => ({
          ...prev,
          media: uploadedMedia, // ✅ Cloudinary URLs
          pid: res.data.project.pid,
        }));
      }

      console.log("Upload successful:", res.data);
    } catch (error) {
      console.error("Error uploading picture:", error);
      alert("Failed to upload picture. Please try again.");
    }
  };
  useEffect(() => {
    if (id) {
      const fetchDraft = async () => {
        try {
          const res = await axios.get(
            `${baseURL}/project/draft/${id}`,
            {
              params: { userId: JSON.parse(localStorage.getItem("user"))?.uid },
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (res.data?.data) {
            const draftData = res.data.data;

            setFormData((prev) => ({
              ...prev,
              ...draftData,
              startDate: draftData.startDate
                ? moment(draftData.startDate).format("DD/MM/YYYY")
                : "",
              endDate: draftData.endDate
                ? moment(draftData.endDate).format("DD/MM/YYYY")
                : "",
              paymentStartDate: draftData.paymentStartDate
                ? moment(draftData.paymentStartDate).format("DD/MM/YYYY")
                : "",
              media: Array.isArray(draftData.media)
                ? draftData.media
                    .map((m) => (typeof m === "string" ? m : m?.url || ""))
                    .filter(Boolean)
                : [],
            }));
          }
        } catch (error) {
          console.error("❌ Error fetching draft:", error);
        }
      };
      fetchDraft();
    }
  }, [id]);

  useEffect(() => {
    if (typeof formData.media === "string") {
      try {
        const parsed = JSON.parse(formData.media);
        if (Array.isArray(parsed)) {
          setFormData((prev) => ({ ...prev, media: parsed }));
        }
      } catch (err) {
        console.warn("Failed to parse media", err);
      }
    }
  }, [formData.media]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, media: [...prev.media, ...files] }));
  };
  const handleDraft = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const finalData = {
      ...formData,
      userId: user?.uid, // include userId
    };
    try {
      const response = await axios.post(
        `${baseURL}/project/draftProject`,
        finalData // send finalData with userId
      );
      console.log("Project Drafted:", response.data.project);
      alert("Project drafted successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(
        "Error creating draft project:",
        err.response?.data || err.message
      );
      alert("Failed to create draft project.");
    }
  };
  const handleSubmitForm = async () => {
    // const error = validateForm();
    // if (error) {
    //   alert(error);
    //   return;
    // }
    const user = JSON.parse(localStorage.getItem("user"));
    const finalData = {
      ...formData,
      userId: user?.uid, // include userId
    };

    console.log("Submitting Form Data:", finalData);

    try {
      const response = await axios.post(
        `${baseURL}/project/new_project`,
        finalData // send finalData with userId
      );
      console.log("Project created:", response.data.project);
      alert("Project created successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(
        "Error creating project:",
        err.response?.data || err.message
      );
      alert("Failed to create project.");
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);
  // const [financing, setFinancing] = useState("no");
  // const [paymentMethod, setPaymentMethod] = useState("");
  const steps = [
    "Project Details",
    "Payment Structure",
    "Payment Details",
    "Financing Details",
    "Review",
  ];

  const renderStepForm = () => {
    switch (activeStep) {
      case 0:
        return (
          <Row className="g-3">
            <span>
              <strong>Project Details</strong>
              <br />
              Enter the basic details of your project
            </span>
            <hr />
            <Col md={6}>
              <TextField
                label="Project Name"
                name="projectName"
                error={!!errors.projectName}
                value={formData.projectName}
                onChange={handleChange}
                fullWidth
              />
            </Col>
            <Col md={6}>
              <TextField
                label="Type of Project"
                name="projectType"
                select
                error={!!errors.projectType}
                value={formData.projectType}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="" disabled>
                  Select a project type
                </MenuItem>

                {projectTypes.map((type, index) => (
                  <MenuItem key={index} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Col>
            <Col md={6}>
              <TextField
                label="Client"
                name="client"
                error={!!errors.client}
                select
                value={formData.client}
                onChange={handleChange}
                fullWidth
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
                error={!!errors.projectStatus}
                select
                value={formData.projectStatus}
                onChange={handleChange}
                fullWidth
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
            <Col md={6}>
              <TextField
                label="Start Date"
                name="startDate"
                error={!!errors.startDate}
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Col>
            <Col md={6}>
              <TextField
                label="End Date"
                name="endDate"
                error={!!errors.endDate}
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Col>
            <Col md={6}>
              <TextField
                label="Project Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                fullWidth
              />
            </Col>
            <Col md={6}>
              <div className="d-flex flex-wrap gap-2">
                {formData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="badge bg-primary d-flex align-items-center"
                  >
                    {tag}
                  </span>
                ))}
                <Button
                  variant="outlined"
                  onClick={() => setShowTagModal(true)}
                >
                  + Add Tag
                </Button>
              </div>
            </Col>
            <Col md={6}>
              {/* Upload Button */}
              {!formData.pid && (
                <>
                  <Button variant="outlined" component="label">
                    Select Media
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={handleMediaUpload}
                    />
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ ml: 2 }}
                    onClick={uploadPictures}
                    disabled={formData.media.length === 0}
                  >
                    Upload
                  </Button>
                </>
              )}

              {/* Preview Images */}
              <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
                {formData.media
                  .filter(Boolean) // remove null/undefined
                  .map((file, idx) => {
                    if (typeof file !== "string" && !(file instanceof File))
                      return null;

                    const previewUrl =
                      typeof file === "string"
                        ? file
                        : URL.createObjectURL(file);

                    const fileName =
                      typeof file === "string"
                        ? file.split("/").pop()
                        : file.name;

                    return (
                      <Box
                        key={idx}
                        sx={{
                          position: "relative",
                          width: 80,
                          height: 80,
                          borderRadius: 2,
                          overflow: "hidden",
                          boxShadow: 1,
                          border: "1px solid #ddd",
                        }}
                      >
                        <img
                          src={previewUrl}
                          alt={fileName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />

                        {/* Delete Button */}
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          sx={{
                            position: "absolute",
                            top: 2,
                            right: 2,
                            minWidth: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            p: 0,
                            fontSize: "12px",
                          }}
                          onClick={() => {
                            const updated = [...formData.media];
                            updated.splice(idx, 1);
                            setFormData({ ...formData, media: updated });
                          }}
                        >
                          ✕
                        </Button>

                        {/* Update/Replace Button */}
                        <Button
                          component="label"
                          size="small"
                          variant="contained"
                          sx={{
                            position: "absolute",
                            bottom: 2,
                            right: 2,
                            minWidth: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            p: 0,
                            fontSize: "12px",
                            backgroundColor: "#1976d2",
                          }}
                        >
                          ⟳
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const updated = [...formData.media];
                                updated[idx] = e.target.files[0];
                                setFormData({ ...formData, media: updated });
                              }
                            }}
                          />
                        </Button>
                      </Box>
                    );
                  })}
              </Box>
            </Col>

            <span>
              <strong>Point of Contact</strong>
              <br />
              Enter the primary contact details of this project
            </span>
            <hr />
            <Col md={6}>
              <TextField
                label="Contact Name"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }} // ✅ Fix overlap
              />
            </Col>
            <Col md={6}>
              <TextField
                label="Contact Role"
                name="contactRole"
                value={formData.contactRole}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Col>
            <Col md={6}>
              <TextField
                label="Brand/Company"
                name="contactBrand"
                value={formData.contactBrand}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Col>
            <Col md={6}>
              <TextField
                label="Contact Email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Col>
            <Col md={6}>
              <TextField
                label="Contact Number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Col>
          </Row>
        );

      case 1:
        return (
          <Row className="g-3">
            <span>
              <strong>Payment Structure</strong>
              <br />
              Select how you want to be paid for this project
            </span>
            <hr />
            {departments.map((dept) => (
              <Col md={12} key={dept.id}>
                <MuiCard
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    p: 1,
                    border:
                      formData.paymentStructure === dept.id
                        ? "2px solid #1976d2"
                        : "1px solid #ddd",
                    borderRadius: 2,
                    boxShadow: formData.paymentStructure === dept.id ? 3 : 1,
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      paymentStructure: dept.id,
                    })
                  }
                >
                  <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                    {dept.icon}
                  </Avatar>
                  <CardContent sx={{ flex: 1, py: 1 }}>
                    <Typography variant="h6">{dept.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dept.desc}
                    </Typography>
                  </CardContent>
                  <Radio
                    checked={formData.paymentStructure === dept.id}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        paymentStructure: dept.id,
                      })
                    }
                    color="primary"
                  />
                </MuiCard>
              </Col>
            ))}

            {/* Show error message if exists */}
            {errors.paymentStructure ? (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {errors.paymentStructure}
              </Typography>
            ) : (
              ""
            )}
          </Row>
        );

      case 2:
        return (
          <Row className="g-3">
            <Box className="container mt-4">
              <Typography variant="h5" gutterBottom>
                Payment Details
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Configure the payment details for your project
              </Typography>

              {/* Total Project Value */}
              <Paper className="p-3 mb-4" elevation={3}>
                <Typography variant="h6" gutterBottom>
                  Total Project Value
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      value={formData.projectAmount}
                      error={!!errors.projectAmount}
                      label="Project Amount"
                      variant="outlined"
                      type="number"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          projectAmount: Number(e.target.value),
                        })
                      }
                    />
                  </Grid>
                  <Grid item md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Currency</InputLabel>
                      <Select
                        value={formData.currency || ""} // ✅ fallback to empty if not set
                        label="Currency"
                        error={!!errors.currency}
                        onChange={(e) =>
                          setFormData({ ...formData, currency: e.target.value })
                        }
                      >
                        <MenuItem value="">Select any currency</MenuItem>
                        <MenuItem value="PKR">Pakistani Rupee (PKR)</MenuItem>
                        <MenuItem value="USD">US Dollar (USD)</MenuItem>
                        <MenuItem value="EUR">Euro (EUR)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>

              {/* Tax Handling */}
              {/* Tax Handling */}
              <Paper className="p-3 mb-4" elevation={3}>
                <Typography variant="h6">Tax Handling</Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={formData.taxHandling}
                    onChange={(e) =>
                      setFormData({ ...formData, taxHandling: e.target.value })
                    }
                  >
                    <FormControlLabel
                      value="inclusive"
                      control={<Radio />}
                      label="GST Inclusive - All taxes are included in your project amount"
                    />
                    <FormControlLabel
                      value="exclusive"
                      control={<Radio />}
                      label="Exclusive of GST - GST will be charged in addition"
                    />
                  </RadioGroup>
                </FormControl>

                {/* GST Calculation */}
                <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={2}>
                  <Typography variant="subtitle2">
                    Calculation Preview:
                  </Typography>

                  {formData.projectAmount ? (
                    formData.taxHandling === "inclusive" ? (
                      <Typography variant="body2" color="text.secondary">
                        Project Amount (Inclusive of GST):{" "}
                        <b>PKR {formData.projectAmount}</b>
                        <br />
                        Base Amount (excl. GST):{" "}
                        <b>PKR {(formData.projectAmount / 1.18).toFixed(2)}</b>
                        <br />
                        GST Portion (18%):{" "}
                        <b>
                          PKR{" "}
                          {(
                            formData.projectAmount -
                            formData.projectAmount / 1.18
                          ).toFixed(2)}
                        </b>
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Project Amount (Excl. GST):{" "}
                        <b>PKR {formData.projectAmount}</b>
                        <br />
                        GST (18%):{" "}
                        <b>PKR {(formData.projectAmount * 0.18).toFixed(2)}</b>
                        <br />
                        Total Payable (incl. GST):{" "}
                        <b>PKR {(formData.projectAmount * 1.18).toFixed(2)}</b>
                      </Typography>
                    )
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Please enter a project amount to see GST calculations.
                    </Typography>
                  )}
                </Box>
              </Paper>

              {/* Payment Frequency */}
              <Paper className="p-3 mb-4" elevation={3}>
                <Typography variant="h6">Payment Frequency</Typography>

                {formData.paymentStructure === "single" && (
                  <Box className="mt-3">
                    <Typography variant="subtitle1">Payment Amount</Typography>
                    <Typography variant="h6">
                      {formData.currency}{" "}
                      {Number(formData.projectAmount || 0).toLocaleString()}
                    </Typography>
                  </Box>
                )}

                {formData.paymentStructure === "recurring" && (
                  <>
                    <RadioGroup
                      row
                      value={formData.paymentFrequency}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentFrequency: e.target.value,
                        })
                      }
                    >
                      <FormControlLabel
                        value="weekly"
                        control={<Radio />}
                        label="Weekly"
                      />
                      <FormControlLabel
                        value="monthly"
                        control={<Radio />}
                        label="Monthly"
                      />
                      <FormControlLabel
                        value="quarterly"
                        control={<Radio />}
                        label="Quarterly"
                      />
                    </RadioGroup>

                    <Box className="mt-3">
                      <Typography variant="subtitle1">
                        Payment Amount per installment
                      </Typography>
                      <Typography variant="h6">
                        {formData.currency}{" "}
                        {(
                          (formData.projectAmount || 0) /
                          (formData.contractDuration || 1)
                        ).toLocaleString()}
                      </Typography>
                      <Grid container spacing={2} className="mt-2">
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Contract Duration (months)"
                            type="number"
                            error={!!errors.contractDuration}
                            value={formData.contractDuration}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                contractDuration: Number(e.target.value),
                              })
                            }
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Payment Start Date"
                            name="paymentstartDate"
                            type="date"
                            value={formData.paymentstartDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </>
                )}

                {formData.paymentStructure === "multiple" && (
                  <Box className="mt-3">
                    <Typography variant="subtitle1">
                      Milestone Payments
                    </Typography>

                    {formData.milestones?.map((milestone, index) => (
                      <Paper
                        key={index}
                        className="p-3 mb-2"
                        variant="outlined"
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={4}>
                            <TextField
                              fullWidth
                              label="Milestone Name"
                              value={milestone.name}
                              helperText={errors.milestones} // 🔹 show the message here
                              onChange={(e) => {
                                const updated = [...formData.milestones];
                                updated[index].name = e.target.value;
                                setFormData({
                                  ...formData,
                                  milestones: updated,
                                });
                              }}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <TextField
                              fullWidth
                              label="Amount (%)"
                              type="number"
                              value={milestone.percent}
                              onChange={(e) => {
                                const updated = [...formData.milestones];
                                updated[index].percent = Number(e.target.value);
                                setFormData({
                                  ...formData,
                                  milestones: updated,
                                });
                              }}
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              fullWidth
                              label="Deliverable"
                              value={milestone.deliverable}
                              onChange={(e) => {
                                const updated = [...formData.milestones];
                                updated[index].deliverable = e.target.value;
                                setFormData({
                                  ...formData,
                                  milestones: updated,
                                });
                              }}
                            />
                          </Grid>
                          <Grid item xs={1}>
                            <Button
                              color="error"
                              onClick={() => {
                                const updated = [...formData.milestones];
                                updated.splice(index, 1);
                                setFormData({
                                  ...formData,
                                  milestones: updated,
                                });
                              }}
                            >
                              X
                            </Button>

                            {/* Show milestone-level error (global) */}
                            {errors.milestones && (
                              <Typography color="error" variant="caption">
                                {errors.milestones}
                              </Typography>
                            )}
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}

                    {/* Add Milestone button - disabled when 100% allocated */}
                    <Button
                      variant="outlined"
                      disabled={
                        (formData.milestones || []).reduce(
                          (sum, m) => sum + (m.percent || 0),
                          0
                        ) >= 100
                      }
                      onClick={() =>
                        setFormData({
                          ...formData,
                          milestones: [
                            ...(formData.milestones || []),
                            { name: "", percent: 0, deliverable: "" },
                          ],
                        })
                      }
                    >
                      + Add Milestone
                    </Button>

                    <TextField
                      label="Payment Start Date"
                      name="paymentstartDate"
                      type="date"
                      value={formData.paymentstartDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      className="mx-2"
                    />

                    {/* Total Allocated */}
                    <Typography
                      variant="body2"
                      sx={{ mt: 2 }}
                      color={
                        (formData.milestones || []).reduce(
                          (sum, m) => sum + (m.percent || 0),
                          0
                        ) === 100
                          ? "success.main"
                          : "error.main"
                      }
                    >
                      Total allocated:{" "}
                      {(formData.milestones || []).reduce(
                        (sum, m) => sum + (m.percent || 0),
                        0
                      )}
                      %
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* Payment Schedule */}
              <Paper className="p-3 mb-4" elevation={3}>
                <Typography variant="h6">Payment Schedule Preview</Typography>

                {/* Single Payment */}
                {formData.paymentStructure === "single" && (
                  <Typography>
                    Payment — {formData.currency}{" "}
                    {Number(formData.projectAmount || 0).toLocaleString()}
                  </Typography>
                )}

                {/* Recurring Payments */}
                {formData.paymentStructure === "recurring" && (
                  <>
                    {Array.from(
                      { length: formData.contractDuration || 0 },
                      (_, i) => (
                        <Typography key={i}>
                          Payment {i + 1} — {formData.currency}{" "}
                          {(
                            (formData.projectAmount || 0) /
                            (formData.contractDuration || 1)
                          ).toLocaleString()}
                        </Typography>
                      )
                    )}
                    {formData.contractDuration > 4 && (
                      <Typography color="text.secondary">
                        + more payments
                      </Typography>
                    )}
                  </>
                )}

                {/* Multiple (Milestones) */}
                {formData.paymentStructure === "multiple" && (
                  <>
                    {formData.milestones?.map((m, i) => (
                      <Typography key={i}>
                        {m.name || `Milestone ${i + 1}`} — {m.percent || 0}% (
                        {formData.currency}{" "}
                        {(
                          ((m.percent || 0) / 100) *
                          (formData.projectAmount || 0)
                        ).toLocaleString()}
                        )
                      </Typography>
                    ))}

                    {/* Validation for milestone allocation */}
                    <Typography
                      color={
                        (formData.milestones || []).reduce(
                          (sum, m) => sum + (m.percent || 0),
                          0
                        ) === 100
                          ? "success.main"
                          : "error.main"
                      }
                    >
                      Total allocated:{" "}
                      {(formData.milestones || []).reduce(
                        (sum, m) => sum + (m.percent || 0),
                        0
                      )}
                      %
                    </Typography>
                  </>
                )}
              </Paper>

              {/* Financing */}
              <Paper className="p-3 mb-4" elevation={3}>
                <Typography variant="h6">Financing</Typography>
                <RadioGroup
                  row
                  value={formData.financing}
                  onChange={(e) =>
                    setFormData({ ...formData, financing: e.target.value })
                  }
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </Paper>

              {/* Payment Method */}
              <Paper className="p-3 mb-4" elevation={3}>
                <Typography variant="h6">Payment Method</Typography>
                <FormControl fullWidth>
                  <InputLabel>Select Payment Method</InputLabel>
                  <Select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="bank">Bank Transfer</MenuItem>
                    <MenuItem value="card">Credit/Debit Card</MenuItem>
                    <MenuItem value="cash">Cash</MenuItem>
                  </Select>
                </FormControl>
              </Paper>
            </Box>
          </Row>
        );
      case 3:
        if (formData.financing === "yes") {
          return (
            <Box className="container my-5">
              {/* Title */}
              <Typography variant="h4" align="center" gutterBottom>
                Create Financing
              </Typography>

              {/* Approval Chip */}
              <Box display="flex" justifyContent="center" mb={3}>
                <Chip
                  label="Subject to approval"
                  color="warning"
                  variant="outlined"
                />
              </Box>

              {/* Info Section */}
              <Paper className="p-4 mb-4 shadow-sm rounded-4">
                <Typography variant="h6" gutterBottom>
                  What you need to know{" "}
                  <Chip
                    label="Important"
                    color="success"
                    size="small"
                    className="ms-2"
                  />
                </Typography>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  Subject to approval
                </Typography>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  This is a 3rd party contract, this amount will be approved
                  upon contract signing and receipt amongst all parties.
                </Typography>

                <Typography variant="body2" gutterBottom>
                  By selecting Create Financing, you agree to the following
                  terms:
                </Typography>
                <ul className="text-muted small">
                  <li>
                    A 20% service fee will be deducted from the total project
                    amount
                  </li>
                  <li>
                    You will receive 80% of the total project value upfront
                  </li>
                  <li>The remaining 20% covers financing and platform fees</li>
                  <li>Payment will be processed within 24–48 hours</li>
                  <li>Standard terms and conditions apply</li>
                </ul>
              </Paper>

              {/* Payment Breakdown */}
              <Paper className="p-4 mb-4 shadow-sm rounded-4">
                <Typography variant="h6" gutterBottom>
                  Payment Breakdown
                </Typography>
                <Divider className="mb-3" />

                <Box className="d-flex justify-content-between mb-2">
                  <Typography>Total Project Amount:</Typography>
                  <Typography>PKR {projectAmount.toLocaleString()}</Typography>
                </Box>
                <Box className="d-flex justify-content-between mb-2">
                  <Typography>You Receive (80%):</Typography>
                  <Typography>PKR {receiveAmount.toLocaleString()}</Typography>
                </Box>
                <Box className="d-flex justify-content-between text-muted">
                  <Typography>Service Fee (20%):</Typography>
                  <Typography>PKR {serviceFee.toLocaleString()}</Typography>
                </Box>
              </Paper>

              {/* Agreement */}
              <Paper className="p-4 mb-4 shadow-sm rounded-4">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.agree}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          agree: e.target.checked,
                        }))
                      }
                    />
                  }
                  label="I agree to the financing terms and conditions"
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  By checking this box, you confirm that you have read and agree
                  to the financing terms outlined above.
                </Typography>
              </Paper>
            </Box>
          );
        } else {
          return (
            <Box className="container my-5">
              {/* Title */}
              <Typography variant="h4" align="center" gutterBottom>
                NO Create Financing
              </Typography>
            </Box>
          );
        }

      case 4:
        return (
          <div className="container py-4">
            <Typography variant="h5" gutterBottom>
              Project Review
            </Typography>
            <Typography variant="body2" className="mb-4">
              Please review all project details carefully. Once confirmed, your
              project will be created and ready for management.
            </Typography>

            {/* Project Overview */}
            <BootstrapCard className="mb-4">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <AssignmentIcon fontSize="small" className="me-2" />
                  Project Overview
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Project Name</Typography>
                    <Typography>{formData.projectName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Project Type</Typography>
                    <Typography>{formData.projectType}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Client</Typography>
                    <Typography>{formData.client}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Start Date</Typography>
                    <Typography>{formData.startDate}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </BootstrapCard>

            {/* Payment Structure */}
            <BootstrapCard className="mb-4">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <PaymentIcon fontSize="small" className="me-2" />
                  Payment Structure{" "}
                  <Chip
                    label={formData.paymentType}
                    color="success"
                    size="small"
                    className="ms-2"
                  />
                </Typography>
                {/* <Box bgcolor="#e6f4ea" p={2} borderRadius={2}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {formData.paymentType}
                  </Typography>
                  <Typography variant="body2">
                    {formData.installments
                      ? `Installments: ${formData.installments}`
                      : "Regular recurring payments throughout the project duration"}
                  </Typography>
                </Box> */}
              </CardContent>
            </BootstrapCard>

            {/* Contract & Documentation */}
            <BootstrapCard className="mb-4">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <DescriptionIcon fontSize="small" className="me-2" />
                  Contract & Documentation
                </Typography>
                <Box display="flex" alignItems="flex-start">
                  <Checkbox checked={formData.agree} disabled />
                  <Box>
                    <Typography fontWeight={600}>
                      {formData.agree
                        ? "Contract will be sent for signature"
                        : "Contract not requested"}
                    </Typography>
                    {formData.agree && (
                      <Typography variant="body2" color="text.secondary">
                        Automatically generate and send a professional contract
                        to your client for digital signature. This will be
                        tracked in your Documents section.
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </BootstrapCard>

            {/* Next Steps */}
            <BootstrapCard className="mb-4">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <DocumentScannerIcon fontSize="small" className="me-2" />
                  Next Steps
                </Typography>
                <Grid container spacing={2} className="mb-3">
                  <Grid item xs={12} md={6}>
                    <Button fullWidth variant="contained" color="primary">
                      Create Invoice
                    </Button>
                    <Typography variant="body2" align="center" className="mt-1">
                      Generate professional invoice
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Button fullWidth variant="outlined" color="primary">
                      Payment Link
                    </Button>
                    <Typography variant="body2" align="center" className="mt-1">
                      Generate shareable link
                    </Typography>
                  </Grid>
                </Grid>
                <Typography
                  variant="body2"
                  align="center"
                  color="text.secondary"
                >
                  Create your project first, then use these tools to streamline
                  your invoicing and payment collection process.
                </Typography>
              </CardContent>
            </BootstrapCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Create New Project
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <MuiCard className="p-4 mb-4 shadow-sm">
        {renderStepForm()}

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleDraft}
            // disabled={!isStepValid()}
          >
            {"Draft"}
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            // disabled={!isStepValid()}
          >
            {activeStep === steps.length - 1 ? "Submit" : "Next"}
          </Button>
        </Box>
      </MuiCard>

      {/* ✅ Modal must be inside return */}
      <Modal
        show={showTagModal}
        onHide={() => setShowTagModal(false)}
        className="mt-5"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add a Tag</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Enter tag name"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTagModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (newTag.trim()) {
                setFormData({
                  ...formData,
                  tags: [...formData.tags, newTag.trim()],
                });
                setNewTag("");
                setShowTagModal(false);
              }
            }}
          >
            Add Tag
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MultiStepDraftProjectForm;
