import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/img/create-logo.png";

import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Link,
  Card,
  CardActions,
} from "@mui/material";
import { Person, Lock, Visibility, VisibilityOff } from "@mui/icons-material";

const Auth = ({ onLoginSuccess }) => {
  const [tabValue, setTabValue] = useState("signin"); // signin | signup
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const navigate = useNavigate();
  const baseURL = process.env.REACT_APP_BASE_URL;

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
    try {
      await axios.post(`${baseURL}/user/signup`, {
        fullName,
        email: usernameOrEmail,
        password,
      });
      alert("✅ Account created successfully! Please sign in.");
      setFullName("");
      setUsernameOrEmail("");
      setPassword("");
      setTabValue("signin");
    } catch (error) {
      alert(error.response?.data?.message || error.message);
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
                <Typography variant="h6" align="center" gutterBottom>
                  Create Account
                </Typography>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
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
                  {loading ? "Creating..." : "Sign Up"}
                </Button>
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
          <Link href="#" underline="hover">
            Contact Support
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Auth;
