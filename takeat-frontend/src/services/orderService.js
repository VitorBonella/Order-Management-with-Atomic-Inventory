import api from "../api/api";

export async function getProducts() {
  const response = await api.get("/products");
  return response.data;
}

export async function createOrder(cart) {
  return api.post("/orders", {
    table_number: 1, // pode deixar fixo por enquanto
    items: cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity
    }))
  });
}