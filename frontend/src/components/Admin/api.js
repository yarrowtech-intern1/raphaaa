import axios from "axios";

export const addProduct = async (formData, token) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // send admin token
    },
  };

  const response = await axios.post("/api/products", formData, config);
  return response.data;
};
