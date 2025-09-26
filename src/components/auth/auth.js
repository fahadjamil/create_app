import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/img/create-logo.png";
import EWallet from "../../assets/img/EWallet.png";
import ContentPen from "../../assets/img/ContentPen.png";
import GoogleHome from "../../assets/img/GoogleHome.png";
import IdCard from "../../assets/img/IdCard.png";
import LockLogo from "../../assets/img/Lock.png";
import MobilePhone from "../../assets/img/MobilePhone.png";
import SendEmail from "../../assets/img/SendEmail.png";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import Popup from "../shared/Popup";

import {
  Box,
  Button,
  Checkbox,
  RadioGroup,
  FormControl,
  FormControlLabel,
  TextField,
  Typography,
  Chip,
  Stack,
  Paper,
  IconButton,
  InputAdornment,
  Radio,
  Link,
  Card,
  CardActions,
} from "@mui/material";
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  PhoneAndroid,
} from "@mui/icons-material";

const Auth = ({ onLoginSuccess }) => {
  const [tabValue, setTabValue] = useState("signin"); // signin | signup
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [signupStep, setSignupStep] = useState(1);

  // Form states
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [role, setRole] = useState("");
  const [skills, setSkills] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const nextStep = () => setSignupStep((prev) => prev + 1);
  const prevStep = () => setSignupStep((prev) => prev - 1);
  const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

  const navigate = useNavigate();
  const baseURL = process.env.REACT_APP_BASE_URL;

  const allSkills = [
    "Video Production",
    "Photo Editing",
    "Graphic Design",
    "Script Writing",
    "Voice Acting",
    "Animation Skills",
    "Live Streaming",
    "Short Videos",
  ];

  const sendSMS = async (otpToSend) => {
    if (phone) {
      try {
        const response = await axios.post(
          "https://bsms.its.com.pk/otpsms.php",
          null, // No body
          {
            params: {
              key: "8aaf1d3a0b626b4840b6558792b4506b",
              receiver: phone, // e.g. 03134884635
              sender: "SmartLane",
              otpcode: otpToSend,
              param1: "Toseef Kirmani",
              param2: "Add Money",
            },
          }
        );

        console.log("✅ SMS Sent:", response.data);
      } catch (error) {
        console.error(
          "❌ Error sending SMS:",
          error.response?.data || error.message
        );
      }
    }
  };

  const toggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else if (skills.length < 5) {
      setSkills([...skills, skill]);
    }
  };

  const filteredSkills = allSkills.filter((skill) =>
    skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /** 🔹 Sign In */
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${baseURL}/user/signin`, {
        email: usernameOrEmail,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (onLoginSuccess) onLoginSuccess();
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Sign Up */
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    const Dataset = {
      phone,
      firstName,
      lastName,
      email: usernameOrEmail,
      password,
      role,
      searchTerm,
    };

    try {
      await axios.post(`${baseURL}/user/signup`, Dataset);

      setAlertMessage("OTP sent successfully!");

      // Clear form
      setPhone("");
      setFirstName("");
      setLastName("");
      setUsernameOrEmail("");
      setPassword("");
      setRole("user");
      setSearchTerm("");
      setTabValue("signin");
    } catch (error) {
      let errMsg = "❌ Signup failed. Please try again.";

      // Specific error handling
      if (
        error.response?.data?.message ===
        "User with this email or phone number already exists."
      ) {
        errMsg = "⚠️ A user with this email or phone already exists.";
      } else if (error.response?.data?.message) {
        errMsg = `❌ ${error.response.data.message}`;
      }
      setAlertMessage(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Forgot Password */
  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!resetEmail) {
      alert("Please enter your email.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      alert("📧 Password reset instructions sent (if account exists).");
      setResetEmail("");
      setIsResetting(false);
      setLoading(false);
    }, 1000);
  };
  /** 🔹 Send SMS */

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f9fafb",
        p: 2,
      }}
    >
      <Popup
        show={showAlert}
        type={alertType}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
      <Box
        sx={{
          position: "absolute",
          top: 20,
          left: 30,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box component="img" src={logo} alt="Create Logo" sx={{ height: 60 }} />
      </Box>
      <Box sx={{ position: "absolute", top: 20, right: 30 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() =>
            setTabValue(tabValue === "signin" ? "signup" : "signin")
          }
        >
          {tabValue === "signin" ? "Sign Up" : "Log In"}
        </Button>
      </Box>

      {/* Auth Card */}
      <Card sx={{ p: 3, maxWidth: 400, width: "100%", boxShadow: 2 }}>
        {!isResetting ? (
          <>
            {/* 🔹 Sign In */}
            {tabValue === "signin" && (
              <form onSubmit={handleSignIn}>
                <Typography variant="h6" align="center" gutterBottom>
                  Welcome Back
                </Typography>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  required
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    my: 1,
                  }}
                >
                  <FormControlLabel
                    control={<Checkbox size="small" />}
                    label="Remember me"
                  />
                  <Button onClick={() => setIsResetting(true)} size="small">
                    Forgot password?
                  </Button>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    bgcolor: "#0a1a33",
                    borderRadius: "25px",
                    py: 1.2,
                    mt: 1,
                    "&:hover": { bgcolor: "#142850" },
                  }}
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            )}

            {/* 🔹 Sign Up */}
            {tabValue === "signup" && (
              <form onSubmit={handleSignUp}>
                {signupStep === 1 && (
                  <Box
                    sx={{
                      p: 3,
                      textAlign: "left", // 👈 Align text & children left
                    }}
                  >
                    {/* Phone Icon */}
                    <Box mb={3}>
                      {/* Replace with actual image or SVG */}
                      <img
                        src={MobilePhone}
                        alt="Wallet Illustration"
                        width={50}
                      />
                    </Box>

                    {/* Heading */}
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: "bold" }}
                    >
                      Let’s get started
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      We'll send a verification code to this number.
                    </Typography>

                    {/* Phone Input */}
                    <TextField
                      label="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      fullWidth
                      sx={{ mb: 2 }}
                      placeholder="+923001234567"
                    />

                    <Button
                      onClick={async () => {
                        const phoneRegex = /^\+92\d{10}$/;

                        if (!phone.trim()) {
                          setAlertMessage("Phone number is required");
                          setAlertType("error");
                          setShowAlert(true);
                          return;
                        }

                        if (!phoneRegex.test(phone.trim())) {
                          setAlertMessage(
                            "Please enter a valid phone number in the format +923XXXXXXXXX"
                          );
                          setAlertType("error");
                          setShowAlert(true);
                          return;
                        }

                        // Generate and send OTP
                        const otpCode = generateOTP();
                        setGeneratedOtp(otpCode);

                        try {
                          await sendSMS(otpCode);
                          setAlertMessage("OTP sent successfully!");
                          setAlertType("success");
                          setShowAlert(true);
                          nextStep(); // Move to OTP screen
                        } catch (error) {
                          setAlertMessage(
                            "Failed to send OTP. Please try again."
                          );
                          setAlertType("error");
                          setShowAlert(true);
                        }
                      }}
                      fullWidth
                      variant="contained"
                      sx={{
                        bgcolor: "#0a1a33",
                        py: 1.2,
                        borderRadius: "25px",
                        fontSize: "16px",
                        textTransform: "none",
                        "&:hover": { bgcolor: "#142850" },
                      }}
                    >
                      Continue
                    </Button>
                  </Box>
                )}

                {signupStep === 2 && (
                  <Box
                    sx={{
                      p: 3,
                      textAlign: "left", // left alignment like your phone UI
                    }}
                  >
                    {/* OTP Icon */}
                    <Box mb={3}>
                      {/* Replace with actual image or SVG */}
                      <img
                        src={GoogleHome}
                        alt="Wallet Illustration"
                        width={50}
                      />
                    </Box>

                    {/* Heading */}
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: "bold" }}
                    >
                      Enter your code
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      A 4-digit code has been sent to you.
                    </Typography>

                    {/* OTP Input */}
                    <TextField
                      label="Verification Code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      fullWidth
                      sx={{ mb: 2 }}
                      inputProps={{
                        maxLength: 4,
                        style: {
                          letterSpacing: "8px",
                          fontSize: "18px",
                          textAlign: "center",
                        },
                      }}
                    />

                    {/* Verify Button */}
                    <Button
                      onClick={() => {
                        if (!otp.trim()) {
                          setAlertMessage("Please enter the OTP.");
                          setAlertType("error");
                          setShowAlert(true);
                          return;
                        }

                        if (otp !== generatedOtp) {
                          setAlertMessage("Invalid OTP. Please try again.");
                          setAlertType("error");
                          setShowAlert(true);
                          return;
                        }

                        setAlertMessage("OTP verified successfully!");
                        setAlertType("success");
                        setShowAlert(true);
                        nextStep(); // Proceed to next step (e.g., user details)
                      }}
                      fullWidth
                      variant="contained"
                      sx={{
                        bgcolor: "#0a1a33",
                        py: 1.2,
                        borderRadius: "25px",
                        fontSize: "16px",
                        textTransform: "none",
                        "&:hover": { bgcolor: "#142850" },
                      }}
                    >
                      Verify
                    </Button>
                    {/* <Button
                      onClick={async () => {
                        const otpCode = generateOTP();
                        setGeneratedOtp(otpCode);

                        try {
                          await sendSMS(otpCode);
                          setAlertMessage("OTP resent successfully!");
                          setAlertType("success");
                          setShowAlert(true);
                        } catch (error) {
                          setAlertMessage("Failed to resend OTP.");
                          setAlertType("error");
                          setShowAlert(true);
                        }
                      }}
                      variant="text"
                      sx={{ mt: 1, textTransform: "none", fontSize: "14px" }}
                    >
                      Resend Code
                    </Button> */}
                  </Box>
                )}

                {signupStep === 3 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                      maxWidth: 400,
                      mx: "auto",
                      p: 2,
                    }}
                  >
                    <Box mb={3}>
                      <img src={IdCard} alt="Wallet Illustration" width={50} />
                    </Box>

                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: "bold" }}
                    >
                      What should we call you?
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      To get started, we need your legal name (especially if
                      you’re making a Create wallet!)
                    </Typography>

                    <TextField
                      label="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      fullWidth
                      autoFocus
                      required
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      label="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      fullWidth
                      required
                      sx={{ mb: 3 }}
                    />

                    <Button
                      onClick={() => {
                        if (!firstName.trim() || !lastName.trim()) {
                          setAlertMessage(
                            "First Name and Last Name are required."
                          );
                          setAlertType("error");
                          setShowAlert(true);
                          return;
                        }

                        nextStep();
                      }}
                      fullWidth
                      variant="contained"
                      sx={{
                        bgcolor: "#0a1a33",
                        py: 1.2,
                        borderRadius: "25px",
                        fontSize: "16px",
                        textTransform: "none",
                        "&:hover": { bgcolor: "#142850" },
                      }}
                    >
                      Next
                    </Button>
                  </Box>
                )}

                {signupStep === 4 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                      maxWidth: 400,
                      mx: "auto",
                      p: 2,
                    }}
                  >
                    <Box mb={3}>
                      <img
                        src={SendEmail}
                        alt="Email Illustration"
                        width={50}
                      />
                    </Box>

                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: "bold" }}
                    >
                      How can we reach you?
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      We need an email address to send you alerts and important
                      communications.
                    </Typography>

                    <TextField
                      label="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      fullWidth
                      required
                      sx={{ mb: 3 }}
                    />

                    <Button
                      onClick={() => {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                        if (!email.trim()) {
                          setAlertMessage("Email is required.");
                          setAlertType("error");
                          setShowAlert(true);
                          return;
                        }

                        if (!emailRegex.test(email.trim())) {
                          setAlertMessage(
                            "Please enter a valid email address."
                          );
                          setAlertType("error");
                          setShowAlert(true);
                          return;
                        }

                        nextStep();
                      }}
                      fullWidth
                      variant="contained"
                      sx={{
                        bgcolor: "#0a1a33",
                        py: 1.2,
                        borderRadius: "25px",
                        fontSize: "16px",
                        textTransform: "none",
                        "&:hover": { bgcolor: "#142850" },
                      }}
                    >
                      Next
                    </Button>
                  </Box>
                )}

                {signupStep === 5 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                      maxWidth: 400,
                      mx: "auto",
                      p: 2,
                    }}
                  >
                    <Box mb={3}>
                      <img src={LockLogo} alt="Lock Icon" width={50} />
                    </Box>

                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: "bold" }}
                    >
                      Secure your account
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      We take your privacy and security seriously — your
                      password is the first way to secure yourself.
                    </Typography>

                    {/* Password Field */}
                    <TextField
                      type={showPassword ? "text" : "password"}
                      label="Your Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      required
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword((prev) => !prev)}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Confirm Password */}
                    <TextField
                      type={showPassword ? "text" : "password"}
                      label="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      fullWidth
                      required
                      sx={{ mb: 1 }}
                    />

                    {/* Password mismatch error */}
                    {confirmPassword && password !== confirmPassword && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mb: 2 }}
                      >
                        Passwords do not match.
                      </Typography>
                    )}

                    {/* ✅ Password requirements checklist */}
                    <Box
                      sx={{
                        border: "1px solid #e0e0e0",
                        borderRadius: 2,
                        p: 2,
                        mb: 3,
                        bgcolor: "#fafafa",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "bold", mb: 1 }}
                      >
                        A secure password includes:
                      </Typography>

                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        {password.length >= 8 ? (
                          <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                        ) : (
                          <RadioButtonUncheckedIcon
                            color="disabled"
                            sx={{ mr: 1 }}
                          />
                        )}
                        <Typography variant="body2">
                          Minimum 8 characters
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        {/\d/.test(password) ? (
                          <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                        ) : (
                          <RadioButtonUncheckedIcon
                            color="disabled"
                            sx={{ mr: 1 }}
                          />
                        )}
                        <Typography variant="body2">
                          At least one number
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? (
                          <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                        ) : (
                          <RadioButtonUncheckedIcon
                            color="disabled"
                            sx={{ mr: 1 }}
                          />
                        )}
                        <Typography variant="body2">
                          One special character
                        </Typography>
                      </Box>
                    </Box>

                    {/* Next Button */}
                    <Button
                      onClick={nextStep}
                      fullWidth
                      variant="contained"
                      disabled={
                        !(
                          password.length >= 8 &&
                          /\d/.test(password) &&
                          /[!@#$%^&*(),.?":{}|<>]/.test(password) &&
                          password === confirmPassword
                        )
                      }
                      sx={{
                        bgcolor: "#0a1a33",
                        py: 1.2,
                        borderRadius: "25px",
                        fontSize: "16px",
                        textTransform: "none",
                        "&:hover": { bgcolor: "#142850" },
                      }}
                    >
                      Next
                    </Button>
                  </Box>
                )}

                {signupStep === 6 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                      maxWidth: 400,
                      mx: "auto",
                      p: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: "bold" }}
                    >
                      Pick the right account type
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      To make the app work the best it can for you, we want your
                      permission for a few features.
                    </Typography>

                    {/* ✅ Radio button group */}
                    <FormControl component="fieldset" sx={{ width: "100%" }}>
                      <RadioGroup
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        {/* ✅ Option 1 */}
                        <Box
                          sx={{
                            border:
                              role === "creator"
                                ? "2px solid #0a1a33"
                                : "1px solid #e0e0e0",
                            borderRadius: 2,
                            p: 2,
                            mb: 2,
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            cursor: "pointer",
                          }}
                          onClick={() => setRole("creator")}
                        >
                          <Box>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: "bold" }}
                            >
                              I’m a Creator
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              I’m a creator, freelancing or fulltime.
                            </Typography>
                          </Box>
                          <Radio checked={role === "creator"} value="creator" />
                        </Box>

                        {/* ✅ Option 2 */}
                        <Box
                          sx={{
                            border:
                              role === "manager"
                                ? "2px solid #0a1a33"
                                : "1px solid #e0e0e0",
                            borderRadius: 2,
                            p: 2,
                            mb: 2,
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            cursor: "pointer",
                          }}
                          onClick={() => setRole("manager")}
                        >
                          <Box>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: "bold" }}
                            >
                              I manage talent
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              I manage one or more creators
                            </Typography>
                          </Box>
                          <Radio checked={role === "manager"} value="manager" />
                        </Box>

                        {/* ✅ Option 3 */}
                        <Box
                          sx={{
                            border:
                              role === "both"
                                ? "2px solid #0a1a33"
                                : "1px solid #e0e0e0",
                            borderRadius: 2,
                            p: 2,
                            mb: 2,
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            cursor: "pointer",
                          }}
                          onClick={() => setRole("both")}
                        >
                          <Box>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: "bold" }}
                            >
                              I create and manage talent
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              I am a Creator as well as a manager
                            </Typography>
                          </Box>
                          <Radio checked={role === "both"} value="both" />
                        </Box>
                      </RadioGroup>
                    </FormControl>

                    <Button
                      onClick={nextStep}
                      fullWidth
                      variant="contained"
                      disabled={!role}
                      sx={{
                        bgcolor: "#0a1a33",
                        py: 1.2,
                        borderRadius: "25px",
                        fontSize: "16px",
                        textTransform: "none",
                        "&:hover": { bgcolor: "#142850" },
                      }}
                    >
                      Next
                    </Button>
                  </Box>
                )}

                {signupStep === 7 && (
                  <Paper
                    elevation={0}
                    sx={{
                      maxWidth: 380,
                      p: 3,
                      borderRadius: 2,
                      bgcolor: "background.default",
                    }}
                  >
                    <Box mb={3}>
                      {/* Replace with actual image or SVG */}
                      <img
                        src={ContentPen}
                        alt="Wallet Illustration"
                        width={50}
                      />
                    </Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: "bold" }}
                    >
                      Your skills
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Understanding what you do helps us give better advice in
                      the future. Pick up to 5.
                    </Typography>

                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{ mb: 2 }}
                    />

                    <Box
                      sx={{
                        maxHeight: 160,
                        overflowY: "auto",
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        p: 1,
                        mb: 2,
                      }}
                    >
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {filteredSkills.map((skill) => (
                          <Chip
                            key={skill}
                            label={skill}
                            clickable
                            onClick={() => toggleSkill(skill)}
                            color={
                              skills.includes(skill) ? "primary" : "default"
                            }
                          />
                        ))}
                      </Stack>
                    </Box>

                    <Stack
                      direction="row"
                      spacing={2}
                      mt={3}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Button
                        onClick={nextStep}
                        variant="contained"
                        fullWidth
                        sx={{
                          bgcolor: "#0a1a33",
                          borderRadius: "25px",
                          py: 1.5,
                          textTransform: "none",
                          fontWeight: "bold",
                          position: "relative",
                          "&:hover": {
                            bgcolor: "#142850",
                          },
                        }}
                      >
                        Next
                      </Button>
                    </Stack>

                    <Box display="flex" justifyContent="center" mt={1}>
                      <Button variant="text" onClick={nextStep}>
                        Skip
                      </Button>
                    </Box>
                  </Paper>
                )}

                {signupStep === 8 && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      maxWidth: 400,
                      mx: "auto",
                      borderRadius: 3,
                      textAlign: "center",
                      bgcolor: "background.paper",
                    }}
                  >
                    {/* Illustration */}
                    <Box mb={3}>
                      <img
                        src={EWallet}
                        alt="Wallet Illustration"
                        width={120}
                      />
                    </Box>

                    {/* Heading */}
                    <Typography variant="h5" gutterBottom>
                      All set!
                    </Typography>

                    {/* Subtext */}
                    <Typography variant="body2" color="text.secondary" mb={3}>
                      We’ve created your Create account. To level up your
                      financial experience, get a Create Wallet.
                    </Typography>

                    {/* Benefits Section */}
                    <Typography
                      variant="subtitle2"
                      align="left"
                      sx={{ fontWeight: "bold", mb: 1 }}
                    >
                      Benefits of a Create Wallet
                    </Typography>

                    {/* Benefit Items (Static, always shown as checked) */}
                    <Box sx={{ display: "flex", alignItems: "left", mb: 1 }}>
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Automatically track your business finances
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "left", mb: 1 }}>
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Qualify for advanced financing
                      </Typography>
                    </Box>

                    {/* Buttons */}
                    <Stack
                      direction="row"
                      spacing={2}
                      mt={3}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Button
                        variant="contained"
                        onClick={nextStep}
                        fullWidth
                        sx={{
                          bgcolor: "#0a1a33",
                          borderRadius: "25px",
                          py: 1.5,
                          textTransform: "none",
                          fontWeight: "bold",
                          position: "relative",
                          "&:hover": {
                            bgcolor: "#142850",
                          },
                        }}
                      >
                        Create My Wallet
                      </Button>
                    </Stack>

                    {/* <Button
                      variant="text"
                      sx={{ mt: 1 }}
                      onClick={handleSignUp}
                    >
                      Skip
                    </Button> */}
                    <Button
                      variant="contained"
                      onClick={handleSignUp}
                      fullWidth
                      sx={{
                        bgcolor: "#7a8288ff",
                        borderRadius: "25px",
                        py: 1.5,
                        textTransform: "none",
                        fontWeight: "bold",
                        marginTop: "2px",
                        position: "relative",
                        "&:hover": {
                          bgcolor: "#7a8288ff",
                        },
                      }}
                    >
                      Submit
                    </Button>
                  </Paper>
                )}

                {signupStep === 9 && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      maxWidth: 400,
                      mx: "auto",
                      borderRadius: 3,
                      textAlign: "center",
                      bgcolor: "background.paper",
                    }}
                  >
                    {/* Illustration */}
                    <Box mb={3}>
                      {/* Replace with actual image or SVG */}
                      <img
                        src={EWallet}
                        alt="Wallet Illustration"
                        width={120}
                      />
                    </Box>

                    {/* Buttons */}
                    <Stack
                      direction="row"
                      spacing={2}
                      mt={3}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{
                          bgcolor: "#0a1a33",
                          borderRadius: "25px",
                          py: 1.5,
                          textTransform: "none",
                          fontWeight: "bold",
                          position: "relative",
                          "&:hover": {
                            bgcolor: "#142850",
                          },
                        }}
                      >
                        Next
                      </Button>
                    </Stack>

                    <Button variant="text" sx={{ mt: 1 }}>
                      Skip
                    </Button>
                  </Paper>
                )}
              </form>
            )}
          </>
        ) : (
          // 🔹 Forgot Password
          <form onSubmit={handleForgotPassword}>
            <Typography variant="h6" align="center" gutterBottom>
              Reset Password
            </Typography>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
            <CardActions>
              <Button
                onClick={() => setIsResetting(false)}
                variant="outlined"
                fullWidth
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
              >
                {loading ? "Sending..." : "Reset Password"}
              </Button>
            </CardActions>
          </form>
        )}
      </Card>

      {/* Footer */}
      <Box
        sx={{
          position: "fixed", // ✅ stays at bottom
          bottom: 10,
          left: 0,
          right: 0,
          textAlign: "center",
          p: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Having trouble accessing your account?{" "}
          <Link
            href="mailto:dev@createit.pk"
            underline="hover"
            sx={{ fontWeight: "bold", color: "#0a1a33" }}
          >
            Contact Support
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Auth;
