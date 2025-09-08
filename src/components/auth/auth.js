import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Tab,
  Tabs,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  ArrowForward,
  Person,
  Lock,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

const Auth = ({ onLoginSuccess }) => {
  const [tabValue, setTabValue] = useState("signin");
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetUsernameOrEmail, setResetUsernameOrEmail] = useState("");
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("https://create-backend-two.vercel.app/user/signin", {
        email: usernameOrEmail,
        password: password,
      });

      console.log("✅ Login response:", res.data);

      // Save JWT + user info
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // ✅ Tell parent App that we're authenticated
      if (onLoginSuccess) {
        onLoginSuccess();
      }

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Login failed:", error.response || error);
      alert(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("https://create-backend-two.vercel.app/user/signup", {
        fullName,
        email: usernameOrEmail,
        password,
      });

      alert("Account created successfully! Please sign in.");

      // ✅ Clear fields
      setFullName("");
      setUsernameOrEmail("");
      setPassword("");

      // ✅ Switch to Sign In tab
      setTabValue("signin");
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!resetUsernameOrEmail) {
      alert("Please enter your email or username.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      alert(
        "If this email/username exists, password reset instructions have been sent."
      );
      setIsResetting(false);
      setResetUsernameOrEmail("");
      setLoading(false);
    }, 1000);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f9fafb",
        p: 2,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 400 }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h3" color="primary" fontWeight="bold">
            Create
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Financial Wellness for Content Creators
          </Typography>
        </Box>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          sx={{ mb: 2 }}
        >
          <Tab label="Sign In" value="signin" />
          <Tab label="Sign Up" value="signup" />
        </Tabs>

        {/* Sign In */}
        {tabValue === "signin" && (
          <Card>
            <CardHeader
              title="Welcome back"
              subheader="Sign in to your account to continue"
            />
            <form onSubmit={handleSignIn}>
              <CardContent>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email or Username"
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
                <Box textAlign="right" mt={1}>
                  <Button onClick={() => setIsResetting(true)} size="small">
                    Forgot Password?
                  </Button>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  endIcon={<ArrowForward />}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </CardActions>
            </form>
          </Card>
        )}

        {/* Sign Up */}
        {tabValue === "signup" && (
          <Card>
            <CardHeader
              title="Create an account"
              subheader="Enter your details to get started"
            />
            <form onSubmit={handleSignUp}>
              <CardContent>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email or Username"
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
              </CardContent>
              <CardActions>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  endIcon={<ArrowForward />}
                >
                  {loading ? "Creating..." : "Create Account"}
                </Button>
              </CardActions>
            </form>
          </Card>
        )}

        {/* Forgot Password */}
        {isResetting && (
          <Card sx={{ mt: 2 }}>
            <CardHeader
              title="Reset Password"
              subheader="Enter your email or username to reset your password"
            />
            <form onSubmit={handleForgotPassword}>
              <CardContent>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email or Username"
                  value={resetUsernameOrEmail}
                  onChange={(e) => setResetUsernameOrEmail(e.target.value)}
                  required
                />
              </CardContent>
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
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default Auth;
