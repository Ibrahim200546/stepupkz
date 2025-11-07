import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Store, Package } from "lucide-react";

const VendorDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
  });

  useEffect(() => {
    if (user) {
      loadVendorData();
    }
  }, [user]);

  const loadVendorData = async () => {
    try {
      // Load vendor info
      const { data: vendorData, error: vendorError } = await (supabase as any)
        .from('vendors')
        .select('*')
        .eq('owner_id', user?.id)
        .single();

      if (vendorError) {
        if (vendorError.code === 'PGRST116') {
          toast({
            title: "Доступ запрещен",
            description: "У вас нет магазина. Зарегистрируйте магазин в профиле.",
            variant: "destructive",
          });
          navigate('/account');
          return;
        }
        throw vendorError;
      }

      setVendor(vendorData);

      // Load products
      const { data: productsData, error: productsError } = await (supabase as any)
        .from('vendor_products')
        .select('*, categories(name)')
        .eq('vendor_id', vendorData.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error: any) {
      console.error('Error loading vendor data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        vendor_id: vendor.id,
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        category_id: productForm.category_id || null,
      };

      if (editingProduct) {
        const { error } = await (supabase as any)
          .from('vendor_products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({ title: "Товар обновлен!" });
      } else {
        const { error } = await (supabase as any)
          .from('vendor_products')
          .insert(productData);

        if (error) throw error;
        toast({ title: "Товар добавлен!" });
      }

      setDialogOpen(false);
      setEditingProduct(null);
      setProductForm({ name: "", description: "", price: "", stock: "", category_id: "" });
      loadVendorData();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Удалить этот товар?")) return;

    try {
      const { error } = await (supabase as any)
        .from('vendor_products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      toast({ title: "Товар удален" });
      loadVendorData();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      category_id: product.category_id || "",
    });
    setDialogOpen(true);
  };

  if (authLoading || loading) {
    return <div>Загрузка...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (!vendor) {
    return <Navigate to="/account" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Store className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{vendor.name}</h1>
              <p className="text-muted-foreground">Панель управления магазином</p>
            </div>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingProduct(null);
                setProductForm({ name: "", description: "", price: "", stock: "", category_id: "" });
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить товар
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Редактировать товар" : "Добавить товар"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitProduct} className="space-y-4">
                <div>
                  <Label htmlFor="name">Название *</Label>
                  <Input
                    id="name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Цена (₸) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Количество *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingProduct ? "Обновить" : "Добавить"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {products.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Нет товаров</h3>
              <p className="text-muted-foreground mb-6">
                Добавьте первый товар в ваш магазин
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="p-6 hover:shadow-card-hover transition-smooth">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description || "Без описания"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {product.price.toLocaleString('ru-KZ')} ₸
                      </div>
                      <div className="text-sm text-muted-foreground">
                        В наличии: {product.stock} шт
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(product)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Изменить
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VendorDashboard;
