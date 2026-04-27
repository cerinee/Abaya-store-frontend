import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const BASE = "https://lyrine-store.onrender.com/api";
const GOLD = "#C7A252";
const DARK = "#0A0A0A";
const BG   = "#FCF8F0";

const STATUS_COLORS = {
    pending:    { bg: "#FFF8E1", color: "#F59E0B" },
    shipped:    { bg: "#E8F5E9", color: "#2E7D32" },
    delivered:  { bg: "#F3E5F5", color: "#7B1FA2" },
    cancelled:  { bg: "#FFEBEE", color: "#C62828" },
};

// ─── Reusable components ──────────────────────────────────────────────────────

function Btn({ children, onClick, color = GOLD, outline = false, disabled = false, style = {} }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                padding: "0.55rem 1.3rem",
                background: outline ? "none" : color,
                color: outline ? color : DARK,
                border: `1px solid ${color}`,
                borderRadius: 40,
                fontWeight: 600,
                fontSize: "0.82rem",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.6 : 1,
                transition: "all 0.2s",
                ...style,
            }}
        >
            {children}
        </button>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#5a5248", display: "block", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {label}
            </label>
            {children}
        </div>
    );
}

function Input({ value, onChange, placeholder, type = "text", style = {} }) {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={{ width: "100%", padding: "0.65rem 0.9rem", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.9rem", outline: "none", ...style }}
        />
    );
}

function Card({ children, style = {} }) {
    return (
        <div style={{ background: "#fff", border: "1px solid #F0EAE0", borderRadius: 16, padding: "1.5rem", ...style }}>
            {children}
        </div>
    );
}

function StatusBadge({ status }) {
    const s = STATUS_COLORS[status] || { bg: "#eee", color: "#666" };
    return (
        <span style={{ background: s.bg, color: s.color, padding: "3px 12px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, textTransform: "capitalize" }}>
            {status}
        </span>
    );
}

function Spinner() {
    return (
        <div style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ width: 40, height: 40, border: "3px solid #F0EAE0", borderTop: `3px solid ${GOLD}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ color: "#888" }}>Loading...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

function THead({ cols }) {
    return (
        <thead>
            <tr style={{ background: "#F5F2EC" }}>
                {cols.map(c => (
                    <th key={c} style={{ padding: "0.85rem 1rem", textAlign: "left", fontSize: "0.78rem", color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {c}
                    </th>
                ))}
            </tr>
        </thead>
    );
}

function Table({ cols, children }) {
    return (
        <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", border: "1px solid #F0EAE0", borderRadius: 16, overflow: "hidden" }}>
                <THead cols={cols} />
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}

function TR({ children }) {
    return <tr style={{ borderTop: "1px solid #F0EAE0" }}>{children}</tr>;
}

function TD({ children, style = {} }) {
    return <td style={{ padding: "0.85rem 1rem", fontSize: "0.875rem", ...style }}>{children}</td>;
}

// ─── Main Admin Component ─────────────────────────────────────────────────────

function Admin() {
    const [tab, setTab] = useState("dashboard");
    const navigate = useNavigate();
    const user  = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!user || !user.isAdmin) navigate("/");
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/signin");
    };

    const TABS = [
        { id: "dashboard",  label: "📊 Dashboard" },
        { id: "orders",     label: "📦 Orders" },
        { id: "products",   label: "👗 Products" },
        { id: "categories", label: "🗂 Categories" },
    ];

    return (
        <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Poppins', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Poppins:wght@300;400;500;600&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Poppins', sans-serif; background: ${BG}; }
                input:focus, select:focus, textarea:focus { border-color: ${GOLD} !important; outline: none; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                .tab-content { animation: fadeIn 0.25s ease; }
            `}</style>

            {/* NAVBAR */}
            <div style={{ background: DARK, padding: "1.1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 1000, borderBottom: `1px solid rgba(199,162,82,0.2)` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", color: GOLD, fontSize: "1.5rem", fontWeight: 600 }}>
                        LYRINE ABAYA
                    </h2>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", letterSpacing: "0.1em" }}>ADMIN PANEL</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
                        👤 {user?.fullName}
                    </span>
                    <Link to="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.85rem" }}>← Store</Link>
                    <span onClick={handleLogout} style={{ color: GOLD, cursor: "pointer", fontSize: "0.85rem", fontWeight: 500 }}>Logout</span>
                </div>
            </div>

            {/* SIDEBAR + CONTENT LAYOUT */}
            <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>

                {/* SIDEBAR */}
                <div style={{ width: 220, background: "#fff", borderRight: "1px solid #F0EAE0", padding: "1.5rem 0", flexShrink: 0 }}>
                    {TABS.map(t => (
                        <div
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            style={{
                                padding: "0.85rem 1.5rem",
                                cursor: "pointer",
                                background: tab === t.id ? "#FFF8EE" : "none",
                                borderRight: tab === t.id ? `3px solid ${GOLD}` : "3px solid transparent",
                                color: tab === t.id ? GOLD : "#555",
                                fontWeight: tab === t.id ? 600 : 400,
                                fontSize: "0.9rem",
                                transition: "all 0.2s",
                            }}
                        >
                            {t.label}
                        </div>
                    ))}
                </div>

                {/* MAIN CONTENT */}
                <div style={{ flex: 1, padding: "2rem", overflow: "auto" }}>
                    <div className="tab-content" key={tab}>
                        {tab === "dashboard"  && <DashboardTab token={token} />}
                        {tab === "orders"     && <OrdersTab    token={token} />}
                        {tab === "products"   && <ProductsTab  token={token} />}
                        {tab === "categories" && <CategoriesTab token={token} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── DASHBOARD TAB ────────────────────────────────────────────────────────────

function DashboardTab({ token }) {
    const [orders,   setOrders]   = useState([]);
    const [products, setProducts] = useState([]);
    const [loading,  setLoading]  = useState(true);

    useEffect(() => {
        Promise.all([
            fetch(`${BASE}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
            fetch(`${BASE}/products`).then(r => r.json()),
        ])
        .then(([o, p]) => { setOrders(o); setProducts(p); })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, []);

    if (loading) return <Spinner />;

    const revenue      = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + (o.products?.reduce((ps, p) => ps + p.price * p.quantity, 0) || 0), 0);
    const pending      = orders.filter(o => o.status === "pending").length;
    const delivered    = orders.filter(o => o.status === "delivered").length;
    const outOfStock   = products.filter(p => p.stock === 0).length;
    const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate)).slice(0, 5);
    const lowStock     = products.filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 5);

    const stats = [
        { label: "Total Revenue",  value: revenue.toLocaleString() + " DZD", icon: "💰", color: "#FFF8E1" },
        { label: "Total Orders",   value: orders.length,   icon: "📦", color: "#E3F2FD" },
        { label: "Pending Orders", value: pending,         icon: "⏳", color: "#FFF3E0" },
        { label: "Delivered",      value: delivered,       icon: "✅", color: "#E8F5E9" },
        { label: "Total Products", value: products.length, icon: "👗", color: "#F3E5F5" },
        { label: "Out of Stock",   value: outOfStock,      icon: "⚠️", color: "#FFEBEE" },
    ];

    // order counts per status for mini chart
    const statusCounts = ["pending", "shipped", "delivered", "cancelled"].map(s => ({
        status: s,
        count: orders.filter(o => o.status === s).length,
        ...STATUS_COLORS[s],
    }));

    return (
        <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 500, marginBottom: "1.75rem", color: "#1A1A1A" }}>
                Dashboard
            </h2>

            {/* STATS GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                {stats.map(s => (
                    <Card key={s.label} style={{ background: s.color, border: "none", padding: "1.25rem" }}>
                        <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>{s.icon}</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1A1A1A" }}>{s.value}</div>
                        <div style={{ fontSize: "0.78rem", color: "#666", marginTop: "0.25rem" }}>{s.label}</div>
                    </Card>
                ))}
            </div>

            {/* ORDER STATUS BREAKDOWN */}
            <Card style={{ marginBottom: "2rem" }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: "1.25rem", fontSize: "1.1rem" }}>Order Status Breakdown</h3>
                <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                    {statusCounts.map(s => (
                        <div key={s.status} style={{ textAlign: "center", flex: 1, minWidth: 70 }}>
                            <div style={{ background: s.bg, borderRadius: 8, padding: "0.5rem", marginBottom: "0.4rem" }}>
                                <span style={{ color: s.color, fontWeight: 700, fontSize: "1.3rem" }}>{s.count}</span>
                            </div>
                            <span style={{ fontSize: "0.75rem", color: "#666", textTransform: "capitalize" }}>{s.status}</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* TWO COLUMNS: RECENT ORDERS + LOW STOCK */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

                {/* RECENT ORDERS */}
                <Card>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: "1.25rem", fontSize: "1.1rem" }}>Recent Orders</h3>
                    {recentOrders.length === 0 && <p style={{ color: "#888", fontSize: "0.875rem" }}>No orders yet.</p>}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {recentOrders.map(order => (
                            <div key={order._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0", borderBottom: "1px solid #F5F0EA" }}>
                                <div>
                                    <p style={{ fontWeight: 500, fontSize: "0.85rem" }}>{order.userId?.fullName || "Customer"}</p>
                                    <p style={{ fontSize: "0.75rem", color: "#999" }}>{new Date(order.createdAt || order.orderDate).toLocaleDateString()}</p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ color: GOLD, fontWeight: 600, fontSize: "0.9rem" }}>
                                        {order.products?.reduce((s, p) => s + p.price * p.quantity, 0)} DZD
                                    </p>
                                    <StatusBadge status={order.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* LOW STOCK */}
                <Card>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: "1.25rem", fontSize: "1.1rem" }}>⚠️ Low Stock Products</h3>
                    {lowStock.length === 0 && <p style={{ color: "#888", fontSize: "0.875rem" }}>All products are well stocked.</p>}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {lowStock.map(p => (
                            <div key={p._id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0", borderBottom: "1px solid #F5F0EA" }}>
                                <img
                                    src={p.image ? `https://lyrine-store.onrender.com/uploads/${p.image}` : "/placeholder-abaya.jpg"}
                                    alt={p.name}
                                    style={{ width: 40, height: 50, objectFit: "cover", borderRadius: 6 }}
                                />
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 500, fontSize: "0.85rem" }}>{p.name}</p>
                                    <p style={{ fontSize: "0.75rem", color: "#888" }}>{p.category?.name || "—"}</p>
                                </div>
                                <span style={{ fontWeight: 700, color: p.stock === 0 ? "#C62828" : "#E65100", fontSize: "0.9rem" }}>
                                    {p.stock === 0 ? "Out" : `${p.stock} left`}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

// ─── ORDERS TAB ───────────────────────────────────────────────────────────────

// ─── ORDERS TAB (FIXED) ───────────────────────────────────────────────────────────────

function OrdersTab({ token }) {
    const [orders,  setOrders]  = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState("");
    const [search,  setSearch]  = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        setError("");
        try {
            console.log("Fetching orders from:", `${BASE}/admin/orders`);
            const response = await fetch(`${BASE}/admin/orders`, { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                } 
            });
            
            console.log("Response status:", response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Orders received:", data);
            
            // Handle different response formats
            let ordersArray = [];
            if (Array.isArray(data)) {
                ordersArray = data;
            } else if (data.orders && Array.isArray(data.orders)) {
                ordersArray = data.orders;
            } else if (data.data && Array.isArray(data.data)) {
                ordersArray = data.data;
            } else {
                console.warn("Unexpected orders response format:", data);
                ordersArray = [];
            }
            
            setOrders(ordersArray);
            
            if (ordersArray.length === 0) {
                console.log("No orders found");
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, status) => {
        try {
            console.log(`Updating order ${orderId} to status: ${status}`);
            const res = await fetch(`${BASE}/admin/orders/${orderId}/status`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json", 
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ status }),
            });
            
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || "Update failed");
            
            // Update the order in the local state
            setOrders(orders.map(o => o._id === orderId ? { ...o, status } : o));
            console.log("Order updated successfully");
            
        } catch (err) { 
            console.error("Update error:", err);
            alert(err.message); 
        }
    };

    if (loading) return <Spinner />;
    
    if (error) {
        return (
            <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 500, marginBottom: "1.5rem" }}>
                    Orders
                </h2>
                <Card style={{ textAlign: "center", padding: "2rem" }}>
                    <p style={{ color: "#C62828", marginBottom: "1rem" }}>Error loading orders: {error}</p>
                    <Btn onClick={fetchOrders} color={GOLD}>Retry</Btn>
                </Card>
            </div>
        );
    }

    const filtered = orders.filter(o => {
        const matchStatus = filterStatus === "all" || o.status === filterStatus;
        const matchSearch = !search || 
            o.userId?.fullName?.toLowerCase().includes(search.toLowerCase()) || 
            o._id.toLowerCase().includes(search.toLowerCase()) ||
            o.userId?.email?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 500 }}>
                    Orders <span style={{ fontSize: "1rem", color: "#999", fontFamily: "sans-serif" }}>({orders.length})</span>
                </h2>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        style={{ padding: "0.65rem 0.9rem", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.9rem", cursor: "pointer" }}
                    >
                        <option value="all">All Status</option>
                        {["pending", "shipped", "delivered", "cancelled"].map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <Btn onClick={fetchOrders} outline style={{ padding: "0.55rem 1rem" }}>⟳ Refresh</Btn>
                </div>
            </div>

            {/* SUMMARY CHIPS */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                {["pending", "shipped", "delivered", "cancelled"].map(s => {
                    const count = orders.filter(o => o.status === s).length;
                    const sc = STATUS_COLORS[s] || { bg: "#eee", color: "#666" };
                    return (
                        <span
                            key={s}
                            onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
                            style={{ 
                                background: sc.bg, 
                                color: sc.color, 
                                padding: "6px 16px", 
                                borderRadius: 20, 
                                fontSize: "0.8rem", 
                                fontWeight: 600, 
                                cursor: "pointer", 
                                textTransform: "capitalize",
                                border: filterStatus === s ? `2px solid ${sc.color}` : "2px solid transparent",
                                transition: "all 0.2s"
                            }}
                        >
                            {s} ({count})
                        </span>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <Card style={{ textAlign: "center", padding: "2rem" }}>
                    <p style={{ color: "#888" }}>No orders found.</p>
                </Card>
            )}

            {filtered.length > 0 && (
                <Table cols={["Order ID", "Customer", "Products", "Total", "Shipping", "Date", "Status", "Update"]}>
                    {filtered.map(order => {
                        const total = order.products?.reduce((s, p) => s + (p.price * p.quantity), 0) || 0;
                        return (
                            <TR key={order._id}>
                                <TD style={{ color: "#999", fontSize: "0.75rem", fontWeight: 500 }}>
                                    #{order._id.slice(-8).toUpperCase()}
                                </TD>
                                <TD>
                                    <p style={{ fontWeight: 500 }}>{order.userId?.fullName || "—"}</p>
                                    <p style={{ fontSize: "0.7rem", color: "#999" }}>{order.userId?.email || "No email"}</p>
                                </TD>
                                <TD>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                        {order.products?.map((p, i) => (
                                            <p key={i} style={{ fontSize: "0.75rem", color: "#555" }}>
                                                {p.productId?.name || p.name || "Product"} × {p.quantity}
                                            </p>
                                        ))}
                                        {(!order.products || order.products.length === 0) && (
                                            <p style={{ fontSize: "0.75rem", color: "#999" }}>No products</p>
                                        )}
                                    </div>
                                </TD>
                                <TD style={{ color: GOLD, fontWeight: 700 }}>
                                    {total.toLocaleString()} DZD
                                </TD>
                                <TD style={{ fontSize: "0.75rem", color: "#555" }}>
                                    {order.ShippingInfos?.fullName ? (
                                        <>
                                            <strong>{order.ShippingInfos.fullName}</strong><br />
                                            <span style={{ color: "#999" }}>{order.ShippingInfos.address}</span><br />
                                            <span style={{ color: "#999", fontSize: "0.7rem" }}>{order.ShippingInfos.phone}</span>
                                        </>
                                    ) : (
                                        <span style={{ color: "#999" }}>No shipping info</span>
                                    )}
                                </TD>
                                <TD style={{ color: "#888", fontSize: "0.8rem" }}>
                                    {new Date(order.createdAt || order.orderDate).toLocaleDateString()}
                                </TD>
                                <TD>
                                    <StatusBadge status={order.status} />
                                </TD>
                                <TD>
                                    <select
                                        value={order.status}
                                        onChange={e => updateStatus(order._id, e.target.value)}
                                        style={{ 
                                            padding: "6px 10px", 
                                            border: "1px solid #ddd", 
                                            borderRadius: 8, 
                                            fontSize: "0.8rem", 
                                            cursor: "pointer",
                                            backgroundColor: "#fff"
                                        }}
                                    >
                                        {["pending", "shipped", "delivered", "cancelled"].map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </TD>
                            </TR>
                        );
                    })}
                </Table>
            )}
        </div>
    );
}
// PRODUCTS TAB 

function ProductsTab({ token }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ 
        name: "", 
        description: "", 
        price: "", 
        stock: "", 
        category: "", 
        size: "", 
        color: "", 
        discount: "" 
    });
    const [imageFile, setImageFile] = useState(null);
    const [categoryError, setCategoryError] = useState("");

    useEffect(() => {
        fetchProductsAndCategories();
    }, []);

    const fetchProductsAndCategories = async () => {
        setLoading(true);
        try {
            // Fetch products
            const productsRes = await fetch(`${BASE}/products`);
            if (!productsRes.ok) throw new Error("Failed to fetch products");
            const productsData = await productsRes.json();
            console.log("Products fetched:", productsData);
            setProducts(productsData);

            // Fetch categories
            console.log("Fetching categories from:", `${BASE}/category`);
            const categoriesRes = await fetch(`${BASE}/category`);
            
            if (!categoriesRes.ok) {
                console.error("Categories response not OK:", categoriesRes.status);
                throw new Error("Failed to fetch categories");
            }
            
            const categoriesData = await categoriesRes.json();
            console.log("Categories fetched:", categoriesData);
            console.log("Categories count:", categoriesData.length);
            
            // Handle different response formats
            let categoriesArray = [];
            if (Array.isArray(categoriesData)) {
                categoriesArray = categoriesData;
            } else if (categoriesData.categories && Array.isArray(categoriesData.categories)) {
                categoriesArray = categoriesData.categories;
            } else if (categoriesData.data && Array.isArray(categoriesData.data)) {
                categoriesArray = categoriesData.data;
            } else {
                console.warn("Unexpected categories response format:", categoriesData);
                categoriesArray = [];
            }
            
            setCategories(categoriesArray);
            
            if (categoriesArray.length === 0) {
                setCategoryError("No categories found. Please create categories first.");
            } else {
                setCategoryError("");
            }
            
        } catch (err) {
            console.error("Error fetching data:", err);
            setCategoryError("Error loading categories: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setEditItem(null);
        setForm({ 
            name: "", 
            description: "", 
            price: "", 
            stock: "", 
            category: "", 
            size: "", 
            color: "", 
            discount: "" 
        });
        setImageFile(null);
        setShowForm(true);
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
    };

    const openEdit = (p) => {
        setEditItem(p);
        setForm({
            name: p.name || "", 
            description: p.description || "",
            price: p.price || "", 
            stock: p.stock || "",
            category: p.category?._id || p.category || "",
            size: Array.isArray(p.size) ? p.size.join(", ") : (p.size || ""),
            color: Array.isArray(p.color) ? p.color.join(", ") : (p.color || ""),
            discount: p.discount || "",
        });
        setImageFile(null);
        setShowForm(true);
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
    };

    const handleSave = async () => {
        if (!form.name || !form.price) { 
            alert("Name and price are required"); 
            return; 
        }
        
        if (!form.category) {
            alert("Please select a category");
            return;
        }
        
        setSaving(true);
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("description", form.description);
        fd.append("price", form.price);
        fd.append("stock", form.stock);
        fd.append("category", form.category);
        fd.append("discount", form.discount);
        
        if (form.size) {
            const sizeArray = form.size.split(",").map(s => s.trim()).filter(Boolean);
            fd.append("size", JSON.stringify(sizeArray));
        }
        
        if (form.color) {
            const colorArray = form.color.split(",").map(c => c.trim()).filter(Boolean);
            fd.append("color", JSON.stringify(colorArray));
        }
        
        if (imageFile) {
            fd.append("image", imageFile);
        }

        try {
            const url = editItem ? `${BASE}/admin/products/update/${editItem._id}` : `${BASE}/admin/products/add`;
            const method = editItem ? "PUT" : "POST";
            
            console.log("Saving product to:", url);
            const res = await fetch(url, { 
                method, 
                headers: { 
                    Authorization: `Bearer ${token}` 
                }, 
                body: fd 
            });
            
            const data = await res.json();
            console.log("Save response:", data);
            
            if (!res.ok) throw new Error(data.message || "Failed to save product");
            
            if (editItem) {
                setProducts(products.map(p => p._id === editItem._id ? data.product || data : p));
            } else {
                setProducts([data.product || data, ...products]);
            }
            
            setShowForm(false);
            alert(editItem ? "Product updated successfully!" : "Product added successfully!");
            
        } catch (err) {
            console.error("Save error:", err);
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this product?")) return;
        try {
            const res = await fetch(`${BASE}/admin/products/delete/${id}`, { 
                method: "DELETE", 
                headers: { Authorization: `Bearer ${token}` } 
            });
            if (!res.ok) throw new Error("Delete failed");
            setProducts(products.filter(p => p._id !== id));
            alert("Product deleted successfully!");
        } catch (err) { 
            alert(err.message); 
        }
    };

    const filtered = products.filter(p => 
        !search || p.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <Spinner />;

    const formFields = [
        { label: "Product Name *", key: "name", placeholder: "e.g. Classic Black Abaya" },
        { label: "Price (DZD) *",  key: "price", placeholder: "2500", type: "number" },
        { label: "Stock",          key: "stock", placeholder: "20", type: "number" },
        { label: "Discount (%)",   key: "discount", placeholder: "10", type: "number" },
        { label: "Sizes (comma separated)",  key: "size", placeholder: "XS, S, M, L, XL" },
        { label: "Colors (comma separated)", key: "color", placeholder: "black, white, beige" },
    ];

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 500 }}>
                    Products <span style={{ fontSize: "1rem", color: "#999", fontFamily: "sans-serif" }}>({products.length})</span>
                </h2>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={{ width: 200 }} />
                    {!showForm && <Btn onClick={openAdd}>+ Add Product</Btn>}
                </div>
            </div>

            {/* Category Warning */}
            {categoryError && (
                <div style={{ 
                    background: "#FFF3E0", 
                    color: "#E65100", 
                    padding: "0.75rem", 
                    borderRadius: 8, 
                    marginBottom: "1rem",
                    textAlign: "center"
                }}>
                    ⚠️ {categoryError}
                </div>
            )}

            {/* FORM */}
            {showForm && (
                <Card style={{ marginBottom: "1.5rem" }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: "1.25rem", fontSize: "1.15rem" }}>
                        {editItem ? `Editing: ${editItem.name}` : "Add New Product"}
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                        {formFields.map(f => (
                            <Field key={f.key} label={f.label}>
                                <Input 
                                    type={f.type || "text"} 
                                    value={form[f.key]} 
                                    onChange={e => setForm({ ...form, [f.key]: e.target.value })} 
                                    placeholder={f.placeholder} 
                                />
                            </Field>
                        ))}
                        <Field label="Category *">
                            <select
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                                style={{ 
                                    width: "100%", 
                                    padding: "0.65rem 0.9rem", 
                                    border: "1px solid #ddd", 
                                    borderRadius: 8, 
                                    fontSize: "0.9rem",
                                    backgroundColor: "#fff"
                                }}
                                required
                            >
                                <option value="">-- Select a category --</option>
                                {categories.length === 0 ? (
                                    <option value="" disabled>No categories available</option>
                                ) : (
                                    categories.map(c => (
                                        <option key={c._id} value={c._id}>
                                            {c.name}
                                        </option>
                                    ))
                                )}
                            </select>
                            {categories.length === 0 && (
                                <p style={{ fontSize: "0.75rem", color: "#E65100", marginTop: "0.25rem" }}>
                                    No categories found. Please create categories in the Categories tab first.
                                </p>
                            )}
                        </Field>
                    </div>
                    
                    <Field label="Description">
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Product description..."
                            rows={3}
                            style={{ width: "100%", marginTop: "0.3rem", padding: "0.65rem 0.9rem", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.9rem", resize: "vertical" }}
                        />
                    </Field>
                    
                    <Field label="Product Image">
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={e => setImageFile(e.target.files[0])} 
                            style={{ marginTop: "0.3rem" }} 
                        />
                        {editItem?.image && !imageFile && (
                            <img 
                                src={`https://lyrine-store.onrender.com/uploads/${editItem.image}`} 
                                alt="" 
                                style={{ width: 60, height: 75, objectFit: "cover", borderRadius: 8, marginTop: "0.5rem" }} 
                            />
                        )}
                    </Field>
                    
                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                        <Btn onClick={handleSave} disabled={saving}>
                            {saving ? "Saving..." : editItem ? "Update Product" : "Add Product"}
                        </Btn>
                        <Btn onClick={() => setShowForm(false)} color="#aaa">Cancel</Btn>
                    </div>
                </Card>
            )}

            {/* PRODUCTS TABLE */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                    No products found.
                </div>
            ) : (
                <Table cols={["Image", "Name", "Category", "Price", "Stock", "Discount", "Sizes", "Actions"]}>
                    {filtered.map(product => (
                        <TR key={product._id}>
                            <TD>
                                <img
                                    src={product.image ? `https://lyrine-store.onrender.com/uploads/${product.image}` : "/placeholder-abaya.jpg"}
                                    alt={product.name}
                                    style={{ width: 45, height: 55, objectFit: "cover", borderRadius: 8 }}
                                    onError={(e) => { e.target.src = "/placeholder-abaya.jpg"; }}
                                />
                            </TD>
                            <TD style={{ fontWeight: 500, maxWidth: 160 }}>
                                <p>{product.name}</p>
                                {product.description && (
                                    <p style={{ fontSize: "0.75rem", color: "#999", marginTop: 2 }}>
                                        {product.description.slice(0, 40)}...
                                    </p>
                                )}
                            </TD>
                            <TD>
                                <span style={{ 
                                    background: "#F5F2EC", 
                                    padding: "3px 10px", 
                                    borderRadius: 20, 
                                    fontSize: "0.75rem" 
                                }}>
                                    {product.category?.name || product.category || "—"}
                                </span>
                            </TD>
                            <TD style={{ color: GOLD, fontWeight: 600 }}>
                                {product.price.toLocaleString()} DZD
                            </TD>
                            <TD>
                                <span style={{ 
                                    color: product.stock === 0 ? "#C62828" : product.stock <= 5 ? "#E65100" : "#2E7D32", 
                                    fontWeight: 600 
                                }}>
                                    {product.stock === 0 ? "Out of stock" : product.stock}
                                </span>
                            </TD>
                            <TD style={{ color: "#888" }}>
                                {product.discount > 0 ? `${product.discount}%` : "—"}
                            </TD>
                            <TD style={{ fontSize: "0.78rem", color: "#666" }}>
                                {product.size?.join(", ") || "—"}
                            </TD>
                            <TD>
                                <div style={{ display: "flex", gap: "0.4rem" }}>
                                    <Btn onClick={() => openEdit(product)} outline>Edit</Btn>
                                    <Btn onClick={() => handleDelete(product._id)} color="#C62828" outline>Del</Btn>
                                </div>
                            </TD>
                        </TR>
                    ))}
                </Table>
            )}
        </div>
    );
}

// ─── CATEGORIES TAB ───────────────────────────────────────────────────────────

function CategoriesTab({ token }) {
    const [categories, setCategories] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [showForm,   setShowForm]   = useState(false);
    const [editItem,   setEditItem]   = useState(null);
    const [name,       setName]       = useState("");
    const [imageFile,  setImageFile]  = useState(null);
    const [saving,     setSaving]     = useState(false);

    useEffect(() => {
        fetch(`${BASE}/category`)
            .then(r => r.json())
            .then(setCategories)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const openAdd  = () => { setEditItem(null); setName(""); setImageFile(null); setShowForm(true); };
    const openEdit = (c) => { setEditItem(c); setName(c.name); setImageFile(null); setShowForm(true); };

    const handleSave = async () => {
        if (!name) { alert("Category name is required"); return; }
        setSaving(true);
        const fd = new FormData();
        fd.append("name", name);
        if (imageFile) fd.append("image", imageFile);
        try {
            const url    = editItem ? `${BASE}/admin/category/update/${editItem._id}` : `${BASE}/admin/category/add`;
            const method = editItem ? "PUT" : "POST";
            const res  = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            if (editItem) setCategories(categories.map(c => c._id === editItem._id ? data : c));
            else          setCategories([...categories, data]);
            setShowForm(false);
        } catch (err) { alert(err.message); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this category?")) return;
        try {
            const res = await fetch(`${BASE}/admin/category/delete/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error("Delete failed");
            setCategories(categories.filter(c => c._id !== id));
        } catch (err) { alert(err.message); }
    };

    if (loading) return <Spinner />;

    return (
        <div style={{ maxWidth: 700 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 500 }}>
                    Categories <span style={{ fontSize: "1rem", color: "#999", fontFamily: "sans-serif" }}>({categories.length})</span>
                </h2>
                {!showForm && <Btn onClick={openAdd}>+ Add Category</Btn>}
            </div>

            {/* FORM */}
            {showForm && (
                <Card style={{ marginBottom: "1.5rem" }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: "1.25rem", fontSize: "1.15rem" }}>
                        {editItem ? `Editing: ${editItem.name}` : "Add New Category"}
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <Field label="Category Name *">
                            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Kimono Abayas" />
                        </Field>
                        <Field label="Category Image">
                            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ marginTop: "0.3rem" }} />
                            {editItem?.image && !imageFile && (
                                <img src={`https://lyrine-store.onrender.com/uploads/${editItem.image}`} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, marginTop: "0.5rem" }} />
                            )}
                        </Field>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                        <Btn onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editItem ? "Update" : "Add Category"}</Btn>
                        <Btn onClick={() => setShowForm(false)} color="#aaa">Cancel</Btn>
                    </div>
                </Card>
            )}

            {/* CATEGORIES LIST */}
            {categories.length === 0 && <p style={{ color: "#888", padding: "2rem", textAlign: "center" }}>No categories yet.</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {categories.map(cat => (
                    <Card key={cat._id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem" }}>
                        {cat.image
                            ? <img src={`https://lyrine-store.onrender.com/uploads/${cat.image}`} alt={cat.name} style={{ width: 55, height: 55, objectFit: "cover", borderRadius: 10 }} />
                            : <div style={{ width: 55, height: 55, background: "#F5F2EC", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>🗂</div>
                        }
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>{cat.name}</p>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <Btn onClick={() => openEdit(cat)} outline>Edit</Btn>
                            <Btn onClick={() => handleDelete(cat._id)} color="#C62828" outline>Delete</Btn>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default Admin;
