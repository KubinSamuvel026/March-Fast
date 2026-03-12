import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { loginUser } from './api/authAPI.js'
import toast from 'react-hot-toast'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const data = await loginUser({ email, password })
            localStorage.setItem('token', data.access || data.token) // Support both access and token keys
            toast.success('Login successful!')

            // Navigate back to where they came from or home
            const from = location.state?.from?.pathname || '/'
            navigate(from, { replace: true })

            // Refresh the page to ensure context loads with token (optional but helps with simple setups)
            window.location.reload()
        } catch (error) {
            toast.error(error.friendlyMessage || 'Invalid credentials. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="auth-page fade-in" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="container" style={{ maxWidth: '480px', width: '100%' }}>
                <div style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '18px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                    border: '1px solid #E5E7EB'
                }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#111827', textAlign: 'center' }}>
                        Welcome Back
                    </h1>
                    <p style={{ color: '#6B7280', textAlign: 'center', marginBottom: '32px' }}>
                        Enter your credentials to access your account.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-amber"
                            disabled={loading}
                            style={{ padding: '12px', fontSize: '16px', marginTop: '10px' }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '24px', color: '#6B7280', fontSize: '14px' }}>
                        Don't have an account? <Link to="/register" style={{ color: '#FF6B35', fontWeight: '600' }}>Register here</Link>
                    </p>
                </div>
            </div>
        </main>
    )
}
