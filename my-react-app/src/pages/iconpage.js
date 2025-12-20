import React from "react";
import Icon from "../components/icon/Icon"; // ✅ default import

function IconPage({ theme }) {
  return (
    <div
      className={`page ${theme}`}
      style={{ textAlign: "center", padding: "20px" }}
    >
      <h2 style={{ marginBottom: "30px" }}>Analyst Icon</h2>

      {/* Only analyst icon */}
      <Icon size={50} color="#f4a261" />
    </div>
  );
}

export default IconPage;
