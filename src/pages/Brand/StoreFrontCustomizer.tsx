import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import {
  Palette,
  Type,
  Image,
  Layout,
  Eye,
  Monitor,
  Smartphone,
  Save,
  RotateCcw,
  Check,
  ShoppingCart,
  ChevronDown,
} from "lucide-react";

import { Button } from "../../components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { useCart } from "../../context/CartContext";

interface StoreFrontSettings {
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

const defaultSettings: StoreFrontSettings = {
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

interface StoreFrontCustomizerProps {
  brandId: string;
}

export default function StoreFrontCustomizer({ brandId }: StoreFrontCustomizerProps) {
  const { itemCount } = useCart();

  const [settings, setSettings] = useState<StoreFrontSettings>(defaultSettings);

  const [previewMenuOpen, setPreviewMenuOpen] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");

  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop",
  );

  const [saving, setSaving] = useState(false);

  const [saved, setSaved] = useState(false);

  const storageKey = `vaa_storefront_settings_${brandId}`;

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      requestAnimationFrame(() => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = document.createElement('img');
          img.src = event.target?.result as string;
          img.onload = () => {
            requestAnimationFrame(() => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');

              if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
              }

              // Calculate new dimensions (max 1200x1200 for larger images)
              const maxSize = 1200;
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

              // Compress to JPEG with 0.8 quality for better quality
              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
              resolve(compressedDataUrl);
            });
          };
          img.onerror = () => reject(new Error('Failed to load image'));
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
      });
    });
  };

  const handleImageUpload = async (field: 'logoUrl' | 'bannerUrl', e: React.ChangeEvent<HTMLInputElement>) => {
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
      setUploading(true);
      setError('');
      const compressedImage = await compressImage(file);
      updateSetting(field, compressedImage);
    } catch (err) {
      setError('Failed to process image. Please try another file.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
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

  const updateSetting = <K extends keyof StoreFrontSettings>(
    key: K,
    value: StoreFrontSettings[K],
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      localStorage.setItem(storageKey, JSON.stringify(settings));

      await new Promise((resolve) => setTimeout(resolve, 300));

      setSaved(true);
    } catch (error) {
      console.error("Failed to save storefront:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem(storageKey);

    setSettings({
      ...defaultSettings,
    });

    setSaved(false);
  };

  return (
    <div className="container-fluid py-4">
      {/* =========================
          HEADER
      ========================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Storefront Customizer</h1>

          <p className="text-muted mb-0">
            Customize how your brand appears to customers.
          </p>

          {error && (
            <div className="alert alert-danger mt-2" role="alert">
              {error}
            </div>
          )}
        </div>

        <div className="d-flex gap-2 align-items-center">
          <Link
            to="/cart"
            className="btn btn-link text-decoration-none position-relative p-2 d-flex align-items-center justify-content-center"
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

          <Button variant="outline" onClick={handleReset}>
            <RotateCcw size={17} className="me-2" />
            Reset
          </Button>

          <Button onClick={handleSave} disabled={saving}>
            {saved ? (
              <>
                <Check size={17} className="me-2" />
                Saved
              </>
            ) : (
              <>
                <Save size={17} className="me-2" />

                {saving ? "Saving..." : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* =========================
          MAIN CONTENT
      ========================== */}

      <div className="row g-4">
        {/* =========================
            CUSTOMIZATION PANEL
        ========================== */}

        <div className="col-12 col-xl-5">
          {/* BRANDING */}

          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="d-flex align-items-center">
                <Image size={19} className="me-2" />
                Branding
              </CardTitle>
            </CardHeader>

            <CardContent>
              {/* LOGO */}

              <div className="mb-3">
                <Label>Logo Image</Label>

                <div className="d-flex flex-column gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload("logoUrl", e)}
                    disabled={uploading}
                  />

                  {settings.logoUrl && (
                    <div className="mt-2">
                      <img
                        src={settings.logoUrl}
                        alt="Logo preview"
                        style={{
                          maxWidth: "120px",
                          maxHeight: "60px",
                          objectFit: "contain",
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

              {/* BANNER */}

              <div className="mb-3">
                <Label>Banner Image</Label>

                <div className="d-flex flex-column gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload("bannerUrl", e)}
                    disabled={uploading}
                  />

                  {settings.bannerUrl && (
                    <div className="mt-2">
                      <img
                        src={settings.bannerUrl}
                        alt="Banner preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "150px",
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

              {/* HERO TITLE */}

              <div className="mb-3">
                <Label>Hero Title</Label>

                <Input
                  value={settings.heroTitle}
                  onChange={(e) => updateSetting("heroTitle", e.target.value)}
                  placeholder="Your brand headline"
                />
              </div>

              {/* HERO DESCRIPTION */}

              <div>
                <Label>Hero Description</Label>

                <Textarea
                  value={settings.heroDescription}
                  onChange={(e) =>
                    updateSetting("heroDescription", e.target.value)
                  }
                  rows={4}
                  placeholder="Tell customers about your brand..."
                />
              </div>
            </CardContent>
          </Card>

          {/* COLORS */}

          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="d-flex align-items-center">
                <Palette size={19} className="me-2" />
                Colors
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="row g-3">
                {/* PRIMARY */}

                <div className="col-12 col-md-6">
                  <Label>Primary Color</Label>

                  <div className="d-flex gap-2">
                    <Input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) =>
                        updateSetting("primaryColor", e.target.value)
                      }
                      style={{
                        width: "55px",
                        padding: "4px",
                      }}
                    />

                    <Input
                      value={settings.primaryColor}
                      onChange={(e) =>
                        updateSetting("primaryColor", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* SECONDARY */}

                <div className="col-12 col-md-6">
                  <Label>Accent Color</Label>

                  <div className="d-flex gap-2">
                    <Input
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) =>
                        updateSetting("secondaryColor", e.target.value)
                      }
                      style={{
                        width: "55px",
                        padding: "4px",
                      }}
                    />

                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) =>
                        updateSetting("secondaryColor", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* BACKGROUND */}

                <div className="col-12 col-md-6">
                  <Label>Background</Label>

                  <div className="d-flex gap-2">
                    <Input
                      type="color"
                      value={settings.backgroundColor}
                      onChange={(e) =>
                        updateSetting("backgroundColor", e.target.value)
                      }
                      style={{
                        width: "55px",
                        padding: "4px",
                      }}
                    />

                    <Input
                      value={settings.backgroundColor}
                      onChange={(e) =>
                        updateSetting("backgroundColor", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* TEXT */}

                <div className="col-12 col-md-6">
                  <Label>Text Color</Label>

                  <div className="d-flex gap-2">
                    <Input
                      type="color"
                      value={settings.textColor}
                      onChange={(e) =>
                        updateSetting("textColor", e.target.value)
                      }
                      style={{
                        width: "55px",
                        padding: "4px",
                      }}
                    />

                    <Input
                      value={settings.textColor}
                      onChange={(e) =>
                        updateSetting("textColor", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TYPOGRAPHY */}

          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="d-flex align-items-center">
                <Type size={19} className="me-2" />
                Typography
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Label className='mx-2'>Font </Label>

              <select
                value={settings.fontFamily}
                onChange={(e) => updateSetting("fontFamily", e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="Inter">Inter</option>
                <option value="Poppins">Poppins</option>
                <option value="Montserrat">Montserrat</option>
                <option value="DM Sans">DM Sans</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Lora">Lora</option>
                <option value="Roboto">Roboto</option>
                <option value="Space Grotesk">Space Grotesk</option>
              </select>
            </CardContent>
          </Card>

          {/* LAYOUT */}

          <Card>
            <CardHeader>
              <CardTitle className="d-flex align-items-center">
                <Layout size={19} className="me-2" />
                Layout
              </CardTitle>
            </CardHeader>

            <CardContent>
              {/* PRODUCT LAYOUT */}

              <Label>Product Layout</Label>

              <div className="d-flex gap-2 mt-2">
                <Button
                  variant={settings.layout === "grid" ? "default" : "outline"}
                  onClick={() => updateSetting("layout", "grid")}
                >
                  Grid
                </Button>

                <Button
                  variant={settings.layout === "list" ? "default" : "outline"}
                  onClick={() => updateSetting("layout", "list")}
                >
                  List
                </Button>
              </div>

              {/* BUTTON STYLE */}

              <div className="mt-4">
                <Label>Button Style</Label>

                <div className="d-flex gap-2 mt-2">
                  <Button
                    variant={
                      settings.buttonStyle === "rounded" ? "default" : "outline"
                    }
                    onClick={() => updateSetting("buttonStyle", "rounded")}
                  >
                    Rounded
                  </Button>

                  <Button
                    variant={
                      settings.buttonStyle === "square" ? "default" : "outline"
                    }
                    onClick={() => updateSetting("buttonStyle", "square")}
                  >
                    Square
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Preview */}

        <div className="col-12 col-xl-7">
          <Card className="sticky-top">
            <CardHeader>
              <div className="d-flex justify-content-between align-items-center">
                <CardTitle className="d-flex align-items-center mb-0">
                  <Eye size={19} className="me-2" />
                  Live Preview
                </CardTitle>

                <div className="d-flex gap-1">
                  <Button
                    variant={previewMode === "desktop" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("desktop")}
                  >
                    <Monitor size={16} />
                  </Button>

                  <Button
                    variant={previewMode === "mobile" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("mobile")}
                  >
                    <Smartphone size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div
                className="mx-auto border rounded overflow-hidden"
                style={{
                  maxWidth: previewMode === "mobile" ? "390px" : "100%",

                  backgroundColor: settings.backgroundColor,

                  color: settings.textColor,

                  fontFamily: settings.fontFamily,
                }}
              >
                {/* preview navbar */}

                <div
                  className="p-3 border-bottom"
                  style={{
                    backgroundColor: settings.secondaryColor,
                    color: settings.textColor,
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>
                      {settings.logoUrl ? (
                        <img
                          src={settings.logoUrl}
                          alt="Brand logo"
                          style={{
                            maxHeight: "35px",
                            maxWidth: "120px",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        "YOUR BRAND"
                      )}
                    </strong>

                    <div className="d-flex gap-3 align-items-center">
                      {/* Desktop Navigation */}
                      <div className="d-none d-md-flex gap-3">
                        <a
                          href="#products"
                          className="text-decoration-none small"
                          style={{
                            color: settings.textColor,
                          }}
                        >
                          Collection
                        </a>
                        <span
                          className="text-decoration-none small"
                          style={{
                            color: settings.textColor,
                          }}
                        >
                          <span>←</span> Back to Shop
                        </span>
                      </div>

                      {/* Mobile Navigation */}
                      <div className="d-md-none position-relative">
                        <button
                          type="button"
                          className="btn btn-link text-decoration-none d-flex align-items-center gap-1 p-0"
                          onClick={() => setPreviewMenuOpen((current) => !current)}
                          style={{
                            color: settings.textColor,
                          }}
                        >
                          <span className="small">Menu</span>
                          <ChevronDown
                            size={12}
                            style={{
                              transform: previewMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.2s ease",
                            }}
                          />
                        </button>

                        {previewMenuOpen && (
                          <div
                            className="position-absolute end-0 mt-2 border rounded-3 shadow-lg overflow-hidden"
                            style={{
                              minWidth: "150px",
                              zIndex: 1050,
                              backgroundColor: settings.secondaryColor,
                            }}
                          >
                            <a
                              href="#products"
                              className="dropdown-item text-decoration-none py-2 px-3 small"
                              style={{
                                color: settings.textColor,
                              }}
                              onClick={() => setPreviewMenuOpen(false)}
                            >
                              Collection
                            </a>
                            <span
                              className="dropdown-item text-decoration-none py-2 px-3 small"
                              style={{
                                color: settings.textColor,
                              }}
                              onClick={() => setPreviewMenuOpen(false)}
                            >
                              <span>←</span> Back to Shop
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Cart */}
                      <div className="position-relative d-flex align-items-center justify-content-center">
                        <ShoppingCart size={18} style={{ color: settings.textColor }} />

                        {itemCount > 0 && (
                          <span
                            className="position-absolute badge rounded-pill bg-danger"
                            style={{
                              top: "-4px",
                              right: "-4px",
                              fontSize: "8px",
                              minWidth: "14px",
                              height: "14px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "0 3px",
                            }}
                          >
                            {itemCount > 99 ? "99+" : itemCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* HERO */}

                <div
                  className="p-5 text-center"
                  style={{
                    backgroundImage: settings.bannerUrl
                      ? `url(${settings.bannerUrl})`
                      : undefined,

                    backgroundSize: "cover",

                    backgroundPosition: "center",
                  }}
                >
                  <div
                    className="p-4 rounded"
                    style={{
                      background: settings.bannerUrl
                        ? "rgba(0,0,0,0.35)"
                        : "transparent",

                      color: settings.bannerUrl
                        ? "#ffffff"
                        : settings.textColor,
                    }}
                  >
                    <h2 className="fw-bold">{settings.heroTitle}</h2>

                    <p className="mb-4">{settings.heroDescription}</p>
                  </div>
                </div>

                {/* PRODUCTS */}

                <div className="p-4">
                  <h3 className="h5 mb-3">Latest Collection</h3>

                  <div className={settings.layout === "grid" ? "row g-3" : ""}>
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className={
                          settings.layout === "grid" ? "col-4" : "mb-3"
                        }
                      >
                        <div className="border rounded overflow-hidden">
                          <div
                            style={{
                              aspectRatio: "1 / 1",

                              background: "#eeeeee",
                            }}
                          />

                          <div className="p-2">
                            <div className="fw-semibold small">
                              Product {item}
                            </div>

                            <div className="small text-muted">KSh 2,500</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
