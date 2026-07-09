import { Navigate } from "react-router-dom";

const SellerRoute = ({ children }) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  if (userInfo.role !== "seller") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default SellerRoute;