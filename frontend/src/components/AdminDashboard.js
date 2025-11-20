import React, { useState, useEffect } from "react";
import { Form, Button, Table, Container, Card, Row, Col, Tabs, Tab, Image, Badge, Modal } from "react-bootstrap";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { showToast } from "./Toast";
import Loading from "./Loading";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    shortDescription: "",
    fullDescription: "",
    price: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token || jwtDecode(token).role !== "admin") return navigate("/login");
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/products");
      setProducts(res.data);
    } catch (err) {
      showToast("Failed to load products", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key] !== null) {
        formData.append(key, form[key]);
      }
    });

    try {
      if (editId) {
        await api.put(`/api/products/${editId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        showToast("Product updated successfully!", "success");
      } else {
        await api.post("/api/products", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        showToast("Product added successfully!", "success");
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      showToast("Error saving product", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      shortDescription: "",
      fullDescription: "",
      price: "",
      image: null,
    });
    setImagePreview(null);
    setEditId(null);
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      shortDescription: product.shortDescription,
      fullDescription: product.fullDescription || "",
      price: product.price,
      image: null,
    });
    setImagePreview(product.image ? `${api.defaults.baseURL}${product.image}` : null);
    setEditId(product._id);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/api/products/${productToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Product deleted successfully!", "success");
      fetchProducts();
    } catch (err) {
      showToast("Error deleting product", "danger");
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <Container className="my-5">
      <h2 className="mb-4">Admin Dashboard</h2>
      
      <Tabs defaultActiveKey="add" className="mb-4">
        <Tab eventKey="add" title="➕ Add Product">
          <Card className="mt-3">
            <Card.Header>
              <h4 className="mb-0">{editId ? "Edit Product" : "Add New Product"}</h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Product Name *</Form.Label>
                      <Form.Control
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        placeholder="Enter product name"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Short Description *</Form.Label>
                      <Form.Control
                        type="text"
                        value={form.shortDescription}
                        onChange={(e) =>
                          setForm({ ...form, shortDescription: e.target.value })
                        }
                        required
                        placeholder="Brief description (shown on product cards)"
                        maxLength={150}
                      />
                      <Form.Text className="text-muted">
                        {form.shortDescription.length}/150 characters
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Full Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={form.fullDescription}
                        onChange={(e) =>
                          setForm({ ...form, fullDescription: e.target.value })
                        }
                        placeholder="Detailed product description"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Price *</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        required
                        placeholder="0.00"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Product Image</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <Form.Text className="text-muted">
                        {editId && !form.image ? "Leave empty to keep current image" : "Upload product image"}
                      </Form.Text>
                    </Form.Group>

                    <div className="d-flex gap-2">
                      <Button 
                        type="submit" 
                        variant="primary" 
                        disabled={submitting}
                      >
                        {submitting 
                          ? (editId ? "Updating..." : "Adding...") 
                          : (editId ? "Update Product" : "Add Product")
                        }
                      </Button>
                      {editId && (
                        <Button 
                          type="button" 
                          variant="secondary" 
                          onClick={resetForm}
                        >
                          Cancel Edit
                        </Button>
                      )}
                    </div>
                  </Col>
                  <Col md={4}>
                    {imagePreview && (
                      <Card>
                        <Card.Header>Image Preview</Card.Header>
                        <Card.Body className="p-2">
                          <Image 
                            src={imagePreview} 
                            fluid 
                            rounded
                            style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
                          />
                        </Card.Body>
                      </Card>
                    )}
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="products" title={`📦 Products (${products.length})`}>
          <Card className="mt-3">
            <Card.Header>
              <h4 className="mb-0">All Products</h4>
            </Card.Header>
            <Card.Body>
              {products.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">No products found. Add your first product!</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product._id}>
                          <td>
                            <Image
                              src={product.image ? `${api.defaults.baseURL}${product.image}` : 'https://via.placeholder.com/50'}
                              rounded
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                          </td>
                          <td>
                            <strong>{product.name}</strong>
                          </td>
                          <td>
                            <small className="text-muted">
                              {product.shortDescription?.substring(0, 50)}
                              {product.shortDescription?.length > 50 ? '...' : ''}
                            </small>
                          </td>
                          <td>
                            <Badge bg="success">${product.price}</Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button 
                                variant="warning" 
                                size="sm"
                                onClick={() => handleEdit(product)}
                              >
                                ✏️ Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteClick(product)}
                              >
                                🗑️ Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{productToDelete?.name}</strong>? 
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete Product
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
