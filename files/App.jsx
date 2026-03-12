import { Routes, Route } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import HomePage from './HomePage.jsx'
import ProductsPage from './ProductsPage.jsx'
import ProductDetailPage from './ProductDetailPage.jsx'
import CartPage from './CartPage.jsx'
import WishlistPage from './WishlistPage.jsx'
import CheckoutPage from './CheckoutPage.jsx'
import OrderSuccessPage from './OrderSuccessPage.jsx'
import LoginPage from './LoginPage.jsx'
import RegisterPage from './RegisterPage.jsx'

export default function App() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </div>
  )
}
