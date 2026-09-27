import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, ShoppingBag, ShoppingCart, ChevronDown } from "lucide-react";

import { Button } from "../../components/ui/button";

import { Card, CardContent } from "../../components/ui/card";

import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const API_URL = "http://localhost:3001";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: string;
  brandId: string;
}

interface Brand {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  status: string;
  followersCount: number;
  products: Product[];
}

interface StorefrontSettings {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  buttonStyle: string;
  layout: string;
  heroTitle: string;
  heroDescription: string;
  logoUrl: string;
  bannerUrl: string;
}

const defaultSettings: StorefrontSettings = {
  primaryColor: "#000000",
  secondaryColor: "#ffffff",
  backgroundColor: "#ffffff",
  textColor: "#111111",
  fontFamily: "Inter",
  buttonStyle: "rounded",
  layout: "grid",
  heroTitle: "Welcome to our store",
  heroDescription: "Discover our latest collection.",
  logoUrl: "",
  bannerUrl: "",
};

export default function Storefront() {
  const { brandId } = useParams();

  const { addToCart, itemCount } = useCart();

  const { user } = useAuth();

  const [brand, setBrand] = useState<Brand | null>(null);

  const [settings, setSettings] = useState<StorefrontSettings>(defaultSettings);

  const [following, setFollowing] = useState(false);

  const [loading, setLoading] = useState(true);

  const [followLoading, setFollowLoading] = useState(false);

  const [error, setError] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /*
   * =========================
   * LOAD STOREFRONT SETTINGS
   * =========================
   */

  useEffect(() => {
    if (!brandId) {
      return;
    }

    const storageKey = `vaa_storefront_settings_${brandId}`;
    const savedSettings = localStorage.getItem(storageKey);

    if (!savedSettings) {
      return;
    }

    try {
      const parsedSettings = JSON.parse(savedSettings);

      setSettings({
        ...defaultSettings,
        ...parsedSettings,
      });
    } catch (error) {
      console.error("Failed to load storefront settings:", error);
    }
  }, [brandId]);

//  load brand

  useEffect(() => {
    if (!brandId) {
      setError("No brand ID was provided.");

      setLoading(false);

      return;
    }

    const loadStorefront = async () => {
      try {
        setLoading(true);

        setError("");

        const response = await fetch(
          `${API_URL}/api/products/brand/${brandId}`,
        );

        const responseText = await response.text();

        let data: any;

        try {
          data = JSON.parse(responseText);
        } catch {
          console.error("Invalid API response:", responseText);

          throw new Error("The API returned an invalid response.");
        }

        if (!response.ok) {
          throw new Error(data.error || "Failed to load storefront");
        }

        // Check if brand is approved
        if (data.status !== 'APPROVED') {
          throw new Error('This brand is not currently active');
        }

        setBrand(data);
      } catch (error: any) {
        console.error("Storefront loading error:", error);

        setError(error.message || "Failed to load storefront");
      } finally {
        setLoading(false);
      }
    };

    loadStorefront();
  }, [brandId]);

  /*
   * =========================
   * CHECK FOLLOW STATUS
   * =========================
   */

  useEffect(() => {
    if (!brandId || !user || user.role !== "CUSTOMER") {
      return;
    }

    const checkFollowStatus = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const response = await fetch(
          `${API_URL}/api/brands/${brandId}/follow`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setFollowing(data.following);
      } catch (error) {
        console.error("Follow status error:", error);
      }
    };

    checkFollowStatus();
  }, [brandId, user]);

//  follow brand

  const handleFollow = async () => {
    if (!brandId) {
      return;
    }

    if (!user) {
      alert("Please sign in to follow brands.");

      return;
    }

    if (user.role !== "CUSTOMER") {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please sign in to follow brands.");

      return;
    }

    try {
      setFollowLoading(true);

      const response = await fetch(`${API_URL}/api/brands/${brandId}/follow`, {
        method: following ? "DELETE" : "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update follow status");
      }

      const wasFollowing = following;

      setFollowing(data.following);

      setBrand((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,

          followersCount: current.followersCount + (wasFollowing ? -1 : 1),
        };
      });
    } catch (error: any) {
      console.error("Follow error:", error);

      alert(error.message || "Something went wrong");
    } finally {
      setFollowLoading(false);
    }
  };

  // loading

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <p className="text-muted">Loading storefront...</p>
      </div>
    );
  }

