import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // v4 uses named import
import { toast } from "react-toastify";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp && decoded.exp < currentTime) {
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    toast.error(error && error.message);
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
