import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AddProperty from "./pages/AddProperty";
import MapPage from "./pages/MapPage";
import PropertyDetail from "./pages/PropertyDetail";
import Favorites from "./pages/Favorites";
import MyProperties from "./pages/MyProperties";
import EditProperty from "./pages/EditProperty";
import MyInquiries from "./pages/MyInquiries";
import MyMessages from "./pages/MyMessages";
import SellerDashboard from "./pages/SellerDashboard";
import { CompareProvider } from "./context/CompareContext";
import CompareProperties from "./pages/CompareProperties";
import SellerInquiries from "./pages/SellerInquiries";
import ProtectedRoute from "./components/ProtectedRoute";
import SellerRoute from "./components/SellerRoute";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import Notifications from "./pages/Notifications";
import RecentlyViewed from "./pages/RecentlyViewed";
function App() {
  return (
    <CompareProvider>
      <Router>
        <div className="bg-[#090f1d] min-h-screen text-white flex flex-col justify-between">
          <div className="w-full">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/map" element={<MapPage />} />
              <Route
                path="/add-property"
                element={
                  <SellerRoute>
                    <AddProperty />
                  </SellerRoute>
                }
              />
              <Route path="/property/:id" element={<PropertyDetail />} />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-properties"
                element={
                  <SellerRoute>
                    <MyProperties />
                  </SellerRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/recently-viewed" element={<RecentlyViewed />} />
              <Route
                path="/my-inquiries"
                element={
                  <ProtectedRoute>
                    <MyInquiries />
                  </ProtectedRoute>
                }
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />
              <Route
                path="/verify-email/:token"
                element={<VerifyEmail />}
              />
              <Route path="/edit-property/:id" element={<EditProperty />} />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <MyMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <SellerRoute>
                    <SellerDashboard />
                  </SellerRoute>
                }
              />
              <Route path="/compare" element={<CompareProperties />} />
              <Route
                path="/seller-inquiries"
                element={
                  <SellerRoute>
                    <SellerInquiries />
                  </SellerRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    </CompareProvider>
  );
}

export default App;
