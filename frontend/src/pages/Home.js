import React, { useState, useEffect } from 'react';
import { Row, Col, Form, InputGroup, Container } from 'react-bootstrap';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import { showToast } from '../components/Toast';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/api/products');
        setProducts(res.data);
        setFilteredProducts(res.data);
      } catch (err) {
        showToast('Failed to load products', 'danger');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  if (loading) return <Loading />;

  return (
    <>
      <div className="hero-section">
        <Container>
          <div className="text-center">
            <h1 className="display-4 fw-bold mb-3">Welcome to Our Store</h1>
            <p className="lead mb-4">Discover amazing products at unbeatable prices</p>
            <div className="search-container mx-auto" style={{ maxWidth: '600px' }}>
              <InputGroup>
                <Form.Control
                  placeholder="🔍 Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ fontSize: '1.1rem' }}
                />
              </InputGroup>
            </div>
          </div>
        </Container>
      </div>
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">Our Products</h2>
          <span className="text-muted">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
          </span>
        </div>
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3 className="mb-3">No products found</h3>
            <p className="text-muted">Try adjusting your search terms</p>
          </div>
        ) : (
          <Row>
            {filteredProducts.map(product => (
              <Col md={4} lg={3} key={product._id} className="mb-4">
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
};

export default Home;