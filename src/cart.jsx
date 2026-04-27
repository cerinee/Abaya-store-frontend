import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./cart.css";

const BASE = "https://lyrine-store.onrender.com/api"; 

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const user  = JSON.parse(localStorage.getItem("user") || "null");

    useEffect(() => {
        if (!token || !user) { navigate("/signin"); return; }
        fetchCart();
    }, []);

    const fetchCart = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${BASE}/cart/${user._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch cart");
            const data = await res.json();
            setCartItems(data.products || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        setUpdatingId(productId);
        try {
            const res = await fetch(`${BASE}/cart/update`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ productId, quantity: newQuantity }),
            });
            if (!res.ok) throw new Error("Update failed");
            const data = await res.json();
            setCartItems(data.products || []);
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(""), 3000);
        } finally {
            setUpdatingId(null);
        }
    };

    const removeItem = async (productId) => {
        setUpdatingId(productId);
        try {
            const res = await fetch(`${BASE}/cart/remove/${productId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Remove failed");
            const data = await res.json();
            setCartItems(data.products || []);
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(""), 3000);
        } finally {
            setUpdatingId(null);
        }
    };

    const clearCart = async () => {
        if (!window.confirm("Are you sure you want to clear your cart?")) return;
        try {
            const res = await fetch(`${BASE}/cart/clear`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Clear cart failed");
            setCartItems([]);
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(""), 3000);
        }
    };

    const calculateTotal = () =>
        cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/signin");
    };

    return (
        <div className="cart-page">
            <div className="navbar">
                <h2 className="logo">LYRINE ABAYA</h2>
                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/Abayas">Abayas</Link>
                    <Link to="/Cart">Cart</Link>
                    <Link to="/order">Orders</Link>
                    {user ? (
                        <span className="signup-link" onClick={handleLogout} style={{ cursor: "pointer" }}>Logout</span>
                    ) : (
                        <Link to="/signin">Sign In</Link>
                    )}
                </div>
            </div>

            <div className="cart-container">
                <h1>Your Shopping Cart</h1>

                {error && <div className="error-message">{error}</div>}

                {loading && (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading your cart...</p>
                    </div>
                )}

                {!loading && !error && cartItems.length === 0 && (
                    <div className="empty-cart">
                        <p>Your cart is empty.</p>
                        <Link to="/Abayas" className="continue-shopping">Continue Shopping</Link>
                    </div>
                )}

                {!loading && cartItems.length > 0 && (
                    <>
                        <div className="cart-items">
                            {cartItems.map((item) => {
                                // productId is populated so it's an object with _id, name, image
                                const pid = item.productId?._id || item.productId;
                                const name  = item.productId?.name  || item.name  || "Product";
                                const image = item.productId?.image || item.image;
                                return (
                                    <div className="cart-item" key={pid}>
                                        <div className="item-image">
                                            <img
                                                src={image ? `https://lyrine-store.onrender.com/uploads/${image}` : "/placeholder-abaya.jpg"}
                                                alt={name}
                                            />
                                        </div>
                                        <div className="item-details">
                                            <h3>{name}</h3>
                                            {item.size  && <p style={{ fontSize: "0.85rem", color: "#888" }}>Size: {item.size}</p>}
                                            {item.color && <p style={{ fontSize: "0.85rem", color: "#888" }}>Color: {item.color}</p>}
                                            <p className="item-price">{item.price} DZD</p>
                                        </div>
                                        <div className="item-quantity">
                                            <button
                                                onClick={() => updateQuantity(pid, item.quantity - 1)}
                                                disabled={updatingId === pid || item.quantity <= 1}
                                            >-</button>
                                            <span>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(pid, item.quantity + 1)}
                                                disabled={updatingId === pid}
                                            >+</button>
                                        </div>
                                        <div className="item-subtotal">
                                            <p>{item.price * item.quantity} DZD</p>
                                        </div>
                                        <button
                                            className="remove-btn"
                                            onClick={() => removeItem(pid)}
                                            disabled={updatingId === pid}
                                        >✕</button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="cart-summary">
                            <div className="total">
                                <span>Total:</span>
                                <span>{calculateTotal().toLocaleString()} DZD</span>
                            </div>
                            <button className="checkout-btn" onClick={() => navigate("/order")}>
                                Proceed to Checkout
                            </button>
                            <button
                                onClick={clearCart}
                                style={{ marginTop: "1rem", width: "100%", padding: "0.8rem", background: "#f5f5f5", color: "#666", border: "none", borderRadius: 40, cursor: "pointer", fontWeight: 500 }}
                            >
                                Clear Cart
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Cart;
