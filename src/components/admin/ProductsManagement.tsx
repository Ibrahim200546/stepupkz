import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  price: number;
  old_price?: number;
  description?: string;
  is_active: boolean;
  is_featured: boolean;
  sku?: string;
  brands?: { name: string };
  categories?: { name: string };
  product_images?: Array<{ id: string; url: string; alt?: string; position: number }>;
  product_variants?: Array<{ id: string; size: string; color?: string; stock: number }>;
}

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    brand_id: "",
    category_id: "",
    price: "",
    old_price: "",
    description: "",
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    loadProducts();
    loadBrands();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brands (name),
          categories (name),
          product_images (id, url, alt, position),
          product_variants (id, size, color, stock)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить товары",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('Error loading brands:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        name: formData.name,
        sku: formData.sku || `SKU-${Date.now()}`,
        brand_id: formData.brand_id || null,
        category_id: formData.category_id || null,
        price: parseFloat(formData.price),
        old_price: formData.old_price ? parseFloat(formData.old_price) : null,
        description: formData.description,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({ title: "Успешно", description: "Товар обновлён" });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast({ title: "Успешно", description: "Товар создан" });
      }

      setDialogOpen(false);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить товар",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить товар?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Успешно", description: "Товар удалён" });
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku || "",
      brand_id: product.brands ? brands.find(b => b.name === product.brands?.name)?.id || "" : "",
      category_id: product.categories ? categories.find(c => c.name === product.categories?.name)?.id || "" : "",
      price: product.price.toString(),
      old_price: product.old_price?.toString() || "",
      description: product.description || "",
      is_active: product.is_active,
      is_featured: product.is_featured,
    });
    setDialogOpen(true);
  };

  const handleView = (product: Product) => {
    setViewingProduct(product);
    setViewDialogOpen(true);
  };

  const handleAddImage = async () => {
    if (!editingProduct || !imageUrl) {
      toast({
        title: "Ошибка",
        description: "Введите URL изображения",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('product_images')
        .insert([{
          product_id: editingProduct.id,
          url: imageUrl,
          position: editingProduct.product_images?.length || 0,
        }]);

      if (error) throw error;
      
      toast({ title: "Успешно", description: "Изображение добавлено" });
      setImageUrl("");
      setImageDialogOpen(false);
      loadProducts();
    } catch (error) {
      console.error('Error adding image:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить изображение",
        variant: "destructive",
      });
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Удалить изображение?')) return;

    try {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
      
      toast({ title: "Успешно", description: "Изображение удалено" });
      loadProducts();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить изображение",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      brand_id: "",
      category_id: "",
      price: "",
      old_price: "",
      description: "",
      is_active: true,
      is_featured: false,
    });
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Управление товарами</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Добавить товар
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Редактировать товар' : 'Новый товар'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Название *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sku">Артикул</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Генерируется автоматически"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand_id">Бренд</Label>
                  <Select value={formData.brand_id} onValueChange={(value) => setFormData({ ...formData, brand_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите бренд" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category_id">Категория</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Цена *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="old_price">Старая цена</Label>
                  <Input
                    id="old_price"
                    type="number"
                    step="0.01"
                    value={formData.old_price}
                    onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Подробное описание товара"
                />
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Активен</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Рекомендуемый</Label>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit">Сохранить</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Изображение</TableHead>
            <TableHead>Название</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Цена</TableHead>
            <TableHead>Бренд</TableHead>
            <TableHead>Остаток</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const totalStock = product.product_variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
            const mainImage = product.product_images?.sort((a, b) => a.position - b.position)[0];
            
            return (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="w-16 h-16 bg-muted rounded-md overflow-hidden">
                    {mainImage ? (
                      <img 
                        src={mainImage.url} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = '/placeholder-shoe.svg'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {product.name}
                  {product.is_featured && <span className="ml-2 text-xs text-yellow-600">⭐</span>}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{product.sku || '-'}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{Math.round(product.price).toLocaleString('ru-KZ')} ₸</div>
                    {product.old_price && (
                      <div className="text-xs text-muted-foreground line-through">
                        {Math.round(product.old_price).toLocaleString('ru-KZ')} ₸
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{product.brands?.name || '-'}</TableCell>
                <TableCell>
                  <span className={totalStock > 0 ? 'text-green-600' : 'text-red-600'}>
                    {totalStock} шт
                  </span>
                </TableCell>
                <TableCell>
                  {product.is_active ? (
                    <span className="text-green-600">✅ Активен</span>
                  ) : (
                    <span className="text-muted-foreground">❌ Неактивен</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleView(product)}
                      title="Просмотр"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                      title="Редактировать"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingProduct(product);
                        setImageDialogOpen(true);
                      }}
                      title="Изображения"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(product.id)}
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Image Management Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Управление изображениями: {editingProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="image_url">URL изображения</Label>
              <div className="flex gap-2">
                <Input
                  id="image_url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <Button onClick={handleAddImage}>Добавить</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Введите URL изображения (например, от Unsplash или загруженного в Supabase Storage)
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Текущие изображения:</h4>
              <div className="grid grid-cols-2 gap-2">
                {editingProduct?.product_images?.sort((a, b) => a.position - b.position).map((img) => (
                  <div key={img.id} className="relative group">
                    <img 
                      src={img.url} 
                      alt={img.alt || 'Product'} 
                      className="w-full aspect-square object-cover rounded-md"
                      onError={(e) => { e.currentTarget.src = '/placeholder-shoe.svg'; }}
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition"
                      onClick={() => handleDeleteImage(img.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              {(!editingProduct?.product_images || editingProduct.product_images.length === 0) && (
                <p className="text-sm text-muted-foreground">Нет изображений</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingProduct?.name}</DialogTitle>
          </DialogHeader>
          {viewingProduct && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Изображения</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {viewingProduct.product_images?.sort((a, b) => a.position - b.position).map((img) => (
                      <img 
                        key={img.id}
                        src={img.url} 
                        alt={img.alt || 'Product'} 
                        className="w-full aspect-square object-cover rounded-md"
                        onError={(e) => { e.currentTarget.src = '/placeholder-shoe.svg'; }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">SKU:</span>
                    <p className="font-medium">{viewingProduct.sku || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Бренд:</span>
                    <p className="font-medium">{viewingProduct.brands?.name || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Категория:</span>
                    <p className="font-medium">{viewingProduct.categories?.name || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Цена:</span>
                    <p className="text-xl font-bold">{Math.round(viewingProduct.price).toLocaleString('ru-KZ')} ₸</p>
                    {viewingProduct.old_price && (
                      <p className="text-sm text-muted-foreground line-through">
                        {Math.round(viewingProduct.old_price).toLocaleString('ru-KZ')} ₸
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Описание:</span>
                    <p className="mt-1">{viewingProduct.description || '-'}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Варианты (размеры)</h4>
                <div className="grid grid-cols-4 gap-2">
                  {viewingProduct.product_variants?.map((variant) => (
                    <div key={variant.id} className="border rounded p-2 text-center">
                      <div className="font-medium">{variant.size}</div>
                      <div className="text-sm text-muted-foreground">
                        {variant.stock > 0 ? `${variant.stock} шт` : 'Нет в наличии'}
                      </div>
                    </div>
                  ))}
                </div>
                {(!viewingProduct.product_variants || viewingProduct.product_variants.length === 0) && (
                  <p className="text-sm text-muted-foreground">Нет вариантов</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProductsManagement;
