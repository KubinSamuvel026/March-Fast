import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from './api/authAPI.js'
import toast from 'react-hot-toast'

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: ''
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrors({})

        if (formData.password !== formData.password2) {
            toast.error('Passwords do not match')
            return
        }

        setLoading(true)

        try {
            const cleanValue = (value) =>
                String(value ?? '').trim().replace(/^['"]|['"]$/g, '')

            const payload = {
                username: String(formData.username).trim(),
                email: String(formData.email).trim(),
                password: cleanValue(formData.password),
                password_confirm: cleanValue(formData.password2),
            }

            console.log('Register payload:', payload)
            await registerUser(payload)
            toast.success('Registration successful! Please login.')
            navigate('/login')
        } catch (err) {
            toast.error('Registration failed. Please check errors.')
            console.error('Register error:', err.response?.data)
            setErrors(err.response?.data?.errors || {})
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        let { name, value } = e.target
        if (name === 'password' || name === 'password2') {
            value = String(value).replace(/^['"]|['"]$/g, '')
        }
        setFormData({ ...formData, [name]: value })
    }

    return (
        <main className="auth-page fade-in" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
            <div className="container" style={{ maxWidth: '480px', width: '100%' }}>
                <div style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '18px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                    border: '1px solid #E5E7EB'
                }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#111827', textAlign: 'center' }}>
                        Create an Account
                    </h1>
                    <p style={{ color: '#6B7280', textAlign: 'center', marginBottom: '32px' }}>
                        Join MarchFast to manage your cart and wishlists.
                    </p>

                    {errors && Object.keys(errors).length > 0 && (
                        <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                {Object.entries(errors).flatMap(([field, msgs]) =>
                                    (Array.isArray(msgs) ? msgs : [msgs]).map((msg, i) => (
                                        <li key={`${field}-${i}`}>{msg}</li>
                                    ))
                                )}
                            </ul>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                name="username"
                                className="form-input"
                                placeholder="johndoe"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                name="password2"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.password2}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-amber"
                            disabled={loading}
                            style={{ padding: '12px', fontSize: '16px', marginTop: '10px' }}
                        >
                            {loading ? 'Creating Account...' : 'Register'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '24px', color: '#6B7280', fontSize: '14px' }}>
                        Already have an account? <Link to="/login" style={{ color: '#FF6B35', fontWeight: '600' }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </main>
    )
}
