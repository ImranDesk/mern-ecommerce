import React from 'react';
import { Button, Row, Col, Image } from 'react-bootstrap';
import api from '../api/axios';
import { showToast } from './Toast';
import { useAppDispatch } from '../store/hooks';
import { updateCartItem, removeFromCart } from '../store/slices/cartSlice';

const CartItem = ({ item }) => {
  const dispatch = useAppDispatch();

  const handleUpdateQuantity = (qty) => {
    if (qty < 1) return;
    dispatch(updateCartItem({ productId: item.product._id, quantity: qty }))
      .unwrap()
      .catch((error) => {
        showToast(error || 'Error updating quantity', 'danger');
      });
  };

  const handleRemove = () => {
    dispatch(removeFromCart(item.product._id))
      .unwrap()
      .then(() => {
        showToast('Item removed from cart', 'success');
      })
      .catch((error) => {
        showToast(error || 'Error removing item', 'danger');
      });
  };

  if (!item.product) return null;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/100';
    if (imagePath.startsWith('http')) return imagePath;
    return `${api.defaults.baseURL}${imagePath}`;
  };

  return (
    <div className="cart-item">
      <Row className="align-items-center">
        <Col md={2} className="mb-3 mb-md-0">
          <Image 
            src={getImageUrl(item.product.image)} 
            alt={item.product.name} 
            fluid
            rounded
            style={{ borderRadius: '12px', objectFit: 'cover', height: '120px', width: '100%' }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/100';
            }}
          />
        </Col>
        <Col md={4} className="mb-3 mb-md-0">
          <h5 className="fw-bold mb-2">{item.product.name}</h5>
          <p className="text-muted mb-2 small">{item.product.shortDescription}</p>
          <p className="text-primary mb-0 fw-bold">${item.product.price.toFixed(2)} each</p>
        </Col>
        <Col md={2} className="mb-3 mb-md-0">
          <div className="d-flex align-items-center justify-content-center">
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => handleUpdateQuantity(item.quantity - 1)} 
              disabled={item.quantity <= 1}
              style={{ minWidth: '40px', borderRadius: '8px' }}
            >
              −
            </Button>
            <span className="mx-3 fw-bold fs-5" style={{ minWidth: '30px', textAlign: 'center' }}>
              {item.quantity}
            </span>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
              style={{ minWidth: '40px', borderRadius: '8px' }}
            >
              +
            </Button>
          </div>
        </Col>
        <Col md={2} className="text-center mb-3 mb-md-0">
          <h5 className="fw-bold text-primary mb-0">${(item.product.price * item.quantity).toFixed(2)}</h5>
        </Col>
        <Col md={2} className="text-end">
          <Button 
            variant="danger" 
            size="sm" 
            onClick={handleRemove}
            style={{ borderRadius: '8px' }}
          >
            🗑️ Remove
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default CartItem;