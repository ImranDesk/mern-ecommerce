import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { showToast } from './Toast';
import { useAppDispatch } from '../store/hooks';
import { addToCart } from '../store/slices/cartSlice';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const token = localStorage.getItem('token');

  const handleAddToCart = async (e) => {
    e.stopPropagation();
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

  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/300';
    if (imagePath.startsWith('http')) return imagePath;
    return `${api.defaults.baseURL}${imagePath}`;
  };

  return (
    <Card className="product-card h-100" style={{ cursor: 'pointer' }} onClick={handleCardClick}>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <Card.Img 
          variant="top" 
          src={getImageUrl(product.image)} 
          style={{ height: '250px', objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300';
          }}
        />
        <div 
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '5px 10px',
            borderRadius: '20px',
            fontWeight: 'bold',
            color: '#6366f1'
          }}
        >
          ${product.price}
        </div>
      </div>
      <Card.Body className="d-flex flex-column p-4">
        <Card.Title className="fw-bold mb-2">{product.name}</Card.Title>
        <Card.Text className="flex-grow-1 text-muted small mb-3">{product.shortDescription}</Card.Text>
        <Button 
          className="btn-add-to-cart w-100" 
          onClick={handleAddToCart}
          variant="primary"
        >
          🛒 Add to Cart
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;