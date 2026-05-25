import { Navigate } from "react-router";

// Root redirect — actual storefront is at /customer/Home
export default function RootRedirect() {
  return <Navigate to="/" replace />;
}