// error

  if (error || !brand) {
    return (
      <div className="container py-5 text-center">
        <h2 className="mb-3">Storefront not found</h2>

        <p className="text-muted mb-4">
          {error || "This brand does not exist."}
        </p>

        <Button asChild>
          <Link to="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }

// store button style

  const buttonRadius = settings.buttonStyle === "rounded" ? "999px" : "4px";

// Storefront

  return (
    <div
      style={{
        backgroundColor: settings.backgroundColor,

        color: settings.textColor,

        fontFamily: settings.fontFamily,

        minHeight: "100vh",
      }}
    >
     {/* navbar */}

      <div
        className="border-bottom"
        style={{
          backgroundColor: settings.secondaryColor,

          color: settings.textColor,
        }}
      >
        <div className="container py-3">
          <div className="d-flex justify-content-between align-items-center">
            <Link
              to={`/brand/${brand.id}`}
              className="text-decoration-none"
              style={{
                color: settings.textColor,
              }}
            >
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={brand.name}
                  style={{
                    maxHeight: "45px",
                    maxWidth: "150px",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <span className="fw-bold fs-5">{brand.name}</span>
              )}
            </Link>

            <div className="d-flex gap-4 align-items-center">
              <Link
                to="/cart"
                className="text-decoration-none position-relative p-2 d-flex align-items-center justify-content-center"
                style={{
                  color: settings.textColor,
                }}
                aria-label={`Shopping cart with ${itemCount} ${
                  itemCount === 1 ? "item" : "items"
                }`}
              >
                <ShoppingCart size={21} />

                {itemCount > 0 && (
                  <span
                    className="position-absolute badge rounded-pill bg-danger"
                    style={{
                      top: "0px",
                      right: "-2px",
                      fontSize: "10px",
                      minWidth: "18px",
                      height: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 4px",
                    }}
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>

              {/* Desktop Navigation */}
              <div className="d-none d-md-flex gap-4">
                <a
                  href="#products"
                  className="text-decoration-none"
                  style={{
                    color: settings.textColor,
                  }}
                >
                  Collection
                </a>
                <Link
                  to="/shop"
                  className="text-decoration-none"
                  style={{
                    color: settings.textColor,
                  }}
                >
                  <span>←</span> Back to Shop
                </Link>
              </div>

              {/* Mobile Navigation */}
              <div className="d-md-none position-relative" ref={menuRef}>
                <button
                  type="button"
                  className="btn btn-link text-decoration-none d-flex align-items-center gap-1"
                  onClick={() => setMenuOpen((current) => !current)}
                  style={{
                    color: settings.textColor,
                  }}
                >
                  Menu
                  <ChevronDown
                    size={16}
                    style={{
                      transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </button>

                {menuOpen && (
                  <div
                    className="position-absolute end-0 mt-2 border rounded-3 shadow-lg overflow-hidden"
                    style={{
                      minWidth: "200px",
                      zIndex: 1050,
                      backgroundColor: settings.secondaryColor,
                    }}
                  >
                    <a
                      href="#products"
                      className="dropdown-item text-decoration-none py-2 px-3"
                      style={{
                    color: settings.textColor,
                  }}
                      onClick={() => setMenuOpen(false)}
                    >
                      Shop Collection
                    </a>
                    <Link
                      to="/shop"
                      className="dropdown-item text-decoration-none py-2 px-3"
                      style={{
                    color: settings.textColor,
                  }}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span>←</span> Back to Shop
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          HERO
      ========================== */}

      <section
        style={{
          backgroundImage: settings.bannerUrl
            ? `url(${settings.bannerUrl})`
            : undefined,

          backgroundSize: "cover",

          backgroundPosition: "center",

          backgroundColor: settings.primaryColor,
        }}
      >
        <div
          className="py-5"
          style={{
            background: settings.bannerUrl ? "rgba(0,0,0,0.45)" : "transparent",

            color: settings.bannerUrl ? "#ffffff" : settings.secondaryColor,
          }}
        >
          <div className="container py-5">
            <div className="d-flex flex-column align-items-center justify-content-center gap-4 text-center">
              <div
                style={{
                  maxWidth: "700px",
                }}
              >
                <p className="mb-2 opacity-75">
                  {brand.category || "Fashion Brand"}
                </p>

                <h1 className="display-4 fw-bold mb-3">{settings.heroTitle}</h1>

                <p className="lead mb-4">{settings.heroDescription}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Info */}

      <section id="about" className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <p
                className="text-uppercase small fw-bold mb-2"
                style={{
                  color: settings.textColor,
                }}
              >
                About the brand
              </p>

              <h2 className="fw-bold">{brand.name}</h2>

              {brand.description && (
                <p
                  className="mb-0"
                  style={{
                    color: settings.textColor,
                    opacity: 0.7,
                  }}
                >
                  {brand.description}
                </p>
              )}
            </div>

            <div className="col-lg-4 mt-4 mt-lg-0">
              <div className="d-flex gap-4">
                <div>
                  <strong className="d-block fs-4">
                    {brand.products.length}
                  </strong>

                  <span className="small opacity-75">Products</span>
                </div>

                <div>
                  <strong className="d-block fs-4">
                    {brand.followersCount}
                  </strong>

                  <span className="small opacity-75">Followers</span>
                </div>

                {/* FOLLOW */}

                {user?.role === "CUSTOMER" && (
                  <Button
                    onClick={handleFollow}
                    disabled={followLoading}
                    variant={following ? "secondary" : "default"}
                    style={{
                      borderRadius: buttonRadius,
                    }}
                  >
                    <Heart
                      size={18}
                      className="me-2"
                      fill={following ? "currentColor" : "none"}
                    />

                    {followLoading
                      ? "Loading..."
                      : following
                        ? "Following"
                        : "Follow"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}

      <section id="products" className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold mb-0">Latest Collection</h2>

            <span className="opacity-75">
              {brand.products.length}{" "}
              {brand.products.length === 1 ? "item" : "items"}
            </span>
          </div>

          {brand.products.length === 0 ? (
            <div className="text-center py-5 border rounded">
              <ShoppingBag size={42} className="mb-3" />

              <h3 className="h5">No products yet</h3>

              <p className="opacity-75 mb-0">
                This brand hasn't added any products yet.
              </p>
            </div>
          ) : (
            <div
              className={
                settings.layout === "grid"
                  ? "row g-4"
                  : "d-flex flex-column gap-4"
              }
            >
              {brand.products.map((product) => (
                <div
                  key={product.id}
                  className={
                    settings.layout === "grid"
                      ? "col-12 col-sm-6 col-lg-4 col-xl-3"
                      : ""
                  }
                >
                  <Card
                    className="h-100 overflow-hidden"
                    style={{
                      backgroundColor: settings.secondaryColor,

                      color: settings.textColor,

                      border: "1px solid rgba(0,0,0,0.1)",
                    }}
                  >
                    <Link
                      to={`/product/${product.id}`}
                      className="text-decoration-none"
                    >
                      <div
                        style={{
                          aspectRatio: "1 / 1",

                          background: "#f5f5f5",
                        }}
                      >
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-100 h-100"
                            style={{
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                            No image
                          </div>
                        )}
                      </div>
                    </Link>

                    <CardContent className="p-3">
                      <Link
                        to={`/product/${product.id}`}
                        className="text-decoration-none"
                        style={{
                          color: settings.textColor,
                        }}
                      >
                        <h3 className="h6 mb-1">{product.name}</h3>
                      </Link>

                      <p
                        className="fw-bold mb-2"
                        style={{
                          color: settings.primaryColor,
                        }}
                      >
                        KSh {Number(product.price).toLocaleString()}
                      </p>

                      <p className="small opacity-75 mb-3">
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </p>

                      <button
                        type="button"
                        className="btn w-100"
                        disabled={product.stock <= 0}
                        onClick={() =>
                          addToCart({
                            id: product.id,

                            name: product.name,

                            price: Number(product.price),

                            imageUrl: product.imageUrl,

                            category: product.category,

                            brandId: product.brandId,

                            brandName: brand.name,

                            brandStatus: brand.status,

                            stock: product.stock,
                          })
                        }
                        style={{
                          backgroundColor: settings.primaryColor,

                          color: settings.secondaryColor,

                          border: "none",

                          borderRadius: buttonRadius,
                        }}
                      >
                        <ShoppingBag size={17} className="me-2" />

                        {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                      </button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}

      <footer
        className="py-4 border-top"
        style={{
          backgroundColor: settings.secondaryColor,
        }}
      >
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <strong>{brand.name}</strong>

            <span className="small opacity-75">
              {brand.followersCount}{" "}
              {brand.followersCount === 1 ? "follower" : "followers"}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
