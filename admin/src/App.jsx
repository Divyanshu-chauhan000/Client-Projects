import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', category: '', description: '' });
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchEnquiries();
  }, []);

  const fetchProducts = () => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching products:', err));
  };

  const fetchEnquiries = () => {
    fetch('http://localhost:5000/api/enquiries')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEnquiries(data);
        } else {
          console.warn('Could not fetch enquiries:', data.message);
          setEnquiries([]);
        }
      })
      .catch(err => {
        console.error('Error fetching enquiries:', err);
        setEnquiries([]);
      });
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ name: product.name, category: product.category, description: product.description });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', category: '', description: '' });
    }
    setSelectedImages([]);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ name: '', category: '', description: '' });
    setSelectedImages([]);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setSelectedImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingProduct && selectedImages.length === 0) {
      return alert('Please select at least one image for the new product.');
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('description', formData.description);
    
    selectedImages.forEach((file) => {
      data.append('images', file);
    });

    const url = editingProduct 
      ? `http://localhost:5000/api/products/${editingProduct._id}` 
      : 'http://localhost:5000/api/products';
    
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, body: data });
      if (res.ok) {
        alert(`Product ${editingProduct ? 'updated' : 'added'} successfully!`);
        handleCloseModal();
        fetchProducts();
      } else {
        alert('Operation failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>THE MARWADI</h2>
          <span>Admin Workspace</span>
        </div>
        <ul className="sidebar-menu">
          <li className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
            <span className="icon">📦</span> Products
          </li>
          <li className={activeTab === 'enquiries' ? 'active' : ''} onClick={() => setActiveTab('enquiries')}>
            <span className="icon">💬</span> Enquiries
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <h1>{activeTab === 'products' ? 'Product Management' : 'Customer Enquiries'}</h1>
          <div className="topbar-user">
            <span className="avatar">A</span>
            <span>Admin User</span>
          </div>
        </header>

        <div className="dashboard-content">
          {activeTab === 'products' && (
            <>
              <div className="content-header">
                <h3>All Products ({products.length})</h3>
                <button className="primary-btn" onClick={() => handleOpenModal()}>+ Add New Product</button>
              </div>
              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p._id}>
                        <td>
                          <div className="tbl-img-placeholder">
                            {p.images && p.images.length > 0 
                              ? <img src={`http://localhost:5000${p.images[0]}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                              : p.image 
                                ? <img src={`http://localhost:5000${p.image}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                : 'IMG'}
                          </div>
                        </td>
                        <td className="fw-bold">{p.name}</td>
                        <td><span className="badge">{p.category}</span></td>
                        <td className="text-muted">{p.description?.substring(0, 40)}...</td>
                        <td>
                          <button className="action-btn edit" onClick={() => handleOpenModal(p)}>Edit</button>
                          <button className="action-btn delete" onClick={() => handleDelete(p._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'enquiries' && (
            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Product Interest</th>
                    <th>Message</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.length === 0 ? (
                    <tr><td colSpan="6" className="text-center">No enquiries yet.</td></tr>
                  ) : (
                    enquiries.map(e => (
                      <tr key={e._id}>
                        <td className="fw-bold">{e.name || (e.user && e.user.name) || 'Guest'}</td>
                        <td>{e.email || (e.user && e.user.email) || 'No Email'}</td>
                        <td>{e.contactNumber || 'N/A'}</td>
                        <td>{e.product ? e.product.name : 'General'} (Qty: {e.quantity || 1})</td>
                        <td className="text-muted">{e.message}</td>
                        <td>{new Date(e.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Product Form Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} required placeholder="e.g. Premium Makana" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input type="text" name="category" value={formData.category} onChange={handleFormChange} required placeholder="e.g. Makana" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleFormChange} required rows="3" placeholder="Product details..."></textarea>
              </div>
              <div className="form-group">
                <label>{editingProduct ? 'Update Images (Optional)' : 'Upload Images'}</label>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="file-input" />
                <small className="text-muted" style={{ display: 'block', marginTop: '5px' }}>You can select multiple files.</small>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="primary-btn">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
