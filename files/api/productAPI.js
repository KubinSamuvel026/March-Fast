import axiosClient from '../axiosClient.js'

export async function getProducts(params = {}) {
  const response = await axiosClient.get('/products/', { params })
  // Backend returns { success, message, data: { products: [...] } }
  const payload = response.data
  const data = payload?.data

  return (
    data?.products ||
    payload?.results ||
    data?.results ||
    data ||
    []
  )
}

export async function getProductById(id) {
  const response = await axiosClient.get(`/products/${id}/`)
  return response.data?.data
}
