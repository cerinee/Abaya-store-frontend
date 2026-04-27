import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./productdetails.css";

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [cartMsg, setCartMsg] = useState("");
    const [cartLoading, setCartLoading] = useState(false);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [orderLoading, setOrderLoading] = useState(false);

    // Order form state
    const [orderForm, setOrderForm] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        address: "",
        city: "",
        deliveryMethod: "domicile",
        notes: ""
    });

    // Get user from localStorage
    const getUserInfo = () => {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");
        
        if (!token || !userStr) {
            return null;
        }
        
        try {
            const userData = JSON.parse(userStr);
            return {
                token,
                userId: userData._id || userData.id,
                user: userData
            };
        } catch (e) {
            console.error("Error parsing user data:", e);
            return null;
        }
    };

    const userInfo = getUserInfo();
    const isLoggedIn = !!userInfo;

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:4000/api/products/${id}`);
            if (!response.ok) throw new Error("Product not found");
            const data = await response.json();
            setProduct(data);
            
            // Auto-select first size and color if available
            if (data.size && data.size.length > 0) {
                setSelectedSize(data.size[0]);
            }
            if (data.color && data.color.length > 0) {
                setSelectedColor(data.color[0]);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!isLoggedIn) {
            navigate("/signin");
            return;
        }

        // Validate selections
        if (product.size?.length > 0 && !selectedSize) {
            setCartMsg("Please select a size");
            setTimeout(() => setCartMsg(""), 3000);
            return;
        }
        
        if (product.color?.length > 0 && !selectedColor) {
            setCartMsg("Please select a color");
            setTimeout(() => setCartMsg(""), 3000);
            return;
        }

        setCartLoading(true);
        setCartMsg("");

        try {
            const response = await fetch("http://localhost:4000/api/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify({
                    productId: product._id,
                    quantity: quantity,
                    price: product.price,
                    size: selectedSize,
                    color: selectedColor,
                }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || "Failed to add to cart");
            }
            
            setCartMsg("✓ Added to cart successfully!");
            setTimeout(() => setCartMsg(""), 3000);
        } catch (err) {
            setCartMsg(err.message);
            setTimeout(() => setCartMsg(""), 3000);
        } finally {
            setCartLoading(false);
        }
    };

    const handleBuyNow = () => {
        if (!isLoggedIn) {
            navigate("/signin");
            return;
        }

        // Validate selections
        if (product.size?.length > 0 && !selectedSize) {
            setCartMsg("Please select a size");
            setTimeout(() => setCartMsg(""), 3000);
            return;
        }
        
        if (product.color?.length > 0 && !selectedColor) {
            setCartMsg("Please select a color");
            setTimeout(() => setCartMsg(""), 3000);
            return;
        }

        // Pre-fill form with user data if available
        if (userInfo.user) {
            setOrderForm(prev => ({
                ...prev,
                fullName: userInfo.user.fullName || "",
                email: userInfo.user.email || "",
                phoneNumber: userInfo.user.phoneNumber || "",
                address: userInfo.user.address || "",
            }));
        }
        
        setShowOrderForm(true);
    };

    const handleOrderFormChange = (e) => {
        setOrderForm({
            ...orderForm,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!orderForm.fullName || !orderForm.email || !orderForm.phoneNumber || !orderForm.address) {
            setCartMsg("Please fill all required fields");
            setTimeout(() => setCartMsg(""), 3000);
            return;
        }

        setOrderLoading(true);

        try {
            const orderData = {
                products: [{
                    productId: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: quantity,
                    size: selectedSize,
                    color: selectedColor,
                    image: product.image
                }],
                customerInfo: {
                    fullName: orderForm.fullName,
                    email: orderForm.email,
                    phoneNumber: orderForm.phoneNumber,
                    address: orderForm.address,
                    city: orderForm.city,
                    deliveryMethod: orderForm.deliveryMethod,
                    notes: orderForm.notes
                },
                totalAmount: product.price * quantity,
                orderDate: new Date()
            };

            const response = await fetch("http://localhost:4000/api/orders/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify(orderData),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || "Order failed");
            }

            setCartMsg("✅ Order placed successfully!");
            setShowOrderForm(false);
            
            // Reset form
            setOrderForm({
                fullName: "",
                email: "",
                phoneNumber: "",
                address: "",
                city: "",
                deliveryMethod: "domicile",
                notes: ""
            });
            
            // Redirect to orders page after 2 seconds
            setTimeout(() => {
                navigate("/order");
            }, 2000);
            
        } catch (err) {
            setCartMsg(err.message);
            setTimeout(() => setCartMsg(""), 3000);
        } finally {
            setOrderLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/signin");
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading product details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-text">{error}</p>
                <button onClick={() => navigate("/Abayas")} className="back-btn">
                    Back to Shop
                </button>
            </div>
        );
    }

    return (
        <div className="product-details-page">
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
                    {isLoggedIn ? (
                        <button onClick={handleLogout} className="logout-btn">
                            Logout
                        </button>
                    ) : (
                        <Link to="/signin">Sign In</Link>
                    )}
                </div>
            </div>

            {/* PRODUCT DETAILS */}
            <div className="product-details-container">
                <div className="product-image-section">
                    <img
                        src={
                            product.image 
                                ? `http://localhost:4000/uploads/${product.image}`
                                : product.images?.[0]
                                    ? `http://localhost:4000/${product.images[0]}`
                                    : "/placeholder-abaya.jpg"
                        }
                        alt={product.name}
                        onError={(e) => { e.target.src = "/placeholder-abaya.jpg"; }}
                    />
                </div>

                <div className="product-info-section">
                    <h1>{product.name}</h1>
                    
                    <div className="product-price">
                        {product.discount > 0 ? (
                            <>
                                <span className="original-price">{product.price} DZD</span>
                                <span className="discounted-price">
                                    {Math.floor(product.price * (1 - product.discount / 100))} DZD
                                </span>
                                <span className="discount-badge">-{product.discount}%</span>
                            </>
                        ) : (
                            <span className="price">{product.price} DZD</span>
                        )}
                    </div>

                    {product.description && (
                        <p className="product-description">{product.description}</p>
                    )}

                    <div className="product-stock">
                        {product.stock > 0 ? (
                            <span className="in-stock">✓ In Stock ({product.stock} available)</span>
                        ) : (
                            <span className="out-of-stock">✗ Out of Stock</span>
                        )}
                    </div>

                    {/* SIZES */}
                    {product.size && product.size.length > 0 && (
                        <div className="size-section">
                            <h4>Select Size</h4>
                            <div className="size-options">
                                {product.size.map((size, index) => (
                                    <button
                                        key={index}
                                        className={`size-option ${selectedSize === size ? 'active' : ''}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* COLORS */}
                    {product.color && product.color.length > 0 && (
                        <div className="color-section">
                            <h4>Select Color</h4>
                            <div className="color-options">
                                {product.color.map((color, index) => (
                                    <button
                                        key={index}
                                        className={`color-option ${selectedColor === color ? 'active' : ''}`}
                                        style={{ backgroundColor: color.toLowerCase() }}
                                        onClick={() => setSelectedColor(color)}
                                        title={color}
                                    >
                                        {selectedColor === color && <span className="check-mark">✓</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* QUANTITY */}
                    <div className="quantity-section">
                        <h4>Quantity</h4>
                        <div className="quantity-controls">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                            >
                                -
                            </button>
                            <span>{quantity}</span>
                            <button
                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                disabled={quantity >= product.stock}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* MESSAGE */}
                    {cartMsg && (
                        <div className={`message ${cartMsg.includes("success") ? "success" : "error"}`}>
                            {cartMsg}
                        </div>
                    )}

                    {/* BUTTONS */}
                    <div className="action-buttons">
                        <button
                            className="add-to-cart-btn"
                            onClick={handleAddToCart}
                            disabled={cartLoading || product.stock === 0}
                        >
                            {cartLoading ? "Adding..." : "Add to Cart"}
                        </button>
                        <button
                            className="buy-now-btn"
                            onClick={handleBuyNow}
                            disabled={product.stock === 0}
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>

            {/* ORDER FORM MODAL */}
            {showOrderForm && (
                <div className="modal-overlay" onClick={() => setShowOrderForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Complete Your Order</h2>
                            <button className="close-btn" onClick={() => setShowOrderForm(false)}>×</button>
                        </div>

                        <div className="order-summary">
                            <h3>Order Summary</h3>
                            <div className="summary-item">
                                <span>{product.name}</span>
                                <span>{product.price} DZD</span>
                            </div>
                            {selectedSize && (
                                <div className="summary-item">
                                    <span>Size</span>
                                    <span>{selectedSize}</span>
                                </div>
                            )}
                            {selectedColor && (
                                <div className="summary-item">
                                    <span>Color</span>
                                    <span>{selectedColor}</span>
                                </div>
                            )}
                            <div className="summary-item">
                                <span>Quantity</span>
                                <span>x {quantity}</span>
                            </div>
                            <div className="summary-total">
                                <strong>Total</strong>
                                <strong>{product.price * quantity} DZD</strong>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitOrder} className="order-form">
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={orderForm.fullName}
                                    onChange={handleOrderFormChange}
                                    required
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={orderForm.email}
                                    onChange={handleOrderFormChange}
                                    required
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={orderForm.phoneNumber}
                                    onChange={handleOrderFormChange}
                                    required
                                    placeholder="Enter your phone number"
                                />
                            </div>

                            <div className="form-group">
                                <label>Address *</label>
                                <textarea
                                    name="address"
                                    value={orderForm.address}
                                    onChange={handleOrderFormChange}
                                    required
                                    placeholder="Enter your full address"
                                    rows="2"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={orderForm.city}
                                        onChange={handleOrderFormChange}
                                        placeholder="Your city"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Delivery Method *</label>
                                    <select
                                        name="deliveryMethod"
                                        value={orderForm.deliveryMethod}
                                        onChange={handleOrderFormChange}
                                        required
                                    >
                                        <option value="domicile">Home Delivery</option>
                                        <option value="yalidine">Yalidine</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Additional Notes</label>
                                <textarea
                                    name="notes"
                                    value={orderForm.notes}
                                    onChange={handleOrderFormChange}
                                    placeholder="Any special requests or notes..."
                                    rows="2"
                                />
                            </div>

                            <button
                                type="submit"
                                className="submit-order-btn"
                                disabled={orderLoading}
                            >
                                {orderLoading ? "Processing..." : `Place Order • ${product.price * quantity} DZD`}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductDetails;