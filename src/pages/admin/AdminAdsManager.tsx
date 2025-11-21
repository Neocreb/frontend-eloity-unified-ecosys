import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Eye, EyeOff, Check, X } from "lucide-react";
import AdCarousel, { Ad } from "@/components/wallet/AdCarousel";

const AdminAdsManager = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    backgroundColor: "#8B5CF6",
    textColor: "#FFFFFF",
    ctaText: "",
    ctaUrl: "",
  });

  // Load ads from localStorage
  useEffect(() => {
    const savedAds = localStorage.getItem("walletAds");
    if (savedAds) {
      setAds(JSON.parse(savedAds));
    }
  }, []);

  // Save ads to localStorage
  const saveAds = (updatedAds: Ad[]) => {
    setAds(updatedAds);
    localStorage.setItem("walletAds", JSON.stringify(updatedAds));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      backgroundColor: "#8B5CF6",
      textColor: "#FFFFFF",
      ctaText: "",
      ctaUrl: "",
    });
    setEditingId(null);
  };

  const handleSaveAd = () => {
    if (!formData.title || !formData.description) {
      alert("Title and description are required");
      return;
    }

    if (editingId) {
      // Update existing ad
      const updatedAds = ads.map((ad) =>
        ad.id === editingId
          ? { ...ad, ...formData }
          : ad
      );
      saveAds(updatedAds);
    } else {
      // Create new ad
      const newAd: Ad = {
        id: String(Date.now()),
        ...formData,
        isActive: true,
        createdAt: new Date(),
      };
      saveAds([...ads, newAd]);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEditAd = (ad: Ad) => {
    setFormData({
      title: ad.title,
      description: ad.description,
      imageUrl: ad.imageUrl,
      backgroundColor: ad.backgroundColor || "#8B5CF6",
      textColor: ad.textColor || "#FFFFFF",
      ctaText: ad.ctaText || "",
      ctaUrl: ad.ctaUrl || "",
    });
    setEditingId(ad.id);
    setIsDialogOpen(true);
  };

  const handleDeleteAd = (id: string) => {
    if (confirm("Are you sure you want to delete this ad?")) {
      saveAds(ads.filter((ad) => ad.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    const updatedAds = ads.map((ad) =>
      ad.id === id ? { ...ad, isActive: !ad.isActive } : ad
    );
    saveAds(updatedAds);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ads Management</h1>
          <p className="text-gray-600 mt-1">Manage wallet carousel ads and sponsored banners</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Ad" : "Create New Ad"}</DialogTitle>
              <DialogDescription>
                Create an ad banner that will appear in the wallet carousel. The banner is 800px wide and auto-scrolls.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Title *
                </label>
                <Input
                  placeholder="e.g., Premium Features"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Description *
                </label>
                <Input
                  placeholder="e.g., Unlock advanced wallet features"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Image URL
                </label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="mt-2 w-full h-32 object-cover rounded-lg"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Background Color
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      placeholder="#8B5CF6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Text Color
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  CTA Button Text
                </label>
                <Input
                  placeholder="e.g., Learn More"
                  value={formData.ctaText}
                  onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  CTA Button URL
                </label>
                <Input
                  placeholder="e.g., /app/premium"
                  value={formData.ctaUrl}
                  onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                />
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Preview
                </label>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <AdCarousel
                    ads={[
                      {
                        id: "preview",
                        title: formData.title,
                        description: formData.description,
                        imageUrl: formData.imageUrl,
                        backgroundColor: formData.backgroundColor,
                        textColor: formData.textColor,
                        ctaText: formData.ctaText,
                        ctaUrl: formData.ctaUrl,
                        isActive: true,
                        createdAt: new Date(),
                      },
                    ]}
                    autoScroll={false}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAd}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingId ? "Update Ad" : "Create Ad"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{ads.length}</div>
            <div className="text-sm text-gray-600">Total Ads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{ads.filter((a) => a.isActive).length}</div>
            <div className="text-sm text-gray-600">Active Ads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">{ads.filter((a) => !a.isActive).length}</div>
            <div className="text-sm text-gray-600">Inactive Ads</div>
          </CardContent>
        </Card>
      </div>

      {/* Ad Preview */}
      {ads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Carousel Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-6 rounded-lg">
              <AdCarousel ads={ads} autoScroll={true} scrollInterval={5000} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ads List */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Ads</h2>
        {ads.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-gray-600">No ads yet. Create your first ad to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {ads.map((ad) => (
              <Card key={ad.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4">
                    {/* Ad Preview Thumbnail */}
                    <div
                      className="w-32 h-24 flex-shrink-0 rounded-l-lg flex items-center justify-center p-4 text-sm text-white"
                      style={{ backgroundColor: ad.backgroundColor }}
                    >
                      <div className="text-center">
                        <p className="font-bold truncate">{ad.title}</p>
                        <p className="text-xs opacity-80 truncate">{ad.description}</p>
                      </div>
                    </div>

                    {/* Ad Details */}
                    <div className="flex-1 py-4">
                      <h3 className="font-bold text-gray-900">{ad.title}</h3>
                      <p className="text-sm text-gray-600">{ad.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        {ad.ctaText && <span>CTA: {ad.ctaText}</span>}
                        <span>Created: {new Date(ad.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pr-4">
                      <button
                        onClick={() => handleToggleActive(ad.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          ad.isActive
                            ? "bg-green-100 text-green-600 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        title={ad.isActive ? "Click to deactivate" : "Click to activate"}
                      >
                        {ad.isActive ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditAd(ad)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAd(ad.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAdsManager;
