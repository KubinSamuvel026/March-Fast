import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SettingsPage = ({ showToast }) => {
  const [activeSection, setActiveSection] = useState('details');
  const [vendor, setVendor] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Colors
  const C = {
    primary: "#FF6B35",
    bg: "#FAFAFA",
    border: "#E5E5E5",
    text: "#1A1A1A",
    muted: "#666",
  };

  useEffect(() => {
    fetchVendorDetails();
  }, []);

  const fetchVendorDetails = async () => {
    try {
      const token = localStorage.getItem('vendor_token');
      const response = await axios.get('/api/vendor/profile/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendor(response.data);
    } catch (error) {
      showToast('Failed to load vendor details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateVendorDetails = async (data) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('vendor_token');
      await axios.patch('/api/vendor/profile/', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Settings updated successfully', 'success');
      fetchVendorDetails();
    } catch (error) {
      showToast('Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'details', label: 'Vendor Details', icon: '🏪' },
    { id: 'auth', label: 'Authentication', icon: '🔐' },
    { id: 'footer', label: 'Footer Settings', icon: '📄' },
    { id: 'products', label: 'Product Settings', icon: '📦' },
    { id: 'analytics', label: 'Analytics & Data', icon: '📊' },
  ];

  const isMobile = window.innerWidth < 768;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 24 }}>
      {/* Sidebar Navigation */}
      <div style={{
        width: isMobile ? '100%' : '250px',
        background: 'white',
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 20,
        height: 'fit-content'
      }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 600 }}>Settings</h3>
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              border: 'none',
              borderRadius: 8,
              background: activeSection === section.id ? '#FFF3EE' : 'transparent',
              color: activeSection === section.id ? C.primary : C.text,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              marginBottom: 4,
              textAlign: 'left'
            }}
          >
            <span>{section.icon}</span>
            {section.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, background: 'white', border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
        {activeSection === 'details' && <VendorDetailsSection vendor={vendor} onSave={updateVendorDetails} saving={saving} />}
        {activeSection === 'auth' && <AuthSection onSave={updateVendorDetails} saving={saving} showToast={showToast} />}
        {activeSection === 'footer' && <FooterSection vendor={vendor} onSave={updateVendorDetails} saving={saving} />}
        {activeSection === 'products' && <ProductSettingsSection vendor={vendor} onSave={updateVendorDetails} saving={saving} />}
        {activeSection === 'analytics' && <AnalyticsSection vendor={vendor} onSave={updateVendorDetails} saving={saving} />}
      </div>
    </div>
  );
};

// Vendor Details Section
const VendorDetailsSection = ({ vendor, onSave, saving }) => {
  const [formData, setFormData] = useState({
    store_name: vendor.store_name || '',
    description: vendor.description || '',
    email: vendor.email || '',
    phone: vendor.phone || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 24px 0', fontSize: 24, fontWeight: 600 }}>Vendor Details</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Store Name</label>
          <input
            type="text"
            value={formData.store_name}
            onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
            style={{ width: '100%', padding: '12px', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 14 }}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{ width: '100%', padding: '12px', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 14, minHeight: 100 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ width: '100%', padding: '12px', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 14 }}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            style={{ width: '100%', padding: '12px', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 14 }}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '12px 24px',
            background: '#FF6B35',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

// Auth Section
const AuthSection = ({ onSave, saving, showToast }) => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      showToast('Passwords do not match', 'error');
      return;
    }
    onSave({ password: formData.new_password });
    setFormData({ current_password: '', new_password: '', confirm_password: '' });
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 24px 0', fontSize: 24, fontWeight: 600 }}>Change Password</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Current Password</label>
          <input
            type="password"
            value={formData.current_password}
            onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
            style={{ width: '100%', padding: '12px', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 14 }}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>New Password</label>
          <input
            type="password"
            value={formData.new_password}
            onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
            style={{ width: '100%', padding: '12px', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 14 }}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Confirm New Password</label>
          <input
            type="password"
            value={formData.confirm_password}
            onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
            style={{ width: '100%', padding: '12px', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 14 }}
            required
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '12px 24px',
            background: '#FF6B35',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1
          }}
        >
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

