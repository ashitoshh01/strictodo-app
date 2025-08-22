
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import AddTask from "./pages/AddTask";
import SubmitProof from "./pages/SubmitProof";
import Rewards from "./pages/Rewards";
import Settings from "./pages/Settings";
import Shop from "./pages/Shop";
import ShopProduct from "./pages/ShopProduct";
import ShopCart from "./pages/ShopCart";
import ShopCheckout from "./pages/ShopCheckout";
import ShopOrders from "./pages/ShopOrders";
import NotFound from "./pages/NotFound";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-task"
                element={
                  <ProtectedRoute>
                    <AddTask />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/submit-proof/:taskId"
                element={
                  <ProtectedRoute>
                    <SubmitProof />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rewards"
                element={
                  <ProtectedRoute>
                    <Rewards />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              
              {/* Shop Routes */}
              <Route
                path="/shop"
                element={
                  <ProtectedRoute>
                    <Shop />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shop/product/:id"
                element={
                  <ProtectedRoute>
                    <ShopProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shop/cart"
                element={
                  <ProtectedRoute>
                    <ShopCart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shop/checkout"
                element={
                  <ProtectedRoute>
                    <ShopCheckout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shop/orders"
                element={
                  <ProtectedRoute>
                    <ShopOrders />
                  </ProtectedRoute>
                }
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
