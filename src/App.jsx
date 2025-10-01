import AppRoutes from "./routes/routes";
import "./App.css";

import { ToastContainer } from "react-toastify";
const App = () => {
  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  );
};

export default App;
