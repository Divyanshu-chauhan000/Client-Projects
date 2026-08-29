import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './MyEnquiries.css';

const getImageUrl = (img) => {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  return `https://client-projects-backend.onrender.com${img}`;
};

const MyEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : '';
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        const { data } = await axios.get('https://client-projects-backend.onrender.com/api/enquiries/myenquiries', config);
        setEnquiries(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching enquiries:', error);
        setLoading(false);
      }
    };
    
    if (user) {
      fetchEnquiries();
    }
  }, [user]);

  if (loading) return <div className="loading">Loading your enquiries...</div>;

  return (
    <div className="my-enquiries-container">
      <h2>My Enquiries</h2>
      {enquiries.length === 0 ? (
        <div className="no-enquiries">
          <p>You haven't made any enquiries yet.</p>
        </div>
      ) : (
        <div className="enquiries-list">
          {enquiries.map((enq) => (
            <div key={enq._id} className="enquiry-card">
              <div className="enquiry-header">
                <span className={`status-badge ${enq.status.toLowerCase()}`}>{enq.status}</span>
                <span className="enquiry-date">{new Date(enq.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="enquiry-body">
                {enq.product ? (
                  <div className="product-info-compact">
                    <h4>{enq.product.name}</h4>
                    <p>Quantity Requested: <strong>{enq.quantity}</strong></p>
                  </div>
                ) : (
                  <div className="product-info-compact">
                    <h4>General Enquiry</h4>
                  </div>
                )}
                <div className="enquiry-message">
                  <strong>Your Message:</strong>
                  <p>{enq.message}</p>
                </div>
                <div className="enquiry-address">
                  <strong>Delivery Address:</strong>
                  <p>{enq.address}</p>
                </div>
                {enq.adminNote && (
                  <div className="admin-reply">
                    <strong>Admin Reply:</strong>
                    <p>{enq.adminNote}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEnquiries;
