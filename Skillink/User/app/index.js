import React from "react";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
