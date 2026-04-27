import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }

        // Fetch products and categories
        const fetchData = async () => {
            setLoading(true);
            setError("");
            
            try {
                // Fetch products
                const productsRes = await fetch("https://lyrine-store.onrender.com/api/products");
                if (!productsRes.ok) throw new Error("Failed to fetch products");
                const productsData = await productsRes.json();
                setProducts(productsData);
                
                // Fetch categories
                const categoriesRes = await fetch("https://lyrine-store.onrender.com/api/category");
                if (!categoriesRes.ok) throw new Error("Failed to fetch categories");
                const categoriesData = await categoriesRes.json();
                
                // Handle different response formats
                let categoriesArray = [];
                if (Array.isArray(categoriesData)) {
                    categoriesArray = categoriesData;
                } else if (categoriesData.categories) {
                    categoriesArray = categoriesData.categories;
                } else if (categoriesData.data) {
                    categoriesArray = categoriesData.data;
                }
                setCategories(categoriesArray);
                
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/signin");
    };

    // Get first 4 featured products (you can add a "featured" flag in your product schema)
    const featuredProducts = products.slice(0, 4);
    
    // Get products for each category (for category sections)
    const getProductsByCategory = (categoryId) => {
        return products.filter(p => p.category === categoryId).slice(0, 4);
    };

    return (
        <div className="home">
            {/* NAVBAR */}
            <div className="navbar">
                <h2 className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                    LYRINE ABAYA
                </h2>

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

            {/* HERO SECTION */}
            <div className="hero">
                <div className="hero-overlay">
                    <h1>Elegance that speaks for you</h1>
                    <p>Discover timeless abayas crafted with luxury & modesty</p>
                    <button onClick={() => navigate("/Abayas")} className="shop-now-btn">
                        Shop Now
                    </button>
                </div>
            </div>

            {/* CATEGORIES SECTION */}
            {categories.length > 0 && (
                <div className="section">
                    <h2>Shop by Category</h2>
                    <div className="categories">
                        {categories.map((cat) => (
                            <div 
                                key={cat._id} 
                                className="category-card"
                                onClick={() => navigate(`/Abayas?category=${cat._id}`)}
                            >
                                {cat.image && (
                                    <img 
                                        src={`https://lyrine-store.onrender.com/uploads/${cat.image}`} 
                                        alt={cat.name}
                                        className="category-image"
                                    />
                                )}
                                <div className="category-overlay">
                                    <span className="category-name">{cat.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* FEATURED PRODUCTS */}
            <div className="section">
                <h2>Featured Products</h2>
                {error && <div className="error-message">{error}</div>}
                
                {loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading products...</p>
                    </div>
                ) : featuredProducts.length === 0 ? (
                    <div className="empty-state">
                        <p>No products available.</p>
                    </div>
                ) : (
                    <div className="products">
                        {featuredProducts.map((product) => (
                            <div
                                key={product._id}
                                className="product-card"
                                onClick={() => navigate(`/products/${product._id}`)}
                            >
                                <div className="img-wrapper">
                                    <img
                                        src={
                                            product.image 
                                                ? `https://lyrine-store.onrender.com/uploads/${product.image}`
                                                : product.images?.[0]
                                                    ? `https://lyrine-store.onrender.com/${product.images[0]}`
                                                    : "/placeholder-abaya.jpg"
                                        }
                                        alt={product.name}
                                        onError={(e) => {
                                            e.target.src = "/placeholder-abaya.jpg";
                                        }}
                                    />
                                    {product.discount > 0 && (
                                        <span className="discount-badge">-{product.discount}%</span>
                                    )}
                                    {product.stock === 0 && (
                                        <span className="soldout-badge">Sold Out</span>
                                    )}
                                </div>
                                <h3>{product.name}</h3>
                                <div className="product-price">
                                    {product.discount > 0 ? (
                                        <>
                                            <span className="original-price">{product.price} DZD</span>
                                            <span className="discounted-price">
                                                {Math.floor(product.price * (1 - product.discount / 100))} DZD
                                            </span>
                                        </>
                                    ) : (
                                        <span className="price">{product.price} DZD</span>
                                    )}
                                </div>
                                {product.category?.name && (
                                    <p className="product-category">{product.category.name}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FEATURES SECTION */}
            <div className="features-section">
                <div className="features">
                    <div className="feature">
                        <div className="feature-icon">🚚</div>
                        <h4>Free Shipping</h4>
                        <p>On orders over 10,000 DZD</p>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">🔄</div>
                        <h4>Easy Returns</h4>
                        <p>14-day return policy</p>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">💎</div>
                        <h4>Premium Quality</h4>
                        <p>100% authentic materials</p>
                    </div>
                </div>
            </div>

            

            {/* FOOTER */}
            <div className="footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>LYRINE ABAYA</h3>
                        <p>Elegant abayas for the modern Muslim woman.</p>
                    </div>
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <Link to="/">Home</Link>
                        <Link to="/Abayas">Abayas</Link>
                        <Link to="/Cart">Cart</Link>
                    </div>
                    <div className="footer-section">
                        <h4>Contact</h4>
                        <p>Email: contact@lyrineabaya.com</p>
                        <p>Phone: +213 556211808</p>
                    </div>
                    <div className="footer-section">
                        <h4>Follow Us</h4>
                        <div className="social-links">
                            <a href="https://instagram.com/lyrineabaya" target="_blank" rel="noopener noreferrer">Instagram</a>
                            <a href="https://facebook.com/lyrineabaya" target="_blank" rel="noopener noreferrer">Facebook</a>
                            <a href="https://tiktok.com/@lyrineabaya" target="_blank" rel="noopener noreferrer">TikTok</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2024 LYRINE ABAYA. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}

export default Home;