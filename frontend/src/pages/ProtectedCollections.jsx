// ProtectedCollections.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import CollectionPage from "./CollectionPage";

const ProtectedCollections = () => {
  const [collabActive, setCollabActive] = useState(null);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/collabs/active`)
      .then((res) => {
        setCollabActive(res.data.isActive);
      })
      .catch((err) => {
        console.error("Error checking active collab:", err);
        setCollabActive(false); // default to allow if error
      });
  }, []);

  if (collabActive === null) return <div className="text-center p-8">Checking...</div>;

  if (collabActive === true) return <Navigate to="/404" />;

  return <CollectionPage/>;
};

export default ProtectedCollections;
