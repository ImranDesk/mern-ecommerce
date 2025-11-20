import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loading = ({ size = 'lg', className = '' }) => {
  return (
    <div className={`d-flex justify-content-center align-items-center ${className}`} style={{ minHeight: '200px' }}>
      <Spinner animation="border" role="status" size={size}>
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};

export default Loading;

