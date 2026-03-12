import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const { register, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    store_name: '',
    phone_number: '',
    account_holder_name: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');

    // Basic frontend validation to catch unmatched passwords early
    if (formData.password !== formData.password_confirm) {
      setErrors({ password: 'Passwords do not match' });
      return;
    }

    setLoading(true);

    const result = await register(formData);

    if (result.success) {
      // After successful registration, log them in automatically or redirect to login.
      // Attempting auto-login
      const loginResult = await login({ email: formData.email, password: formData.password });
      setLoading(false);

      if (loginResult.success) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } else {
      setLoading(false);
      // Expecting result.errors to map perfectly to field names due to DRF 400 responses
      if (result.errors) {
        if (typeof result.errors === 'object' && !Array.isArray(result.errors)) {
          setErrors(result.errors);
        } else {
          setGeneralError(JSON.stringify(result.errors));
        }
      } else {
        setGeneralError('Registration failed due to a network or server error.');
      }
    }
  };

  return (
    <div className="register-container" style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2>Register for MarchFast</h2>

      {generalError && <div style={{ color: 'red', marginBottom: '1rem' }}>{generalError}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label>Username *</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
          {errors.username && <small style={{ color: 'red' }}>{errors.username[0] || errors.username}</small>}
        </div>

        <div>
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
          {errors.email && <small style={{ color: 'red' }}>{errors.email[0] || errors.email}</small>}
        </div>

        <div>
          <label>Store Name</label>
          <input
            type="text"
            name="store_name"
            value={formData.store_name}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          />
          {errors.store_name && <small style={{ color: 'red' }}>{errors.store_name[0] || errors.store_name}</small>}
        </div>

        <div>
          <label>Phone Number</label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          />
          {errors.phone_number && <small style={{ color: 'red' }}>{errors.phone_number[0] || errors.phone_number}</small>}
        </div>

        <div>
          <label>Account Holder Name</label>
          <input
            type="text"
            name="account_holder_name"
            value={formData.account_holder_name}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          />
          {errors.account_holder_name && <small style={{ color: 'red' }}>{errors.account_holder_name[0] || errors.account_holder_name}</small>}
        </div>

        <div>
          <label>Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
          {errors.password && <small style={{ color: 'red' }}>{errors.password[0] || errors.password}</small>}
        </div>

        <div>
          <label>Confirm Password *</label>
          <input
            type="password"
            name="password_confirm"
            value={formData.password_confirm}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
          {errors.password_confirm && <small style={{ color: 'red' }}>{errors.password_confirm[0] || errors.password_confirm}</small>}
        </div>

        <button type="submit" disabled={loading} style={{ padding: '0.75rem', cursor: 'pointer', marginTop: '1rem' }}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;
