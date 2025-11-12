import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Search, Store, Package, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Vendor {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  phone: string;
  address: string;
  verified: boolean;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const VendorsManagement = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [vendorStats, setVendorStats] = useState<{ products: number; revenue: number } | null>(null);

  useEffect(() => {
    loadVendors();
  }, []);

  useEffect(() => {
    filterVendors();
  }, [searchTerm, vendors]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendors')
        .select(`
          *,
          profiles:owner_id (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error loading vendors:', error);
      toast.error('Ошибка загрузки продавцов');
    } finally {
      setLoading(false);
    }
  };

  const filterVendors = () => {
    if (!searchTerm.trim()) {
      setFilteredVendors(vendors);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = vendors.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(term) ||
        vendor.address?.toLowerCase().includes(term) ||
        vendor.phone?.includes(term)
    );
    setFilteredVendors(filtered);
  };

  const loadVendorStats = async (vendorId: string) => {
    try {
      // Get vendor products count
      const { count: productsCount } = await supabase
        .from('vendor_products')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendorId);

      // Get vendor revenue (approximate - would need proper order tracking)
      const { data: products } = await supabase
        .from('vendor_products')
        .select('price')
        .eq('vendor_id', vendorId);

      const totalRevenue = products?.reduce((sum, p) => sum + (Number(p.price) || 0), 0) || 0;

      setVendorStats({
        products: productsCount || 0,
        revenue: totalRevenue,
      });
    } catch (error) {
      console.error('Error loading vendor stats:', error);
    }
  };

  const handleVerifyVendor = async (vendorId: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ verified })
        .eq('id', vendorId);

      if (error) throw error;

      toast.success(verified ? 'Продавец верифицирован' : 'Верификация отменена');
      loadVendors();
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast.error('Ошибка обновления статуса');
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого продавца?')) return;

    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', vendorId);

      if (error) throw error;

      toast.success('Продавец удален');
      loadVendors();
      setShowDetailsDialog(false);
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error('Ошибка удаления продавца');
    }
  };

  const openVendorDetails = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    loadVendorStats(vendor.id);
    setShowDetailsDialog(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Продавцы</h1>
          <p className="text-muted-foreground">Управление магазинами и продавцами</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию, адресу или телефону..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего продавцов</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendors.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Верифицированных</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vendors.filter(v => v.verified).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ожидают проверки</CardTitle>
            <XCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vendors.filter(v => !v.verified).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Список продавцов</CardTitle>
          <CardDescription>
            Всего найдено: {filteredVendors.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Владелец</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Адрес</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата создания</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Нет данных
                  </TableCell>
                </TableRow>
              ) : (
                filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>
                      {vendor.profiles?.first_name} {vendor.profiles?.last_name}
                    </TableCell>
                    <TableCell>{vendor.phone || '—'}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {vendor.address || '—'}
                    </TableCell>
                    <TableCell>
                      {vendor.verified ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Верифицирован
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Не верифицирован
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(vendor.created_at).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openVendorDetails(vendor)}
                        >
                          Детали
                        </Button>
                        {!vendor.verified && (
                          <Button
                            size="sm"
                            onClick={() => handleVerifyVendor(vendor.id, true)}
                          >
                            Верифицировать
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Vendor Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedVendor?.name}</DialogTitle>
            <DialogDescription>
              Информация о магазине
            </DialogDescription>
          </DialogHeader>

          {selectedVendor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Владелец</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedVendor.profiles?.first_name} {selectedVendor.profiles?.last_name}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Телефон</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedVendor.phone || '—'}
                  </p>
                </div>
                
                <div className="col-span-2">
                  <h4 className="font-medium mb-1">Адрес</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedVendor.address || '—'}
                  </p>
                </div>
                
                <div className="col-span-2">
                  <h4 className="font-medium mb-1">Описание</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedVendor.description || '—'}
                  </p>
                </div>
              </div>

              {vendorStats && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Товаров
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{vendorStats.products}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Потенциальная выручка
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {vendorStats.revenue.toLocaleString('ru-KZ')} ₸
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => selectedVendor && handleDeleteVendor(selectedVendor.id)}
            >
              Удалить
            </Button>
            {selectedVendor && !selectedVendor.verified && (
              <Button
                onClick={() => {
                  handleVerifyVendor(selectedVendor.id, true);
                  setShowDetailsDialog(false);
                }}
              >
                Верифицировать
              </Button>
            )}
            {selectedVendor && selectedVendor.verified && (
              <Button
                variant="outline"
                onClick={() => {
                  handleVerifyVendor(selectedVendor.id, false);
                  setShowDetailsDialog(false);
                }}
              >
                Отменить верификацию
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorsManagement;
