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
    <Row className="align-items-center mb-3 pb-3 border-bottom">
      <Col md={2}>
        <Image 
          src={getImageUrl(item.product.image)} 
          alt={item.product.name} 
          fluid
          rounded
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/100';
          }}
        />
      </Col>
      <Col md={4}>
        <h5>{item.product.name}</h5>
        <p className="text-muted mb-0">{item.product.shortDescription}</p>
      </Col>
      <Col md={2} className="text-center">
        <div className="d-flex align-items-center justify-content-center">
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => handleUpdateQuantity(item.quantity - 1)} 
            disabled={item.quantity <= 1}
          >
            -
          </Button>
          <span className="mx-3">{item.quantity}</span>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => handleUpdateQuantity(item.quantity + 1)}
          >
            +
          </Button>
        </div>
      </Col>
      <Col md={2} className="text-center">
        <strong>${(item.product.price * item.quantity).toFixed(2)}</strong>
        <div className="text-muted small">${item.product.price} each</div>
      </Col>
      <Col md={2} className="text-end">
        <Button variant="danger" size="sm" onClick={handleRemove}>
          Remove
        </Button>
      </Col>
    </Row>
  );
};

export default CartItem;