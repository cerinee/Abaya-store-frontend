import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signin from "./Signin";
import Signup from "./Signup";
import ForgotPassword from "./forgotpassword";
import Home from "./Home";
import Abayas from "./Products";
import Cart from "./cart";
import ProductDetails from "./productdetails";
import Admin from "./admin";
import Orders from "./order";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                element={<Home />} />
        <Route path="/Abayas"          element={<Abayas />} />
        <Route path="/products/:id"    element={<ProductDetails />} />
        <Route path="/Cart"            element={<Cart />} />
        <Route path="/order"           element={<Orders />} />
        <Route path="/admin"           element={<Admin />} />
        <Route path="/signin"          element={<Signin />} />
        <Route path="/signup"          element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
