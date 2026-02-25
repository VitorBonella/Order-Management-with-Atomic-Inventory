import { useEffect, useState } from "react";
import { getProducts, createOrder } from "../services/orderService";
import { useCart } from "../context/CartContext";
import { getQueue, saveQueue, addToQueue } from "../services/offlineQueue";
import "./Home.css";

function Home() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [stockErrors, setStockErrors] = useState([]);
    const { cart, addToCart, removeOneFromCart, removeFromCart, clearCart } = useCart();

    // load produtos
    useEffect(() => {
        async function loadProducts() {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (err) {
                console.error("Erro ao carregar produtos:", err);
            }
        }

        loadProducts();
    }, []);

    //  processamento da fila
    useEffect(() => {
        async function processQueue() {
            const queue = getQueue();
            if (queue.length === 0) return;

            const remaining = [];

            for (const item of queue) {
                try {
                    await createOrder(item.order);
                    console.log("Pedido da fila enviado:", item.id);
                } catch (err) {
                    // ❗ Conflito tardio (estoque)
                    if (err.response?.data?.stock_errors) {
                        alert(
                            `Pedido offline (${item.id}) falhou por falta de estoque.`
                        );
                    } else {
                        // Ainda offline → mantém na fila
                        remaining.push(item);
                    }
                }
            }

            saveQueue(remaining);
        }

        window.addEventListener("online", processQueue);

        return () => {
            window.removeEventListener("online", processQueue);
        };
    }, []);

    // checkout
    async function handleCheckout() {
        if (cart.length === 0) return;

        try {
            setError(null);
            setSuccess(null);
            setStockErrors([]);

            const response = await createOrder(cart);

            if (response.data.success) {
                //alert("Pedido realizado com sucesso!");
                setSuccess("Pedido realizado com sucesso!")
                clearCart();
            }
        } catch (err) {
            // nwetwork error
            if (!err.response) {
                addToQueue({ id: Date.now(), order: cart });

                alert(
                    "Sem conexão. Pedido salvo na fila e será enviado automaticamente."
                );

                clearCart();
                return;
            }

            // backend error
            const data = err.response?.data;

            if (data?.stock_errors) {
                setError(data.error);
                setStockErrors(data.stock_errors);
            } else {
                setError(data?.error || "Erro inesperado");
            }
        }
    }

    return (
        <div className="container">
            <div className="header">🍔 Takeat Orders</div>

            <div className="layout">
                {/* CARDAPIO */}
                <div className="card">
                    <h2>Cardápio</h2>

                    <div className="product-grid">
                        {products.map((product) => (
                            <div key={product.id} className="product-card">
                                {product.image_emoji}<h3>{product.name}</h3>
                                <p>{product.description}</p>

                                <button
                                    className="button"
                                    onClick={() => addToCart(product)}
                                >
                                    Adicionar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CARRINHO */}
                <div className="card">
                    <h2>Carrinho</h2>

                    {cart.length === 0 && <p>Carrinho vazio</p>}

                    {cart.map((item) => (
                        <div key={item.id} className="cart-item">
                            <span>
                                {item.name} x{item.quantity}
                            </span>

                            <div className="cart-actions">
                                <button
                                    className="remove-btn"
                                    onClick={() => removeOneFromCart(item.id)}
                                >
                                    ➖
                                </button>

                                <button
                                    className="remove-btn danger"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    ❌
                                </button>
                            </div>
                        </div>
                    ))}

                    {cart.length > 0 && (
                        <button
                            className="button checkout-btn"
                            onClick={handleCheckout}
                        >
                            Finalizar Pedido
                        </button>
                    )}

                    {success && (
                        <div className="success-box">
                            <strong>{success}</strong>
                        </div>
                    )}

                    {error && (
                        <div className="error-box">
                            <strong>{error}</strong>

                            {stockErrors.length > 0 && (
                                <ul className="error-list">
                                    {stockErrors.map((item) => (
                                        <li key={item.input_id}>
                                            {item.input_name} — disponível:{" "}
                                            {item.available} | necessário:{" "}
                                            {item.needed}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;