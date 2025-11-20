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
    <Container>
      <h1 className="mb-4">Your Cart</h1>
      {items && items.length > 0 ? (
        <>
          <Card className="mb-4">
            <Card.Body>
              {items.map((item) => (
                <CartItem
                  key={item.product?._id || item._id}
                  item={item}
                />
              ))}
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Total: <span className="text-primary">${total.toFixed(2)}</span></h3>
                <Button 
                  onClick={placeOrder} 
                  disabled={placingOrder || items.length === 0}
                  size="lg"
                  variant="success"
                >
                  {placingOrder ? "Placing Order..." : "Place Order"}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </>
      ) : (
        <Card>
          <Card.Body className="text-center py-5">
            <p className="text-muted mb-4">Your cart is empty</p>
            <Button variant="primary" onClick={() => navigate("/")}>
              Start Shopping
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Cart;
