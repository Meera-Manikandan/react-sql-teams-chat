import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error("Failed to parse user data:", error);
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  // Delete Account Function
  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone!"
      )
    ) {
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/auth/delete-user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: user.id }), // Sending user ID to delete
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        localStorage.clear();
        navigate("/");
      } else {
        alert(data.error || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  return (
    <div>
      <h1>Welcome, {user?.username || "Guest"}!</h1>
      <button
        onClick={() => {
          localStorage.clear();
          navigate("/");
        }}
      >
        Sign Out
      </button>
      <button
        onClick={handleDeleteAccount}
        style={{ marginLeft: "10px", backgroundColor: "red", color: "white" }}
      >
        Delete Account
      </button>
    </div>
  );
}

export default Dashboard;
