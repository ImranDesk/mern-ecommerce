import React, { useEffect, useState } from "react";
import { Button, Container, Card } from "react-bootstrap";
import api from "../api/axios";
import CartItem from "../components/CartItem";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/Toast";
import Loading from "../components/Loading";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCart, selectCartItems, selectCartLoading, selectCartTotal, clearCart } from "../store/slices/cartSlice";

const Cart = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const loading = useAppSelector(selectCartLoading);
  const total = useAppSelector(selectCartTotal);
  const [placingOrder, setPlacingOrder] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    dispatch(fetchCart());
  }, [dispatch, token, navigate]);

  const placeOrder = async () => {
    if (items.length === 0) {
      showToast("Your cart is empty", "warning");
      return;
    }
    try {
      setPlacingOrder(true);
      await api.post(
        "/api/orders",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Order placed successfully! Check your email.", "success");
      dispatch(clearCart());
      dispatch(fetchCart()); // Refresh cart
      setTimeout(() => navigate("/orders"), 2000);
    } catch (err) {
      showToast("Error placing order", "danger");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">Your Shopping Cart</h1>
        {items && items.length > 0 && (
          <span className="badge bg-primary fs-6 px-3 py-2">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>
      {items && items.length > 0 ? (
        <>
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body className="p-4">
              {items.map((item) => (
                <CartItem
                  key={item.product?._id || item._id}
                  item={item}
                />
              ))}
            </Card.Body>
          </Card>
          <Card className="border-0 shadow-lg">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h5 className="text-muted mb-2">Total Amount</h5>
                  <h2 className="fw-bold text-primary mb-0">${total.toFixed(2)}</h2>
                </div>
                <Button 
                  onClick={placeOrder} 
                  disabled={placingOrder || items.length === 0}
                  size="lg"
                  variant="success"
                  className="px-5"
                >
                  {placingOrder ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      🛒 Place Order
                    </>
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="empty-state py-5">
            <div className="empty-state-icon">🛒</div>
            <h3 className="mb-3">Your cart is empty</h3>
            <p className="text-muted mb-4">Looks like you haven't added anything to your cart yet</p>
            <Button variant="primary" size="lg" onClick={() => navigate("/")}>
              Start Shopping
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Cart;