// Footer Section
const FooterSection = ({ vendor, onSave, saving }) => {
  const [formData, setFormData] = useState({
    footer_text: vendor.footer_text || '',
    social_links: vendor.social_links || { facebook: '', twitter: '', instagram: '' },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 24px 0', fontSize: 24, fontWeight: 600 }}>Footer Settings</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Footer Text</label>
          <textarea
            value={formData.footer_text}
            onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
            style={{ width: '100%', padding: '12px', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 14, minHeight: 80 }}
            placeholder="Enter footer text..."
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Social Links</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="url"
              placeholder="Facebook URL"
              value={formData.social_links.facebook}
              onChange={(e) => setFormData({
                ...formData,
                social_links: { ...formData.social_links, facebook: e.target.value }
              })}
              style={{ width: '100%', padding: '12px', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 14 }}
            />
            <input
              type="url"
              placeholder="Twitter URL"
              value={formData.social_links.twitter}
              onChange={(e) => setFormData({
                ...formData,
                social_links: { ...formData.social_links, twitter: e.target.value }
              })}
              style={{ width: '100%', padding: '12px', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 14 }}
            />
            <input
              type="url"
              placeholder="Instagram URL"
              value={formData.social_links.instagram}
              onChange={(e) => setFormData({
                ...formData,
                social_links: { ...formData.social_links, instagram: e.target.value }
              })}
              style={{ width: '100%', padding: '12px', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 14 }}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '12px 24px',
            background: '#FF6B35',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

// Product Settings Section
const ProductSettingsSection = ({ vendor, onSave, saving }) => {
  const [formData, setFormData] = useState({
    auto_publish: vendor.auto_publish || false,
    low_stock_alert: vendor.low_stock_alert || 5,
    default_category: vendor.default_category || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 24px 0', fontSize: 24, fontWeight: 600 }}>Product Settings</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={formData.auto_publish}
              onChange={(e) => setFormData({ ...formData, auto_publish: e.target.checked })}
            />
            Auto-publish new products
          </label>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Low Stock Alert Threshold</label>
          <input
            type="number"
            value={formData.low_stock_alert}
            onChange={(e) => setFormData({ ...formData, low_stock_alert: parseInt(e.target.value) })}
            style={{ width: '100%', padding: '12px', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 14 }}
            min="0"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Default Category</label>
          <input
            type="text"
            value={formData.default_category}
            onChange={(e) => setFormData({ ...formData, default_category: e.target.value })}
            style={{ width: '100%', padding: '12px', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 14 }}
            placeholder="e.g., General"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '12px 24px',
            background: '#FF6B35',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

// Analytics Section
const AnalyticsSection = ({ vendor, onSave, saving }) => {
  const [formData, setFormData] = useState({
    analytics_enabled: vendor.analytics_enabled || true,
    data_retention_days: vendor.data_retention_days || 365,
    export_format: vendor.export_format || 'csv',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 24px 0', fontSize: 24, fontWeight: 600 }}>Analytics & Data Settings</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={formData.analytics_enabled}
              onChange={(e) => setFormData({ ...formData, analytics_enabled: e.target.checked })}
            />
            Enable analytics tracking
          </label>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Data Retention (days)</label>
          <input
            type="number"
            value={formData.data_retention_days}
            onChange={(e) => setFormData({ ...formData, data_retention_days: parseInt(e.target.value) })}
            style={{ width: '100%', padding: '12px', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 14 }}
            min="30"
            max="3650"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Export Format</label>
          <select
            value={formData.export_format}
            onChange={(e) => setFormData({ ...formData, export_format: e.target.value })}
            style={{ width: '100%', padding: '12px', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 14 }}
          >
            <option value="csv">CSV</option>
            <option value="xlsx">Excel</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '12px 24px',
            background: '#FF6B35',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;