import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Products.css";

function Abayas() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "null");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/signin");
    };

    useEffect(() => {
        // fetch products and categories at the same time
        Promise.all([
            fetch("https://lyrine-store.onrender.com/api/products").then(r => r.json()),
            fetch("https://lyrine-store.onrender.com/api/category").then(r => r.json()),
        ])
        .then(([productsData, categoriesData]) => {
            setProducts(productsData);
            setCategories(categoriesData);
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }, []);

    // category is now a populated object {_id, name} so compare by _id
    const filteredProducts = filter === "all"
        ? products
        : products.filter(p => p.category?._id === filter);

    return (
        <div className="abayas-page">

            {/* NAVBAR */}
            <div className="navbar">
                <h2 className="logo">LYRINE ABAYA</h2>
                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/Abayas">Abayas</Link>
                    <Link to="/Cart">Cart</Link>
                    <Link to="/order">Orders</Link>
                    {user ? (
                        <span className="signup-link" onClick={handleLogout} style={{ cursor: "pointer" }}>
                            Logout
                        </span>
                    ) : (
                        <Link to="/signin">Sign In</Link>
                    )}
                </div>
            </div>

            {/* PAGE HEADER */}
            <div className="page-header">
                <h1>Our Abayas Collection</h1>
                <p>Elegance crafted with precision and luxury</p>
            </div>

            {/* FILTER BAR — dynamic from backend */}
            <div className="filter-bar">
                <button
                    className={filter === "all" ? "filter-active" : ""}
                    onClick={() => setFilter("all")}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button
                        key={cat._id}
                        className={filter === cat._id ? "filter-active" : ""}
                        onClick={() => setFilter(cat._id)}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* PRODUCTS GRID */}
            <div className="abayas-container">

                {loading && (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading luxurious abayas...</p>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()}>Try Again</button>
                    </div>
                )}

                {!loading && !error && filteredProducts.length === 0 && (
                    <div className="no-products">
                        <p>No abayas found in this category.</p>
                    </div>
                )}

                {!loading && !error && filteredProducts.length > 0 && (
                    <div className="products-grid">
                        {filteredProducts.map(product => (
                            <Link
                                to={`/products/${product._id}`}
                                className="product-card"
                                key={product._id}
                            >
                                <div className="img-wrapper">
                                    <img
                                        src={
                                            product.image
                                                ? `https://lyrine-store.onrender.com/uploads/${product.image}`
                                                : "/placeholder-abaya.jpg"
                                        }
                                        alt={product.name}
                                    />
                                    {product.stock === 0 && (
                                        <span className="badge sale">SOLD OUT</span>
                                    )}
                                    {product.discount > 0 && (
                                        <span className="badge">-{product.discount}%</span>
                                    )}
                                </div>
                                <h3>{product.name}</h3>
                                <p className="price">{product.price} DZD</p>
                            </Link>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}

export default Abayas;
