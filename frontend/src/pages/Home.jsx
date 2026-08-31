import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import './Home.css';
import qrImage from '../assets/data/qrcode_cropped.jpeg';


// Import all images from the data folder dynamically as a fallback
const imageModules = import.meta.glob('../assets/data/*.{jpg,jpeg,png,webp}', { eager: true });
const allImages = Object.values(imageModules).map(mod => mod.default);

// Parse image paths properly since they come from backend (e.g. /uploads/file.jpg)
const getImageUrl = (img) => {
  if (typeof img === 'string') {
    if (img.startsWith('/uploads')) {
      return `https://client-projects-backend.onrender.com${img}`;
    }
    // Optimize Cloudinary images automatically for much faster loading
    if (img.includes('res.cloudinary.com') && !img.includes('q_auto')) {
      return img.replace('/upload/', '/upload/q_auto,f_auto/');
    }
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
  const [loadingProducts, setLoadingProducts] = useState(true);
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

  // Cart & Checkout State
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Cart, 2: Payment/QR, 3: Bill
  const [orderId, setOrderId] = useState(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);

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
      const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : '';
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      await axios.post('https://client-projects-backend.onrender.com/api/enquiries', {
        ...enquiryForm,
        product: selectedProductId
      }, config);
      alert('Your enquiry has been submitted successfully! We will contact you soon.');
      setShowEnquiryModal(false);
      setEnquiryForm({ name: '', email: '', contactNumber: '', address: '', quantity: 1, message: '' });
    } catch (err) {
      console.error('Failed to submit enquiry', err);
      alert('Error submitting enquiry. Please try again.');
    }
  };

  const handleShopNow = (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const existing = cart.find(item => item.product === product._id);
    if (existing) {
      setCart(cart.map(item => item.product === product._id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { 
        product: product._id, 
        name: product.name, 
        packSize: product.quantity || '1 Pc',
        price: product.price || 0, 
        qty: 1, 
        image: product.images?.[0] || product.image || '/uploads/default.jpg' 
      }]);
    }
    setShowCartModal(true);
    setCheckoutStep(1);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product !== productId));
  };

  const updateCartQty = (productId, newQty) => {
    if (newQty < 1) return;
    setCart(cart.map(item => item.product === productId ? { ...item, qty: newQty } : item));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const confirmOrder = async () => {
    try {
      if (!paymentScreenshot) {
        alert('Please upload a screenshot of your payment.');
        return;
      }
      const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : '';
      const config = token ? { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } } : { headers: { 'Content-Type': 'multipart/form-data' } };
      
      const formData = new FormData();
      formData.append('orderItems', JSON.stringify(cart));
      formData.append('totalPrice', cartTotal);
      formData.append('screenshot', paymentScreenshot);
      
      const res = await axios.post('https://client-projects-backend.onrender.com/api/orders', formData, config);
      
      setOrderId(res.data._id);
      setCheckoutStep(3); // Move to bill generation
      // Do not clear cart here, clear it when modal is closed so the bill can use it.
    } catch (err) {
      console.error('Failed to submit order', err);
      alert('Error submitting order.');
    }
  };

  const printBill = () => {
    window.print();
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const { data } = await axios.get('https://client-projects-backend.onrender.com/api/products');
        
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
        const uniqueCategories = [...new Set(data.map(item => item.category || 'Other Products'))];
        setCategories(['All Products', ...uniqueCategories]);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
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
        {loadingProducts ? (
          <div style={{ textAlign: 'center', padding: '100px 20px', width: '100%', color: '#555' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Loading Products... ⏳</h3>
            <p>Please wait a moment</p>
          </div>
        ) : (
          categories.map(category => (
            <div key={category} className="category-block">
              <h2 className="category-title">{category}</h2>
              <div className="products-grid">
                {products.filter(p => category === 'All Products' ? true : (p.category || 'Other Products') === category).map(product => (
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
                      <h3 className="product-name" style={{fontWeight: 'bold', fontSize: '1.2rem'}}>{product.name}</h3>
                      <p className="product-qty" style={{fontWeight: '600', color: '#555', margin: '5px 0'}}>{product.quantity || '250gm'}</p>
                      <p className="product-price" style={{fontWeight: 'normal', color: '#2ecc71', fontSize: '1.1rem', marginBottom: '15px'}}>₹{product.price || 0}</p>
                      
                      <div style={{display: 'flex', gap: '10px', width: '100%'}}>
                        <button className="enquiry-btn" style={{flex: 1}} onClick={() => handleEnquire(product._id)}>Enquire</button>
                        <button className="shop-now-btn" style={{flex: 1, backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}} onClick={() => handleShopNow(product)}>Shop Now</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
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
                <button type="button" className="cancel-btn" onClick={() => setShowEnquiryModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Submit Enquiry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cart & Checkout Modal */}
      {showCartModal && (
        <div className="enquiry-modal-backdrop">
          <div className="enquiry-modal" style={{maxWidth: '600px', width: '90%'}}>
            {checkoutStep === 1 && (
              <>
                <h2>Your Cart</h2>
                {cart.length === 0 ? (
                  <p>Your cart is empty.</p>
                ) : (
                  <div className="cart-items" style={{maxHeight: '300px', overflowY: 'auto', marginBottom: '20px'}}>
                    {cart.map(item => (
                      <div key={item.product} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '10px 0'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                          <img src={getImageUrl(item.image)} alt={item.name} style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px'}} />
                          <div>
                            <h4 style={{margin: 0}}>{item.name} <small style={{color: '#777', fontWeight: 'normal'}}>({item.packSize})</small></h4>
                            <p style={{margin: 0, color: '#2ecc71'}}>₹{item.price}</p>
                          </div>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                          <button onClick={() => updateCartQty(item.product, item.qty - 1)} style={{padding: '2px 8px'}}>-</button>
                          <span>{item.qty}</span>
                          <button onClick={() => updateCartQty(item.product, item.qty + 1)} style={{padding: '2px 8px'}}>+</button>
                          <button onClick={() => removeFromCart(item.product)} style={{background: 'red', color: 'white', border: 'none', borderRadius: '3px', padding: '4px 8px', marginLeft: '10px'}}>X</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {cart.length > 0 && (
                  <div style={{textAlign: 'right', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px'}}>
                    Total: ₹{cartTotal}
                  </div>
                )}
                <div className="enquiry-modal-footer">
                  <button type="button" className="cancel-btn" onClick={() => setShowCartModal(false)}>Close</button>
                  {cart.length > 0 && (
                    <button type="button" className="submit-btn" onClick={() => setCheckoutStep(2)}>Checkout</button>
                  )}
                </div>
              </>
            )}

            {checkoutStep === 2 && (
              <>
                <h2>Payment (QR Code)</h2>
                <p>Please scan the QR code below to pay the total amount of <strong>₹{cartTotal}</strong>.</p>
                <div style={{textAlign: 'center', margin: '20px 0'}}>
                  <div style={{width: '250px', height: '250px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}}>
                    <img src={qrImage} alt="UPI QR Code" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  </div>
                </div>
                <div style={{margin: '20px 0'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Upload Payment Screenshot *</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setPaymentScreenshot(e.target.files[0])}
                    style={{width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}}
                  />
                  {paymentScreenshot && <p style={{color: '#2ecc71', marginTop: '5px', fontSize: '0.9rem'}}>Screenshot selected: {paymentScreenshot.name}</p>}
                </div>
                <div className="enquiry-modal-footer">
                  <button type="button" className="cancel-btn" onClick={() => setCheckoutStep(1)}>Back to Cart</button>
                  <button type="button" className="submit-btn" onClick={confirmOrder}>I Have Paid (Confirm Order)</button>
                </div>
              </>
            )}

            {checkoutStep === 3 && (
              <div className="bill-container" id="printable-bill">
                <h2 style={{textAlign: 'center', color: '#2ecc71'}}>Order Successful!</h2>
                <div style={{border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginTop: '20px', background: '#fff'}}>
                  <h3 style={{textAlign: 'center', margin: '0 0 20px 0'}}>THE MARWADI - INVOICE</h3>
                  <p><strong>Order ID:</strong> {orderId}</p>
                  <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                  <p><strong>Customer:</strong> {user?.name}</p>
                  <hr style={{margin: '15px 0'}} />
                  <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
                    <thead>
                      <tr style={{borderBottom: '2px solid #eee'}}>
                        <th style={{paddingBottom: '10px'}}>Item</th>
                        <th style={{paddingBottom: '10px'}}>Qty</th>
                        <th style={{paddingBottom: '10px', textAlign: 'right'}}>Price</th>
                        <th style={{paddingBottom: '10px', textAlign: 'right'}}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{padding: '5px 0'}}>{item.name} <small>({item.packSize})</small></td>
                          <td style={{padding: '5px 0'}}>{item.qty}</td>
                          <td style={{padding: '5px 0', textAlign: 'right'}}>₹{item.price}</td>
                          <td style={{padding: '5px 0', textAlign: 'right'}}>₹{item.price * item.qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{textAlign: 'right', marginTop: '10px', fontSize: '1.2rem', fontWeight: 'bold'}}>
                    Grand Total: ₹{cartTotal}
                  </div>
                  <p style={{textAlign: 'center', marginTop: '20px'}}>Please print this bill and keep it for your records. The admin will verify your payment shortly.</p>
                </div>
                <div className="enquiry-modal-footer" style={{marginTop: '20px'}}>
                  <button type="button" className="cancel-btn" onClick={() => { setShowCartModal(false); setCart([]); }}>Close</button>
                  <button type="button" className="submit-btn" onClick={printBill}>Download / Print Bill</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
