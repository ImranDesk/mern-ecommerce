import React, { useState, useEffect } from 'react';
import { Toast as BSToast, ToastContainer } from 'react-bootstrap';

let toastId = 0;
const toastListeners = [];

export const showToast = (message, variant = 'success') => {
  const id = toastId++;
  toastListeners.forEach(listener => listener({ id, message, variant }));
};

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = (toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 3000);
    };
    toastListeners.push(listener);
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) toastListeners.splice(index, 1);
    };
  }, []);

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
      {toasts.map(toast => (
        <BSToast key={toast.id} bg={toast.variant} show={true} autohide>
          <BSToast.Header>
            <strong className="me-auto">
              {toast.variant === 'success' ? 'Success' : 
               toast.variant === 'danger' ? 'Error' : 
               toast.variant === 'warning' ? 'Warning' : 'Info'}
            </strong>
          </BSToast.Header>
          <BSToast.Body>{toast.message}</BSToast.Body>
        </BSToast>
      ))}
    </ToastContainer>
  );
};

export default Toast;

