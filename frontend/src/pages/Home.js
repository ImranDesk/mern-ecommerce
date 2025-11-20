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
    <Container>
      <div className="mb-4">
        <h1 className="mb-4">Our Products</h1>
        <InputGroup className="mb-4" style={{ maxWidth: '500px' }}>
          <Form.Control
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </div>
      {filteredProducts.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No products found.</p>
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
  );
};

export default Home;