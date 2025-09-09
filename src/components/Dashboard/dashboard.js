import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Carousel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // optional filter by status
  const navigate = useNavigate();
  const baseURL = process.env.REACT_APP_BASE_URL;

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
  }, [status]); // re-fetch when status changes

  return (
    <Container fluid className="mt-4">
      <Row>
        {/* Available Balance */}
        <Col md={12}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <h6>Available Balance</h6>
              <h3>PKR 0</h3>
              <p>Your current available balance</p>
            </Card.Body>
          </Card>
        </Col>

        {/* Live Projects */}
        <Col md={12} className="my-3" style={{ backgroundColor: "#fff" }}>
          <Row>
            <Col md={12} className="m-2">
              <Card className="shadow-sm text-center w-100">
                <Card.Body>
                  <h6>Live Projects</h6>
                  <div className="d-flex justify-content-center">
                    {loading ? (
                      <p>Loading projects...</p>
                    ) : applications.length > 0 ? (
                      <Carousel
                        interval={null} // ❌ disables auto-slide
                        indicators={true}
                        controls={true}
                        className="w-100 custom-carousel"
                      >
                        {applications
                          .reduce((result, app, idx) => {
                            // Group projects 3 per slide
                            if (idx % 3 === 0) {
                              result.push(applications.slice(idx, idx + 3));
                            }
                            return result;
                          }, [])
                          .map((group, slideIdx) => (
                            <Carousel.Item key={slideIdx}>
                              <div className="d-flex justify-content-center gap-3">
                                {group.map((app, idx) => (
                                  <Card
                                    key={idx}
                                    className="p-3 mt-2 shadow-sm project-card"
                                    style={{ width: "30%", cursor: "pointer" }}
                                    onClick={() =>
                                      navigate(`/project/${app.pid}/edit`)
                                    } // ✅ Navigate with project ID
                                  >
                                    <strong>
                                      {app.projectName || "Unknown Project"}
                                    </strong>
                                    <p className="mb-1">{app.projectType}</p>
                                    <p>
                                      📅 Due:{" "}
                                      {new Date(app.endDate).toDateString()}
                                    </p>
                                    <h5>PKR {app.projectAmount || 0}</h5>
                                    <button className="btn btn-outline-primary btn-sm">
                                      {app.paymentStructure || "N/A"}
                                    </button>
                                    <p
                                      className={`mt-2 ${
                                        app.agree
                                          ? "text-success"
                                          : "text-danger"
                                      }`}
                                    >
                                      {app.agree
                                        ? "✅ Signed"
                                        : "❌ Not Signed"}
                                    </p>
                                  </Card>
                                ))}
                              </div>
                            </Carousel.Item>
                          ))}
                      </Carousel>
                    ) : (
                      <p>No live projects</p>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Recent Transactions */}
        <Col md={12}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <h6>Recent Transactions</h6>
              <p>No recent transactions</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
