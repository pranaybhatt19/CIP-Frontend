import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const decodeToken = () => {
  const token = localStorage.getItem("token") || "";
  if (token) {
    try {
      const decoded = jwtDecode(token);
      return decoded;
    } catch (err) {
      toast.error(err && err.message && "Invalid token");
    }
  }
};

export { decodeToken };
