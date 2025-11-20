import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { showToast } from '../components/Toast';
import Loading from '../components/Loading';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data);
      } catch (err) {
        showToast('Failed to load orders', 'danger');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  if (loading) return <Loading />;

  return (
    <Container className="my-5">
      <h2 className="mb-4">Order History</h2>
      {orders.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <p className="text-muted">You haven't placed any orders yet.</p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Start Shopping
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div>
          {orders.map((order) => (
            <Card key={order._id} className="mb-3">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Order #{order._id.slice(-8)}</strong>
                  <Badge bg="primary" className="ms-2">{order.status}</Badge>
                </div>
                <div>
                  <strong>Total: ${order.total}</strong>
                  <small className="text-muted ms-2">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </Card.Header>
              <Card.Body>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.product?.name || 'Product removed'}</td>
                        <td>{item.quantity}</td>
                        <td>${item.product?.price || 0}</td>
                        <td>${(item.product?.price || 0) * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};

export default OrderHistory;

