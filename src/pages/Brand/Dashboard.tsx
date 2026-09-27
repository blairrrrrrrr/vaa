import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Store,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  AlertCircle,
  UserX,
} from "lucide-react";

import Navbar from "../../components/Navbar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useAuth } from "../../context/AuthContext";
import StoreFrontCustomizer from "../Brand/StoreFrontCustomizer";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  category: string;
  brandId: string;
  createdAt: string;
  updatedAt: string;
}

interface Brand {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  products: Product[];
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  imageUrl: string;
  imageFile: File | null;
}

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  imageUrl: "",
  imageFile: null,
};

export default function BrandDashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [form, setForm] = useState<ProductForm>(emptyForm);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth/signin", { replace: true });
      return;
    }

    if (!authLoading && user?.role !== "BRAND") {
      navigate("/shop", { replace: true });
      return;
    }

    if (!authLoading && user?.role === "BRAND") {
      loadBrand();
    }
  }, [user, authLoading]);

  const loadBrand = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/auth/signin", { replace: true });
        return;
      }

      const response = await fetch(`${API_URL}/api/brand/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("brand");

        navigate("/auth/signin", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to load brand");
      }

      setBrand(data);
    } catch (err: any) {
      setError(err.message || "Failed to load brand dashboard");
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: keyof ProductForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingProduct(null);
    setShowAddProduct(false);
  };

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Use requestAnimationFrame to prevent blocking
      requestAnimationFrame(() => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            requestAnimationFrame(() => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');

              if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
              }

              // Calculate new dimensions (max 800x800)
              const maxSize = 800;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > maxSize) {
                  height *= maxSize / width;
                  width = maxSize;
                }
              } else {
                if (height > maxSize) {
                  width *= maxSize / height;
                  height = maxSize;
                }
              }

              canvas.width = width;
              canvas.height = height;

              ctx.drawImage(img, 0, 0, width, height);

              // Compress to JPEG with 0.7 quality
              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
              resolve(compressedDataUrl);
            });
          };
          img.onerror = () => reject(new Error('Failed to load image'));
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
      });
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be less than 5MB');
      return;
    }

    try {
      setSubmitting(true);
      const compressedImage = await compressImage(file);
      setForm((prev) => ({
        ...prev,
        imageUrl: compressedImage,
        imageFile: file,
      }));
      setError('');
    } catch (err) {
      setError('Failed to process image. Please try another file.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not authenticated");
      }

      const response = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          stock: Number(form.stock),
          category: form.category.trim(),
          imageUrl: form.imageUrl || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      await loadBrand();
      resetForm();
    } catch (err: any) {
      setError(err.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);

    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      imageUrl: product.imageUrl || "",
      imageFile: null,
    });

    setShowAddProduct(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProduct) return;

    try {
      setSubmitting(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not authenticated");
      }

      const response = await fetch(
        `${API_URL}/api/products/${editingProduct.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim(),
            price: Number(form.price),
            stock: Number(form.stock),
            category: form.category.trim(),
            imageUrl: form.imageUrl || null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update product");
      }

      await loadBrand();
      resetForm();
    } catch (err: any) {
      setError(err.message || "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) return;

    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not authenticated");
      }

      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete product");
      }

      if (editingProduct?.id === productId) {
        resetForm();
      }

      await loadBrand();
    } catch (err: any) {
      setError(err.message || "Failed to delete product");
    }
  };

   

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your brand data, products, and account information."
    );

    if (!confirmed) return;

    try {
      setError("");
      setSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not authenticated");
      }

      const response = await fetch(`${API_URL}/api/user/delete-account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        console.error('Invalid JSON response:', responseText);
        console.error('Response status:', response.status);
        console.error('Response headers:', response.headers);
        throw new Error(`Server returned an invalid response (Status: ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      // Clear all local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("brand");

      // Clear all storefront settings
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('vaa_storefront_settings_')) {
          localStorage.removeItem(key);
        }
      });
      const handleSignOut = () => {
      signOut()
      navigate('/')
    }


      // Navigate to home
      handleSignOut();
    } catch (err: any) {
      setError(err.message || "Failed to delete account");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />

        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>

            <p className="text-secondary">Loading your brand dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  if (!brand) {
    return (
      <>
        <Navbar />

        <div className="container py-5">
          <Card>
            <CardContent className="py-5 text-center">
              <Store
                className="mx-auto mb-3 text-secondary"
                style={{
                  width: 48,
                  height: 48,
                }}
              />

              <h2 className="h4 fw-bold">Brand not found</h2>

              <p className="text-secondary mb-4">
                We couldn't find a brand associated with your account.
              </p>

              <Button onClick={loadBrand}>
                <RefreshCw
                  style={{
                    width: 16,
                    height: 16,
                    marginRight: 8,
                  }}
                />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const products = brand.products || [];

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) => total + product.stock,
    0,
  );

  const outOfStock = products.filter((product) => product.stock === 0).length;

  const lowStock = products.filter(
    (product) => product.stock > 0 && product.stock <= 5,
  ).length;

  const status = brand.status;

  const isPending = status === "PENDING";
  const isApproved = status === "APPROVED";
  const isRejected = status === "REJECTED";
  const isSuspended = status === "SUSPENDED";

  // Permissions based on status
  const canCompleteStorefront = isPending || isApproved;
  const canUploadProducts = isPending || isApproved;
  const canReceiveOrders = isApproved;
  const canAppearInMarketplace = isApproved;
  const canReceiveReviews = isApproved;

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      <main className="container py-4 py-md-5">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <p className="text-secondary mb-1">Brand Dashboard</p>

            <h1 className="h2 fw-bold mb-1">{brand.name}</h1>

            <p className="text-secondary mb-0">
              Manage your products and brand.
            </p>
          </div>

          <div className="d-flex gap-2">
            <Button variant="outline" onClick={loadBrand} disabled={loading}>
              <RefreshCw
                style={{
                  width: 16,
                  height: 16,
                  marginRight: 6,
                }}
              />
              Refresh
            </Button>

            <Button
              onClick={() => {
                if (!canUploadProducts) {
                  setError("You cannot upload products in your current status");
                  return;
                }
                setEditingProduct(null);
                setForm(emptyForm);
                setShowAddProduct(!showAddProduct);
              }}
              disabled={!canUploadProducts}
              style={{
                background: "linear-gradient(to right, #6f42c1, #d63384)",
                border: "none",
                color: "white",
              }}
            >
              <Plus
                style={{
                  width: 16,
                  height: 16,
                  marginRight: 6,
                }}
              />
              Add Product
            </Button>

            <Button
              variant="outline"
              onClick={handleDeleteAccount}
              disabled={submitting}
              className="text-danger"
            >
              <UserX
                style={{
                  width: 16,
                  height: 16,
                  marginRight: 6,
                }}
              />
              Delete Account
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="alert alert-danger d-flex align-items-center justify-content-between"
            role="alert"
          >
            <span>{error}</span>

            <button
              type="button"
              className="btn-close"
              onClick={() => setError("")}
            />
          </div>
        )}

        {/* Brand status */}
        <Card className="mb-4">
          <CardContent className="py-3">
            <div className="d-flex align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                {isApproved ? (
                  <CheckCircle
                    className="text-success"
                    style={{
                      width: 24,
                      height: 24,
                    }}
                  />
                ) : isRejected ? (
                  <XCircle
                    className="text-danger"
                    style={{
                      width: 24,
                      height: 24,
                    }}
                  />
                ) : isSuspended ? (
                  <XCircle
                    className="text-warning"
                    style={{
                      width: 24,
                      height: 24,
                    }}
                  />
                ) : (
                  <Clock
                    className="text-warning"
                    style={{
                      width: 24,
                      height: 24,
                    }}
                  />
                )}

                <div>
                  <div className="fw-semibold">Brand status</div>

                  <div className="small text-secondary">
                    {isApproved
                      ? "Your brand is approved and active. You can sell products and receive orders."
                      : isRejected
                        ? "Your brand application was rejected. Please contact support for more information."
                        : isSuspended
                          ? "Your brand is suspended. Storefront restricted and new orders disabled."
                          : "Your brand is pending approval. You can complete your storefront setup, but orders are disabled."}
                  </div>
                </div>
              </div>

              <span
                className={`badge ${
                  isApproved
                    ? "text-bg-success"
                    : isRejected
                      ? "text-bg-danger"
                      : isSuspended
                        ? "text-bg-warning"
                        : "text-bg-secondary"
                }`}
              >
                {brand.status}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-4">
            <Card>
              <CardContent className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-secondary small mb-1">Products</p>

                    <h2 className="h3 fw-bold mb-0">{totalProducts}</h2>
                  </div>

                  <div className="p-3 rounded bg-light">
                    <Package
                      style={{
                        width: 22,
                        height: 22,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-12 col-sm-6 col-lg-4">
            <Card>
              <CardContent className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-secondary small mb-1">Total Stock</p>

                    <h2 className="h3 fw-bold mb-0">{totalStock}</h2>
                  </div>

                  <div className="p-3 rounded bg-light">
                    <Store
                      style={{
                        width: 22,
                        height: 22,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-12 col-sm-6 col-lg-4">
            <Card>
              <CardContent className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-secondary small mb-1">Stock Alerts</p>

                    <h2 className="h3 fw-bold mb-0">{outOfStock + lowStock}</h2>

                    <p className="small text-secondary mb-0">
                      {outOfStock} out of stock · {lowStock} low stock
                    </p>
                  </div>

                  <div className="p-3 rounded bg-light">
                    <Package
                      style={{
                        width: 22,
                        height: 22,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Permissions Info */}
        {!isApproved && (
          <Card className="mb-4" style={{ backgroundColor: isSuspended ? '#fff3cd' : '#e7f3ff' }}>
            <CardContent className="py-3">
              <div className="d-flex align-items-start gap-3">
                <div className="flex-shrink-0">
                  {isSuspended ? (
                    <AlertCircle className="text-warning" style={{ width: 20, height: 20 }} />
                  ) : (
                    <Clock className="text-info" style={{ width: 20, height: 20 }} />
                  )}
                </div>
                <div className="flex-grow-1">
                  <div className="fw-semibold mb-1">
                    {isSuspended ? 'Account Suspended' : 'Account Pending Approval'}
                  </div>
                  <div className="small mb-2">
                    {isSuspended
                      ? 'Your storefront is restricted and new orders are disabled while under investigation.'
                      : 'You can complete your storefront setup and upload products, but you cannot receive customer orders until approved.'}
                  </div>
                  <div className="small text-secondary">
                    <strong>Current permissions:</strong>
                    <ul className="mb-0 mt-1 ps-3">
                      <li>{canCompleteStorefront ? '✓ Can complete storefront' : '✗ Cannot complete storefront'}</li>
                      <li>{canUploadProducts ? '✓ Can upload products' : '✗ Cannot upload products'}</li>
                      <li>{canReceiveOrders ? '✓ Can receive customer orders' : '✗ Cannot receive customer orders'}</li>
                      <li>{canAppearInMarketplace ? '✓ Can appear in marketplace discovery' : '✗ Cannot appear in marketplace discovery'}</li>
                      <li>{canReceiveReviews ? '✓ Can receive reviews' : '✗ Cannot receive reviews'}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
       

        {/* Add Product */}
        {showAddProduct && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>

              <CardDescription>
                Add a product to your VAA storefront.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleAddProduct}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <Label htmlFor="product-name">Product Name</Label>

                    <Input
                      id="product-name"
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                      placeholder="e.g. Oversized Graphic Tee"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <Label htmlFor="product-price">Price</Label>

                    <Input
                      id="product-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => updateForm("price", e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="col-12">
                    <Label htmlFor="product-description">Description</Label>

                    <Input
                      id="product-description"
                      value={form.description}
                      onChange={(e) =>
                        updateForm("description", e.target.value)
                      }
                      placeholder="Describe your product"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <Label htmlFor="product-category">Category</Label>

                    <Input
                      id="product-category"
                      value={form.category}
                      onChange={(e) => updateForm("category", e.target.value)}
                      placeholder="T-Shirts"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <Label htmlFor="product-stock">Stock</Label>

                    <Input
                      id="product-stock"
                      type="number"
                      min="0"
                      step="1"
                      value={form.stock}
                      onChange={(e) => updateForm("stock", e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <Label htmlFor="product-image">Product Image</Label>

                    <div className="d-flex flex-column gap-2">
                      <Input
                        id="product-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={submitting}
                      />

                      {form.imageUrl && (
                        <div className="mt-2">
                          <img
                            src={form.imageUrl}
                            alt="Product preview"
                            style={{
                              maxWidth: "200px",
                              maxHeight: "200px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        </div>
                      )}

                      <small className="text-secondary">
                        Maximum file size: 5MB. Images will be automatically compressed.
                      </small>
                    </div>
                  </div>

                  <div className="col-12 d-flex gap-2">
                    <Button
                      type="submit"
                      disabled={submitting}
                      style={{
                        background:
                          "linear-gradient(to right, #6f42c1, #d63384)",
                        border: "none",
                        color: "white",
                      }}
                    >
                      {submitting ? "Adding..." : "Add Product"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}



        {/* Edit Product */}
        {editingProduct && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Edit Product</CardTitle>

              <CardDescription>
                Update the details of {editingProduct.name}.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleUpdateProduct}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <Label htmlFor="edit-name">Product Name</Label>

                    <Input
                      id="edit-name"
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <Label htmlFor="edit-price">Price</Label>

                    <Input
                      id="edit-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => updateForm("price", e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <Label htmlFor="edit-description">Description</Label>

                    <Input
                      id="edit-description"
                      value={form.description}
                      onChange={(e) =>
                        updateForm("description", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <Label htmlFor="edit-category">Category</Label>

                    <Input
                      id="edit-category"
                      value={form.category}
                      onChange={(e) => updateForm("category", e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <Label htmlFor="edit-stock">Stock</Label>

                    <Input
                      id="edit-stock"
                      type="number"
                      min="0"
                      step="1"
                      value={form.stock}
                      onChange={(e) => updateForm("stock", e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <Label htmlFor="edit-image">Product Image</Label>

                    <div className="d-flex flex-column gap-2">
                      <Input
                        id="edit-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={submitting}
                      />

                      {form.imageUrl && (
                        <div className="mt-2">
                          <img
                            src={form.imageUrl}
                            alt="Product preview"
                            style={{
                              maxWidth: "200px",
                              maxHeight: "200px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        </div>
                      )}

                      <small className="text-secondary">
                        Maximum file size: 5MB. Images will be automatically compressed.
                      </small>
                    </div>
                  </div>

                  <div className="col-12 d-flex gap-2">
                    <Button
                      type="submit"
                      disabled={submitting}
                      style={{
                        background:
                          "linear-gradient(to right, #6f42c1, #d63384)",
                        border: "none",
                        color: "white",
                      }}
                    >
                      {submitting ? "Updating..." : "Update Product"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

         <div className="d-flex flex-column align-items-center">
          <p className="text-secondary fs-5 mb-1">
            Customize your brand storefront
          </p>

          {canCompleteStorefront ? (
            <StoreFrontCustomizer brandId={brand.id} />
          ) : (
            <Card className="w-100">
              <CardContent className="py-4 text-center">
                <XCircle className="text-secondary mx-auto mb-2" style={{ width: 32, height: 32 }} />
                <p className="text-secondary mb-0">Storefront customization is not available in your current status</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Products */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h2 className="h4 fw-bold mb-1">Your Products</h2>

            <p className="text-secondary small mb-0">
              {totalProducts === 0
                ? "You have not added any products yet."
                : `${totalProducts} product${totalProducts === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="py-5 text-center">
              <Package
                className="mx-auto mb-3 text-secondary"
                style={{
                  width: 48,
                  height: 48,
                }}
              />

              <h3 className="h5 fw-bold">No products yet</h3>

              <p className="text-secondary mb-4">
                Start building your storefront by adding your first product.
              </p>

              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setForm(emptyForm);
                  setShowAddProduct(true);
                }}
                style={{
                  background: "linear-gradient(to right, #6f42c1, #d63384)",
                  border: "none",
                  color: "white",
                }}
              >
                <Plus
                  style={{
                    width: 16,
                    height: 16,
                    marginRight: 6,
                  }}
                />
                Add Your First Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="d-flex flex-column gap-3">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="row g-0">
                    <div className="col-auto">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          style={{
                            width: 140,
                            height: 140,
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      ) : (
                        <div
                          className="d-flex align-items-center justify-content-center bg-light"
                          style={{
                            width: 140,
                            height: 140,
                          }}
                        >
                          <Package
                            className="text-secondary"
                            style={{
                              width: 36,
                              height: 36,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="col">
                      <div className="p-3">
                        <div className="d-flex align-items-start justify-content-between gap-3">
                          <div>
                            <h3 className="h5 fw-semibold mb-1">
                              {product.name}
                            </h3>

                            <p className="text-secondary small mb-1">
                              {product.category}
                            </p>

                            <p className="fw-bold mb-2">
                              KSh {Number(product.price).toLocaleString()}
                            </p>
                          </div>

                          <div className="d-flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditProduct(product)}
                              aria-label={`Edit ${product.name}`}
                            >
                              <Edit
                                style={{
                                  width: 16,
                                  height: 16,
                                }}
                              />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-danger"
                              onClick={() => handleDeleteProduct(product.id)}
                              aria-label={`Delete ${product.name}`}
                            >
                              <Trash2
                                style={{
                                  width: 16,
                                  height: 16,
                                }}
                              />
                            </Button>
                          </div>
                        </div>

                        <p className="small text-secondary mb-3">
                          {product.description}
                        </p>

                        <div className="d-flex flex-wrap gap-2">
                          <span
                            className={`badge ${
                              product.stock === 0
                                ? "text-bg-danger"
                                : product.stock <= 5
                                  ? "text-bg-warning"
                                  : "text-bg-success"
                            }`}
                          >
                            {product.stock === 0
                              ? "Out of stock"
                              : `${product.stock} in stock`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
