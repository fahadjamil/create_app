import { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  TableCell,
  TableRow,
  Table,
  TableHead,
  TableBody,
  Checkbox,
  ListItemText,
  Grid,
  Divider,
  Avatar,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";

// Icons
import AssignmentIcon from "@mui/icons-material/Assignment";
import BusinessIcon from "@mui/icons-material/Business";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import EventIcon from "@mui/icons-material/Event";
import NoteAltIcon from "@mui/icons-material/NoteAlt";

// Constants
const currencies = [
  { value: "PKR", label: "PKR - Pakistani Rupee" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
];

const statuses = ["Draft", "Pending", "Paid", "Cancelled"];
const baseURL = process.env.REACT_APP_BASE_URL;

const existingClients = [
  {
    id: 1,
    name: "Ali Khan",
    email: "ali.khan@example.com",
    company: "Tech Solutions",
    phone: "+92 300 1234567",
    address: "Lahore, Pakistan",
  },
  {
    id: 2,
    name: "Sara Ahmed",
    email: "sara.ahmed@example.com",
    company: "Design Studio",
    phone: "+92 321 9876543",
    address: "Karachi, Pakistan",
  },
  {
    id: 3,
    name: "John Smith",
    email: "john.smith@example.com",
    company: "Global Trading",
    phone: "+92 333 5556677",
    address: "Islamabad, Pakistan",
  },
];

const renderMenuItems = (list) =>
  list.map((item) =>
    typeof item === "string" ? (
      <MenuItem key={item} value={item}>
        {item}
      </MenuItem>
    ) : (
      <MenuItem key={item.value} value={item.value}>
        {item.label}
      </MenuItem>
    )
  );

export default function CreateInvoice() {
  const [invoiceType, setInvoiceType] = useState("Standalone");
  const [clientType, setClientType] = useState("custom");
  const [issueDate, setIssueDate] = useState(dayjs());
  const [dueDate, setDueDate] = useState(dayjs().add(30, "day"));
  const [status, setStatus] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedMilestones, setSelectedMilestones] = useState([]);
  const [calculatedAmount, setCalculatedAmount] = useState(0);

  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    company: "",
    phone: "",
    address: "",
    amount: "",
    currency: "PKR",
    status: "Draft",
    notes: "",
    project: "",
    termsTemplate: "",
  });
  const recurringOptions =
    selectedProject?.paymentStructure === "recurring"
      ? Array.from(
          { length: selectedProject?.contractDuration || 0 },
          (_, i) => ({
            name: `Month ${i + 1}`,
            value: i + 1, // 1-based index
          })
        )
      : [];
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        const response = await axios.post(
          `${baseURL}/project/all_projects`,
          { userId: user?.uid } // ✅ make sure only the ID is sent
        );

        if (response.data.success && Array.isArray(response.data.data)) {
          const filtered = status
            ? response.data.data.filter((app) => app.status === status)
            : response.data.data;

          setApplications(filtered);
        }
      } catch (err) {
        console.error("❌ Error fetching applications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [status]);

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) {
      alert("⚠️ Nothing to export!");
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let position = 0;
      let heightLeft = pdfHeight;

      while (heightLeft > 0) {
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
        if (heightLeft > 0) {
          pdf.addPage();
          position = -pdf.internal.pageSize.getHeight();
        }
      }

      pdf.save("invoice.pdf");
      alert("✅ Invoice PDF downloaded!");
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("❌ Failed to generate PDF.");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 4, maxWidth: 900, mx: "auto" }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
          🧾 Create New Invoice
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          gutterBottom
          align="center"
        >
          Quickly generate invoices with flexible payment options
        </Typography>

        <Card variant="outlined" sx={{ borderRadius: 4, boxShadow: 4 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Invoice Type */}
            <SectionHeader icon={<AssignmentIcon />} title="Invoice Type" />
            <FormControl fullWidth sx={{ mb: 3 }}>
              <RadioGroup
                row
                value={invoiceType}
                onChange={(e) => setInvoiceType(e.target.value)}
              >
                <FormControlLabel
                  value="Project"
                  control={<Radio />}
                  label="Project Invoice"
                />
                <FormControlLabel
                  value="Standalone"
                  control={<Radio />}
                  label="Standalone Invoice"
                />
              </RadioGroup>
            </FormControl>

            <Divider sx={{ my: 3 }} />

            {/* Standalone Invoice Section */}
            {invoiceType === "Standalone" && (
              <>
                <SectionHeader
                  icon={<BusinessIcon />}
                  title="Client Information"
                />
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <RadioGroup
                    row
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value)}
                  >
                    <FormControlLabel
                      value="existing"
                      control={<Radio />}
                      label="Select Existing Client"
                    />
                    <FormControlLabel
                      value="custom"
                      control={<Radio />}
                      label="Custom Client"
                    />
                  </RadioGroup>
                </FormControl>

                {clientType === "custom" && (
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Client Name"
                        name="clientName"
                        value={form.clientName}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Client Email"
                        name="clientEmail"
                        value={form.clientEmail}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Company"
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                      />
                    </Grid>
                  </Grid>
                )}

                {clientType === "existing" && (
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Select Client</InputLabel>
                    <Select
                      label="Select Client"
                      value={form.clientId || ""}
                      onChange={(e) => {
                        const clientId = e.target.value;
                        const selected = existingClients.find(
                          (c) => c.id === clientId
                        );
                        setForm({
                          ...form,
                          clientId,
                          clientName: selected?.name || "",
                          clientEmail: selected?.email || "",
                          company: selected?.company || "",
                          phone: selected?.phone || "",
                          address: selected?.address || "",
                        });
                      }}
                    >
                      <MenuItem value="">Choose a client</MenuItem>
                      {existingClients.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name} — {c.company}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <SectionHeader
                  icon={<MonetizationOnIcon />}
                  title="Payment Info"
                />
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Amount"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Currency</InputLabel>
                      <Select
                        name="currency"
                        value={form.currency}
                        label="Currency"
                        onChange={handleChange}
                      >
                        {renderMenuItems(currencies)}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <SectionHeader icon={<EventIcon />} title="Invoice Dates" />
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Issue Date"
                      value={issueDate}
                      onChange={setIssueDate}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Due Date"
                      value={dueDate}
                      onChange={setDueDate}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <SectionHeader
                  icon={<NoteAltIcon />}
                  title="Additional Notes"
                />
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  sx={{ mb: 3 }}
                />

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={form.status}
                    label="Status"
                    onChange={handleChange}
                  >
                    {renderMenuItems(statuses)}
                  </Select>
                </FormControl>
              </>
            )}

            {/* --- Project Invoice --- */}
            {/* --- Project Invoice --- */}
            {invoiceType === "Project" && (
              <>
                <SectionHeader
                  icon={<AssignmentIcon />}
                  title="Create Invoice"
                />
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Select Project</InputLabel>
                  <Select
                    name="project"
                    value={form.project}
                    label="Select Project"
                    onChange={(e) => {
                      const projectId = e.target.value;
                      const selected = applications.find(
                        (p) => p.pid === projectId
                      );

                      if (!selected) {
                        console.warn("Selected project not found");
                        return;
                      }

                      setSelectedProject(selected);
                      setSelectedMilestones([]); // reset milestones
                      setCalculatedAmount(Number(selected.projectAmount)); // reset to base

                      setForm((prev) => ({
                        ...prev,
                        project: projectId,
                        amount: selected.projectAmount || "",
                        currency: selected.currency || "PKR",
                        clientName:
                          selected.clientName || selected.contactName || "",
                        clientEmail: selected.contactEmail || "",
                        company: selected.contactBrand || "",
                        phone: selected.contactNumber || "",
                        address: "",
                      }));
                    }}
                  >
                    <MenuItem value="">Choose a project</MenuItem>
                    {applications.map((app) => (
                      <MenuItem key={app.pid} value={app.pid}>
                        {app.projectName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Project Details Auto-filled */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {/* <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Amount *"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                    />
                  </Grid> */}
                  {selectedProject?.paymentStructure === "single" && (
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Total Amount"
                          value={form.amount}
                          disabled
                        />
                      </Grid>
                    </Grid>
                  )}
                  {selectedProject?.paymentStructure === "multiple" &&
                    selectedProject.milestones?.length > 0 && (
                      <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Milestones</InputLabel>
                        <Select
                          multiple
                          value={selectedMilestones}
                          onChange={(e) => {
                            const selected = e.target.value;
                            setSelectedMilestones(selected);

                            // Calculate total based on milestone percent
                            const total = selected.reduce(
                              (sum, milestoneName) => {
                                const milestone =
                                  selectedProject.milestones.find(
                                    (m) => m.name === milestoneName
                                  );
                                if (!milestone) return sum;
                                return (
                                  sum +
                                  Number(selectedProject.projectAmount) *
                                    (milestone.percent / 100)
                                );
                              },
                              0
                            );

                            setCalculatedAmount(total.toFixed(2));
                            setForm((prev) => ({
                              ...prev,
                              amount: total.toFixed(2),
                            }));
                          }}
                          renderValue={(selected) => selected.join(", ")}
                        >
                          {selectedProject.milestones.map((m) => (
                            <MenuItem key={m.name} value={m.name}>
                              <Checkbox
                                checked={selectedMilestones.includes(m.name)}
                              />
                              <ListItemText
                                primary={`${m.name} (${m.percent}%)`}
                              />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  {selectedProject?.paymentStructure === "recurring" &&
                    recurringOptions.length > 0 && (
                      <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Select Months</InputLabel>
                        <Select
                          multiple
                          value={selectedMilestones}
                          onChange={(e) => {
                            const selected = e.target.value;
                            setSelectedMilestones(selected);

                            // Calculate recurring amount
                            const monthlyAmount =
                              Number(selectedProject.projectAmount) /
                              Number(selectedProject.contractDuration || 1);

                            const total = monthlyAmount * selected.length;

                            setCalculatedAmount(total.toFixed(2));
                            setForm((prev) => ({
                              ...prev,
                              amount: total.toFixed(2),
                            }));
                          }}
                          renderValue={(selected) => selected.join(", ")}
                        >
                          {recurringOptions.map((m) => (
                            <MenuItem key={m.value} value={m.name}>
                              <Checkbox
                                checked={selectedMilestones.includes(m.name)}
                              />
                              <ListItemText primary={m.name} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Currency *</InputLabel>
                      <Select
                        name="currency"
                        value={form.currency}
                        label="Currency *"
                        onChange={handleChange}
                      >
                        {renderMenuItems(currencies)}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Client Info from Project */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Client Name"
                      name="clientName"
                      value={form.clientName}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Client Email"
                      name="clientEmail"
                      value={form.clientEmail}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Company"
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>

                {/* Dates */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Issue Date *"
                      value={issueDate}
                      onChange={setIssueDate}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Due Date *"
                      value={dueDate}
                      onChange={setDueDate}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                </Grid>

                {/* Status */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={form.status}
                    label="Status"
                    onChange={handleChange}
                  >
                    {renderMenuItems(statuses)}
                  </Select>
                </FormControl>

                {/* Notes */}
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  multiline
                  rows={3}
                  placeholder="Add any additional notes"
                  value={form.notes}
                  onChange={handleChange}
                  sx={{ mb: 3 }}
                />
              </>
            )}

            <Divider sx={{ my: 3 }} />

            {/* ✅ Detailed Invoice Summary */}
            {/* <Card
              ref={printRef} // 👈 attach the ref here
              sx={{
                bgcolor: "primary.main",
                color: "white",
                p: 3,
                borderRadius: 3,
                mb: 3,
              }}
            >
              <Typography variant="h6" gutterBottom>
                📌 Invoice Summary
              </Typography>
              <Typography>
                <strong>Type:</strong>{" "}
                {selectedProject?.paymentStructure || invoiceType}
              </Typography>

              {(selectedProject?.paymentStructure === "multiple" ||
                selectedProject?.paymentStructure === "recurring") &&
                selectedMilestones.length > 0 && (
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    <strong>Total Invoice Amount:</strong> {calculatedAmount}{" "}
                    {form.currency}
                  </Typography>
                )}
              <Typography>
                <strong>Amount:</strong> {form.currency} {form.amount || "0.00"}
              </Typography>
              <Typography>
                <strong>Status:</strong> {form.status}
              </Typography>
              <Typography>
                <strong>Issue Date:</strong> {issueDate.format("YYYY-MM-DD")}
              </Typography>
              <Typography>
                <strong>Due Date:</strong> {dueDate.format("YYYY-MM-DD")}
              </Typography>
              {form.notes && (
                <Typography>
                  <strong>Notes:</strong> {form.notes}
                </Typography>
              )}
            </Card> */}
            <Card
              ref={printRef}
              sx={{
                bgcolor: "white",
                color: "black",
                p: 4,
                borderRadius: 3,
                mb: 3,
                boxShadow: 4,
                border: "1px solid #e0e0e0",
              }}
            >
              {/* 🔹 Blue Header */}
              <Box
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  p: 2,
                  borderRadius: "8px 8px 0 0",
                  mb: 3,
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  INVOICE
                </Typography>
              </Box>

              {/* Header Section */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="h6" fontWeight="bold">
                    Client
                  </Typography>
                  <Typography>{form.clientName || "Client Name"}</Typography>
                  <Typography>
                    {form.clientEmail || "email@address.com"}
                  </Typography>
                  <Typography>{form.phone || "0300-XXXXXXX"}</Typography>
                  <Typography>{form.address || "Lahore, Pakistan"}</Typography>
                </Grid>
              </Grid>

              {/* Invoice Info */}
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography>
                    <strong>Invoice #:</strong> CR-1
                  </Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography>
                    <strong>Issued:</strong> {issueDate.format("YYYY-MM-DD")}
                  </Typography>
                  <Typography>
                    <strong>Due:</strong> {dueDate.format("YYYY-MM-DD")}
                  </Typography>
                </Grid>
              </Grid>

              {/* Notes */}
              {form.notes && (
                <Box sx={{ mb: 3 }}>
                  <Typography>
                    <strong>Notes:</strong> {form.notes}
                  </Typography>
                </Box>
              )}

              {/* Items Table */}
              <Table size="small" sx={{ mb: 3, border: "1px solid #ddd" }}>
                <TableHead sx={{ bgcolor: "grey.200" }}>
                  <TableRow>
                    <TableCell>
                      <strong>Item</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Qty</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Rate</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Price</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{form.itemName}</TableCell>
                    <TableCell>{form.qty}</TableCell>
                    <TableCell>{form.rate}</TableCell>
                    <TableCell>{form.amount}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {/* Totals with taxHandling logic */}
              {(() => {
                const TAX_RATE = 0.15;
                const amount = parseFloat(form.amount || 0);
                const taxHandling = form.taxHandling || "inclusive";
                let subtotal = 0;
                let tax = 0;
                let total = 0;

                if (taxHandling === "inclusive") {
                  subtotal = amount / (1 + TAX_RATE);
                  tax = amount - subtotal;
                  total = amount;
                } else {
                  subtotal = amount;
                  tax = subtotal * TAX_RATE;
                  total = subtotal + tax;
                }

                return (
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <em>
                        (
                        {taxHandling === "inclusive"
                          ? "Tax Inclusive"
                          : "Tax Exclusive"}
                        )
                      </em>
                    </Typography>
                    <Typography>
                      <strong>Subtotal:</strong> {form.currency || "$"}{" "}
                      {subtotal.toFixed(2)}
                    </Typography>
                    <Typography>
                      <strong>Tax (15%):</strong> {form.currency || "$"}{" "}
                      {tax.toFixed(2)}
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ mt: 1, color: "primary.main" }}
                    >
                      Total: {form.currency || "$"} {total.toFixed(2)}
                    </Typography>
                  </Box>
                );
              })()}
            </Card>

            {/* Actions */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button variant="outlined" size="large">
                Cancel
              </Button>
              <Button
                variant="contained"
                size="large"
                color="success"
                onClick={handleDownloadPDF}
              >
                Create Invoice
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
}

/* 🔹 Section Header Component */
function SectionHeader({ icon, title }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      <Avatar sx={{ bgcolor: "primary.main", mr: 2, width: 40, height: 40 }}>
        {icon}
      </Avatar>
      <Typography variant="h6" fontWeight="bold">
        {title}
      </Typography>
    </Box>
  );
}
