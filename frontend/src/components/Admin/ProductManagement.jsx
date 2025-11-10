import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  deleteProduct,
  fetchAdminProducts,
} from "../../redux/slices/adminProductSlice";
import { FiEdit } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import { toast } from "sonner";

const ProductManagement = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector(
    (state) => state.adminProducts
  );
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [skuSearchTerm, setSkuSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const openImageModal = (image) => {
    setSelectedImage(image);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setIsImageModalOpen(false);
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowConfirmModal(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  // const handleDelete = (id) => {
  //   if (window.confirm("Are you sure want to delete your product?")) {
  //     dispatch(deleteProduct(id));
  //   }
  // };

  // const confirmDelete = () => {
  //   if (productToDelete) {
  //     dispatch(deleteProduct(productToDelete));
  //     setProductToDelete(null);
  //     setShowConfirmModal(false);
  //   }
  // };

  const confirmDelete = () => {
    if (productToDelete) {
      dispatch(deleteProduct(productToDelete));
      toast.success("Product deleted successfully!");
      setProductToDelete(null);
      setShowConfirmModal(false);
    }
  };

  // Filter by search
  // const filteredProducts = products.filter((product) =>
  //   product.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );
  const filteredProducts = products.filter((product) => {
    const matchesName = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSKU = product.sku
      ?.toLowerCase()
      .includes(skuSearchTerm.toLowerCase());
    return matchesName && (!skuSearchTerm || matchesSKU);
  });

  // Sort logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) return <p>Error: {error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Product Management</h2>

      {/* Search + Sort */}
      <div className="mb-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        {/* Search by Name */}
        <input
          type="text"
          placeholder="Search by name..."
          className="border px-4 py-2 rounded-md shadow-sm w-full md:max-w-xs bg-white outline-0"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />

        {/* Search by SKU */}
        <input
          type="text"
          placeholder="Search by SKU..."
          className="border px-4 py-2 rounded-md shadow-sm w-full md:max-w-xs bg-white outline-0"
          value={skuSearchTerm}
          onChange={(e) => {
            setSkuSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />

        {/* Sort Select */}
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border px-4 py-2 rounded-md shadow-sm w-full md:w-auto bg-white outline-0"
        >
          <option value="">Sort by</option>
          <option value="name-asc">Name (A - Z)</option>
          <option value="name-desc">Name (Z - A)</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="price-desc">Price (High to Low)</option>
        </select>

        {/* Product Count */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-800">
          <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full shadow-inner p-2">
            {filteredProducts.length}
          </span>
          <span className="text-sm font-medium tracking-wide">
            Total Products
          </span>
        </div>
      </div>

      <div className="bg-white p-6 shadow-md rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                {/* <th className="py-3 px-6">#</th> */}
                <th className="py-3 px-6">Image</th>
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Price</th>
                <th className="py-3 px-6">Stock</th>
                {user.role === "admin" && (
                  <th className="py-3 px-6">Added by</th>
                )}
                <th className="py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product, index) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50 transition-all duration-200"
                  >
                    {/* <td className="py-3 px-6 font-medium text-gray-900">
                      {(currentPage - 1) * productsPerPage + index + 1}
                    </td>{" "} */}
                    {/* Serial number */}
                    <td className="py-3 px-6">
                      {product.images?.length > 0 && product.images[0].url ? (
                        <div className="group relative w-12 h-12">
                          <img
                            src={product.images[0].url}
                            alt={product.images[0].altText || product.name}
                            className="w-12 h-12 rounded object-cover border"
                          />
                          <div className="absolute z-10 hidden group-hover:block top-0 left-14 w-32 h-32 rounded shadow-lg border bg-white p-1">
                            <img
                              src={product.images[0].url}
                              alt={product.images[0].altText || product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-400 rounded border border-gray-300 text-xs">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-6 font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="py-3 px-6">₹{product.discountPrice}</td>
                    <td className="py-3 px-6">
                      <span
                        className={`px-2 py-1 text-xs rounded-full flex items-center justify-center gap-1 ${product.countInStock === 0
                          ? "bg-red-100 text-red-700"
                          : product.countInStock < 10
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                          }`}
                      >
                        {product.countInStock === 0
                          ? "Out of Stock"
                          : product.countInStock < 10
                            ? "Out of Stock Soon"
                            : "In Stock"}
                        <span className="font-semibold">
                          ({product.countInStock})
                        </span>
                      </span>
                    </td>
                    {user.role === "admin" && (
                      <td className="py-3 px-6">
                        <span className="text-[10px] sm:text-xs font-medium text-gray-600 flex flex-wrap flex-col justify-center items-center">
                          <strong>
                            {product.user.name}
                          </strong>
                          <span className={`text-xs font-semibold text-white rounded-full px-2 py-0.5
          ${product.user?.role === "admin"
                              ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"
                              : product.user?.role === "merchantise"
                                ? "bg-gradient-to-r from-lime-500 via-green-500 to-teal-500"
                                : "bg-gray-400"
                            }`}>
                            {product.user?.role === "admin" ? "Admin" : product.user?.role === "merchantise" ? "Merchandise" : "Unknown"}
                          </span>
                        </span>
                      </td>
                    )}



                    <td className="py-3 px-6 space-x-2">
                      <Link
                        to={`/admin/products/${product._id}/edit`}
                        className="inline-block bg-yellow-500 text-white px-4 py-1.5 rounded hover:bg-yellow-600"
                      >
                        <FiEdit className="inline" /> Edit
                      </Link>
                      <button
                        onClick={() => {
                          setProductToDelete(product._id);
                          setShowConfirmModal(true);
                        }}
                        className="inline-block bg-red-500 text-white px-4 py-1.5 rounded hover:bg-red-600"
                      >
                        <FaTrash className="inline" /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 px-6 text-center text-gray-500 italic"
                  >
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {showConfirmModal && (
            <div
              className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 animate-fade-in"
              onClick={() => setShowConfirmModal(false)}
            >
              <div
                className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full animate-fade-in-slow"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Confirm Deletion
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete this product? This action
                  cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 text-sm rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-full ${currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
