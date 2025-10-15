import * as React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "../src/components/auth/auth";
import Dashboard from "../src/components/Dashboard/dashboard";
import Layout from "./components/shared/layout";
import NewProject from "./components/project/newProject";
import EditProject from "./components/project/editProject";
import ProjectList from "./components/project/projectList";
import DraftProject from "./components/project/draftProjectForm";
import NewInvoice from "./components/Invoice/newInvoice";
import ClientDetails from "./components/client/clientDetails";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    !!localStorage.getItem("token") // initialize directly
  );

  // Optional: keep state in sync if localStorage changes in another tab
  React.useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <Routes>
      {/* Default redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      {/* Auth (NO navbar / bottomnav) */}
      <Route
        path="/login"
        element={<Auth onLoginSuccess={() => setIsAuthenticated(true)} />}
      />
      {/* Protected Routes inside Layout */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <Dashboard />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      {/* New Project Route */}
      <Route
        path="/projects/new"
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <NewProject />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/projectsList"
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <ProjectList />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/project/:id/edit"
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <EditProject />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/draftProject/:id/edit"
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <DraftProject />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/invoices/new"
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <NewInvoice />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/client/:id"
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <ClientDetails />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}
