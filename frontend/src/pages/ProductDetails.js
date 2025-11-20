import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Spinner, Alert } from 'react-bootstrap';
import api from '../api/axios';
import { showToast } from '../components/Toast';
import Loading from '../components/Loading';
import { useAppDispatch } from '../store/hooks';
import { addToCart } from '../store/slices/cartSlice';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError('Product not found');
        showToast('Failed to load product', 'danger');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!token) {
      navigate('/login');
      return;
    }
    dispatch(addToCart({ productId: product._id }))
      .unwrap()
      .then(() => {
        showToast('Added to cart!', 'success');
      })
      .catch((error) => {
        showToast(error || 'Error adding to cart', 'danger');
      });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/500';
    if (imagePath.startsWith('http')) return imagePath;
    return `${api.defaults.baseURL}${imagePath}`;
  };

  if (loading) return <Loading />;
  if (error || !product) {
    return (
      <Container>
        <Alert variant="danger">{error || 'Product not found'}</Alert>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Button variant="outline-secondary" onClick={() => navigate(-1)} className="mb-4">
        ← Back
      </Button>
      <Row>
        <Col md={6}>
          <Card.Img 
            variant="top" 
            src={getImageUrl(product.image)} 
            style={{ width: '100%', height: '500px', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/500';
            }}
          />
        </Col>
        <Col md={6}>
          <h1>{product.name}</h1>
          <h3 className="text-primary mb-4">${product.price}</h3>
          <p className="lead">{product.shortDescription}</p>
          {product.fullDescription && (
            <div className="my-4">
              <h5>Description</h5>
              <p>{product.fullDescription}</p>
            </div>
          )}
          <Button 
            variant="primary" 
            size="lg" 
            onClick={handleAddToCart}
            className="w-100"
          >
            Add to Cart
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetails;

