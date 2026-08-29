import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import './Home.css';

// Import all images from the data folder dynamically as a fallback
const imageModules = import.meta.glob('../assets/data/*.{jpg,jpeg,png,webp}', { eager: true });
const allImages = Object.values(imageModules).map(mod => mod.default);

// Parse image paths properly since they come from backend (e.g. /uploads/file.jpg)
const getImageUrl = (img) => {
  if (typeof img === 'string' && img.startsWith('/uploads')) {
    return `http://localhost:5000${img}`;
  }
  return img;
};

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  if (!images || images.length === 0) {
    return <div className="product-image-placeholder">No Image</div>;
  }

  return (
    <div className="image-slider">
        <img src={getImageUrl(images[currentIndex])} alt={`Slide ${currentIndex}`} className="slider-image" />
      {images.length > 1 && (
        <>
          <button className="slider-btn prev" onClick={prevSlide}>&lt;</button>
          <button className="slider-btn next" onClick={nextSlide}>&gt;</button>
          <div className="slider-dots">
            {images.map((_, idx) => (
              <span key={idx} className={`dot ${idx === currentIndex ? 'active' : ''}`}></span>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Modal State
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    contactNumber: '',
    address: '',
    quantity: 1,
    message: ''
  });

  const handleEnquire = (productId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedProductId(productId);
    setShowEnquiryModal(true);
  };

  const handleEnquiryChange = (e) => {
    setEnquiryForm({ ...enquiryForm, [e.target.name]: e.target.value });
  };

  const submitEnquiry = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/enquiries', {
        ...enquiryForm,
        product: selectedProductId
      });
      alert('Your enquiry has been submitted successfully! We will contact you soon.');
      setShowEnquiryModal(false);
      setEnquiryForm({ name: '', email: '', contactNumber: '', address: '', quantity: 1, message: '' });
    } catch (err) {
      console.error('Failed to submit enquiry', err);
      alert('Error submitting enquiry. Please try again.');
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/products');
        
        // Map data to ensure it always has images (fallback to local assets if DB is empty)
        const productsWithFallback = data.map((p, index) => {
          if (p.images && p.images.length > 0) {
            return p; // Has real multiple images
          }
          if (p.image && !p.image.includes('default')) {
            // Has real single legacy image
            return { ...p, images: [p.image] }; 
          }
          // Needs fallback local images
          const startIndex = (index * 2) % allImages.length;
          const endIndex = startIndex + 2 > allImages.length ? allImages.length : startIndex + 2;
          return {
            ...p,
            images: allImages.slice(startIndex, endIndex)
          };
        });

        setProducts(productsWithFallback);
        const uniqueCategories = [...new Set(data.map(item => item.category))];
        setCategories(['All', ...uniqueCategories]);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="home-container">
      <div className="hero-section">
        {/* The text is now baked directly into the background image (hero-banner.jpg) */}
      </div>

      <div className="categories-section">
        {categories.map(category => (
          <div key={category} className="category-block">
            <h2 className="category-title">{category}</h2>
            <div className="products-grid">
              {products.filter(p => p.category === category).map(product => (
                <div key={product._id} className="product-card">
                  {product.images && product.images.length > 1 ? (
                    <ImageSlider images={product.images} />
                  ) : (
                    <img 
                      src={getImageUrl(product.images?.[0] || product.image || '/uploads/default.jpg')} 
                      alt={product.name} 
                      className="product-image" 
                    />
                  )}
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-desc">{product.description}</p>
                    <button className="enquiry-btn" onClick={() => handleEnquire(product._id)}>Enquire Now</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Enquiry Modal */}
      {showEnquiryModal && (
        <div className="enquiry-modal-backdrop">
          <div className="enquiry-modal">
            <h2>Detailed Enquiry Form</h2>
            <p>Please fill out your details so we can get back to you with the best quote.</p>
            <form onSubmit={submitEnquiry} className="enquiry-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="name" value={enquiryForm.name} onChange={handleEnquiryChange} required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={enquiryForm.email} onChange={handleEnquiryChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Number</label>
                  <input type="text" name="contactNumber" value={enquiryForm.contactNumber} onChange={handleEnquiryChange} required />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" name="quantity" min="1" value={enquiryForm.quantity} onChange={handleEnquiryChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Complete Delivery Address</label>
                <textarea name="address" rows="2" value={enquiryForm.address} onChange={handleEnquiryChange} required placeholder="Full address including pincode"></textarea>
              </div>
              <div className="form-group">
                <label>Message / Special Requirements</label>
                <textarea name="message" rows="3" value={enquiryForm.message} onChange={handleEnquiryChange} required></textarea>
              </div>
              <div className="enquiry-modal-footer">
  