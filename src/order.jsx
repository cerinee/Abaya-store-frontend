import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";

const BASE = "http://localhost:4000/api";

const STATUS_COLORS = {
    pending:   { bg: "#FFF8E1", color: "#F59E0B" },
    shipped:   { bg: "#E8F5E9", color: "#2E7D32" },
    delivered: { bg: "#F3E5F5", color: "#7B1FA2" },
    cancelled: { bg: "#FFEBEE", color: "#C62828" },
};

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const user  = JSON.parse(localStorage.getItem("user") || "null");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/signin");
    };

    useEffect(() => {
        if (!token) { navigate("/signin"); return; }

        // ← was reading from localStorage — now fetches real orders from backend
        fetch(`${BASE}/orders`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch orders");
            return res.json();
        })
        .then(data => setOrders(data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }, []);

    return (
        <div className="home">
            <div className="navbar">
                <h2 className="logo">LYRINE ABAYA</h2>
                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/Abayas">Abayas</Link>
                    <Link to="/Cart">Cart</Link>
                    <Link to="/order">Orders</Link>
                    {user ? (
                        <>
                            <span className="user-name" style={{ color: "#C7A252" }}>
                                👋 {user.fullName || user.name || "User"}
                            </span>
                            <button onClick={handleLogout} className="logout-btn">
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/signin">Sign In</Link>
                    )}
                </div>
            </div>

            <div className="section" style={{ maxWidth: 900 }}>
                <h2>My Orders</h2>

                {loading && <p>Loading your orders...</p>}
                {error   && <p style={{ color: "red" }}>{error}</p>}

                {!loading && !error && orders.length === 0 && (
                    <div style={{ textAlign: "center", padding: "3rem" }}>
                        <p style={{ color: "#888", marginBottom: "1.5rem" }}>You have no orders yet.</p>
                        <Link to="/Abayas" style={{ background: "#C7A252", color: "#0A0A0A", padding: "0.8rem 2rem", borderRadius: 40, textDecoration: "none", fontWeight: 600 }}>
                            Start Shopping
                        </Link>
                    </div>
                )}

                {!loading && orders.map(order => {
                    const sc = STATUS_COLORS[order.status] || { bg: "#eee", color: "#666" };
                    return (
                        <div key={order._id} style={{ background: "#fff", border: "1px solid #F0EAE0", borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem" }}>

                            {/* HEADER */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                                <div>
                                    <p style={{ fontSize: "0.75rem", color: "#999" }}>Order ID</p>
                                    <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>{order._id}</p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ fontSize: "0.75rem", color: "#999" }}>Date</p>
                                    <p style={{ fontSize: "0.85rem" }}>{new Date(order.orderDate || order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span style={{ background: sc.bg, color: sc.color, padding: "4px 14px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600, textTransform: "capitalize" }}>
                                    {order.status}
                                </span>
                            </div>

                            {/* PRODUCTS */}
                            <div style={{ borderTop: "1px solid #F0EAE0", paddingTop: "1rem", marginBottom: "1rem" }}>
                                {order.products?.map((item, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", fontSize: "0.9rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            {(item.productId?.image || item.image) && (
                                                <img
                                                    src={`http://localhost:4000/uploads/${item.productId?.image || item.image}`}
                                                    alt={item.productId?.name || item.name}
                                                    style={{ width: 45, height: 55, objectFit: "cover", borderRadius: 8 }}
                                                />
                                            )}
                                            <div>
                                                <p style={{ fontWeight: 500 }}>{item.productId?.name || item.name || "Product"}</p>
                                                {item.size  && <p style={{ fontSize: "0.78rem", color: "#888" }}>Size: {item.size}</p>}
                                                {item.color && <p style={{ fontSize: "0.78rem", color: "#888" }}>Color: {item.color}</p>}
                                                <p style={{ fontSize: "0.78rem", color: "#888" }}>Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p style={{ fontWeight: 600, color: "#C7A252" }}>{item.price * item.quantity} DZD</p>
                                    </div>
                                ))}
                            </div>

                            {/* FOOTER */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F0EAE0", paddingTop: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                                <div>
                                    <p style={{ fontSize: "0.75rem", color: "#999" }}>Shipping to</p>
                                    <p style={{ fontSize: "0.85rem" }}>{order.customerInfo?.fullName} — {order.customerInfo?.address}</p>
                                    <p style={{ fontSize: "0.78rem", color: "#999" }}>{order.customerInfo?.phoneNumber}</p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ fontSize: "0.75rem", color: "#999" }}>Total</p>
                                    <p style={{ fontWeight: 700, color: "#C7A252", fontSize: "1.1rem" }}>{order.totalAmount?.toLocaleString()} DZD</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Orders;
