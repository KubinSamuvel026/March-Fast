import axiosClient from '../axiosClient.js'

/**
 * Create orders for the provided cart items.
 *
 * The backend API currently supports creating a single order per request.
 * We therefore create one order per line item and return the list of created orders.
 */
export async function submitCheckout({ customer_name, email, phone, shipping_address, city, postal_code, payment_method, items = [], total_amount }) {
  const createdOrders = []

  for (const item of items) {
    const productId = item.product?.id || item.product_id
    const quantity = item.quantity || 1
    const amount = (parseFloat(item.product?.price || item.price || 0) * quantity).toFixed(2)

    const payload = {
      product: productId,
      customer_name,
      customer_email: email,
      quantity,
      amount,
      // Optional: include customer notes if needed.
      notes: `Shipping: ${shipping_address}, ${city} ${postal_code} | Phone: ${phone} | Payment: ${payment_method}`,
    }

    const response = await axiosClient.post('/orders/', payload)
    // Response is expected to be in the form { success: true, data: { ... } }
    createdOrders.push(response.data?.data)
  }

  const firstOrder = createdOrders[0] || {}

  return {
    orders: createdOrders,
    items,
    total_amount,
    customer_name,
    payment_method,
    order_id: firstOrder.order_id || firstOrder.id,
    created_at: firstOrder.created_at,
  }
}
