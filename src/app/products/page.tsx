"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { exportToExcel } from "@/lib/export-excel";
import { Plus, Download, Trash2, Edit, Package, MapPin, CalendarDays, History, LayoutGrid, Table } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  productCode: string;
  name: string;
  category: Category;
  brand: string;
  unit: string;
  totalQuantity: number;
  availableQuantity: number;
  minimumStock: number;
}

interface Allocation {
  _id: string;
  product: Product;
  estate: {
    _id: string;
    name: string;
    location: {
      _id: string;
      name: string;
    };
  };
  quantityIssued: number;
  allocationDate: string;
  remarks: string;
}

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [estates, setEstates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isAllocating, setIsAllocating] = useState(false);
  const [allocFormData, setAllocFormData] = useState({ estate: "", quantityIssued: "" as number | string, remarks: "" });
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ 
    productCode: "", name: "", category: "", brand: "", unit: "", totalQuantity: "" as number | string, minimumStock: "" as number | string 
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setData(res.data);
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };
  
  const fetchAllocations = async () => {
    try {
      const res = await api.get("/allocations");
      setAllocations(res.data);
    } catch (error) {
      console.error("Failed to fetch allocations");
    }
  };

  const fetchEstates = async () => {
    try {
      const res = await api.get("/estates");
      setEstates(res.data);
    } catch (error) {
      console.error("Failed to fetch estates");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchAllocations();
    fetchEstates();
  }, []);

  const handleExport = () => {
    const exportData = data.map(d => ({
      ...d,
      category: d.category?.name || ''
    }));
    exportToExcel(exportData, "Products");
  };

  const handleAllocateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      await api.post("/allocations", {
        product: selectedProduct._id,
        ...allocFormData
      });
      toast.success("Allocation added successfully");
      setIsAllocating(false);
      setAllocFormData({ estate: "", quantityIssued: "", remarks: "" });
      fetchAllocations();
      fetchProducts(); 
      
      // Update selected product directly
      const qty = Number(allocFormData.quantityIssued);
      setSelectedProduct({
        ...selectedProduct,
        availableQuantity: selectedProduct.availableQuantity - qty
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to allocate product");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData);
        toast.success("Product updated");
      } else {
        await api.post("/products", formData);
        toast.success("Product added");
      }
      setAddEditOpen(false);
      setFormData({ productCode: "", name: "", category: "", brand: "", unit: "", totalQuantity: "", minimumStock: "" });
      setEditingId(null);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // prevent opening details
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleEdit = (e: React.MouseEvent, prod: Product) => {
    e.stopPropagation(); // prevent opening details
    setFormData({
      productCode: prod.productCode,
      name: prod.name,
      category: prod.category?._id || "",
      brand: prod.brand,
      unit: prod.unit,
      totalQuantity: prod.totalQuantity,
      minimumStock: prod.minimumStock,
    });
    setEditingId(prod._id);
    setAddEditOpen(true);
  };
  
  const handleProductClick = (prod: Product) => {
    setSelectedProduct(prod);
    setDetailsOpen(true);
  };
  
  // Filter allocations for selected product
  const productAllocations = selectedProduct 
    ? allocations.filter(a => a.product?._id === selectedProduct._id)
    : [];

  const columns: ColumnDef<Product>[] = [
    { accessorKey: "productCode", header: "Code" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "category.name", header: "Category" },
    { accessorKey: "brand", header: "Brand" },
    { accessorKey: "unit", header: "Unit" },
    { accessorKey: "totalQuantity", header: "Total Qty" },
    { accessorKey: "availableQuantity", header: "Available" },
    { accessorKey: "minimumStock", header: "Min Stock" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const prod = row.original;
        return (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={(e) => handleEdit(e, prod)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-red-500" onClick={(e) => handleDelete(e, prod._id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          
          <Dialog open={addEditOpen} onOpenChange={(val) => {
            setAddEditOpen(val);
            if (!val) {
              setEditingId(null);
              setFormData({ productCode: "", name: "", category: "", brand: "", unit: "", totalQuantity: "", minimumStock: "" });
            }
          }}>
            <DialogTrigger render={<Button />}>
              <Plus className="mr-2 h-4 w-4" /> Add New
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product Code</Label>
                    <Input value={formData.productCode} onChange={e => setFormData({...formData, productCode: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val || ""})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category">
                        {formData.category ? categories.find(c => c._id === formData.category)?.name : "Select Category"}
                      </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Input value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Quantity</Label>
                    <Input type="number" min={0} value={formData.totalQuantity} onChange={e => setFormData({...formData, totalQuantity: e.target.value === "" ? "" : Number(e.target.value)})} required disabled={!!editingId} />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Stock Level</Label>
                    <Input type="number" min={0} value={formData.minimumStock} onChange={e => setFormData({...formData, minimumStock: e.target.value === "" ? "" : Number(e.target.value)})} required />
                  </div>
                </div>
                <Button type="submit" className="w-full">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full space-y-4">
        <div className="flex justify-start">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="grid" className="flex items-center gap-2 px-4">
              <LayoutGrid className="h-4 w-4" /> Cards
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2 px-4">
              <Table className="h-4 w-4" /> Table
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid" className="mt-0 outline-none">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-[200px] bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border/50">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-sm text-muted-foreground mt-1">Get started by adding a new product to inventory.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.map(prod => {
                const stockLevel = (prod.availableQuantity / prod.totalQuantity) * 100;
                const isLowStock = prod.availableQuantity <= prod.minimumStock;
                
                return (
                  <Card 
                    key={prod._id} 
                    className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group border-border bg-card h-full flex flex-col"
                    onClick={() => handleProductClick(prod)}
                  >
                    <CardHeader className="pb-3 border-b border-border/50 bg-muted/20 flex-none">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-xl font-bold leading-none">{prod.name}</CardTitle>
                          <CardDescription className="font-medium text-xs text-muted-foreground">
                            {prod.productCode} • {prod.brand}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={(e) => handleEdit(e, prod)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => handleDelete(e, prod._id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <Badge variant="secondary" className="w-fit mt-2">{prod.category?.name || "Uncategorized"}</Badge>
                    </CardHeader>
                    <CardContent className="pt-4 flex-1 flex flex-col justify-end">
                      <div className="flex items-end justify-between mb-2">
                        <div>
                          <p className="text-sm text-muted-foreground font-medium mb-1">Available Stock</p>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-3xl font-black ${isLowStock ? 'text-destructive' : ''}`}>
                              {prod.availableQuantity}
                            </span>
                            <span className="text-sm text-muted-foreground">/ {prod.totalQuantity} {prod.unit}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Stock progress bar */}
                      <div className="w-full bg-secondary rounded-full h-2 mt-4 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${isLowStock ? 'bg-destructive' : 'bg-primary'}`} 
                          style={{ width: `${Math.min(100, Math.max(0, stockLevel))}%` }}
                        />
                      </div>
                      {isLowStock && (
                        <p className="text-xs text-destructive font-medium mt-2 flex items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-destructive mr-1.5 animate-pulse" />
                          Low stock alert (Min: {prod.minimumStock})
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="table" className="mt-0 outline-none">
          <div className="bg-background rounded-xl border border-border/50 overflow-hidden">
            <DataTable columns={columns} data={data} searchKey="name" onRowClick={handleProductClick} />
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Product Details & Allocations Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] h-[85vh] sm:h-[80vh] flex flex-col p-0 overflow-hidden">
          {selectedProduct && (
            <>
              <div className="p-6 pb-4 border-b border-border/50 bg-muted/10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <DialogTitle className="text-2xl font-bold mb-1">{selectedProduct.name}</DialogTitle>
                    <p className="text-muted-foreground text-sm font-medium">{selectedProduct.productCode} • {selectedProduct.brand} • {selectedProduct.category?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground font-medium mb-1">Current Stock</p>
                    <p className="text-2xl font-bold">{selectedProduct.availableQuantity} <span className="text-sm font-normal text-muted-foreground">{selectedProduct.unit}</span></p>
                  </div>
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <History className="h-5 w-5 text-primary" />
                    <h3>Allocation History</h3>
                  </div>
                  <Button size="sm" onClick={() => setIsAllocating(!isAllocating)} variant={isAllocating ? "outline" : "default"}>
                    {isAllocating ? "Cancel" : <><Plus className="h-4 w-4 mr-1" /> New Allocation</>}
                  </Button>
                </div>
                
                {isAllocating && (
                  <div className="bg-card p-5 rounded-xl border border-border mb-6 shadow-sm">
                    <h4 className="font-semibold mb-4 text-sm">Allocate {selectedProduct.name} to Estate</h4>
                    <form onSubmit={handleAllocateSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Estate</Label>
                          <Select value={allocFormData.estate} onValueChange={(val) => setAllocFormData({...allocFormData, estate: val || ""})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Estate">
                                {allocFormData.estate ? estates.find(e => e._id === allocFormData.estate)?.name : "Select Estate"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {estates.map(est => (
                                <SelectItem key={est._id} value={est._id}>{est.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Quantity to Issue</Label>
                          <Input type="number" min={1} max={selectedProduct.availableQuantity} value={allocFormData.quantityIssued} onChange={e => setAllocFormData({...allocFormData, quantityIssued: e.target.value === "" ? "" : Number(e.target.value)})} required />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Remarks (Optional)</Label>
                          <Input value={allocFormData.remarks} onChange={e => setAllocFormData({...allocFormData, remarks: e.target.value})} placeholder="e.g. For plumbing repairs in Block A" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={() => setIsAllocating(false)}>Cancel</Button>
                        <Button type="submit">Confirm Allocation</Button>
                      </div>
                    </form>
                  </div>
                )}
                
                {productAllocations.length === 0 ? (
                  <div className="text-center py-10 bg-muted/30 rounded-xl border border-dashed border-border/50">
                    <p className="text-muted-foreground text-sm">No allocations recorded for this product yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {productAllocations.map((alloc) => (
                      <div key={alloc._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                        <div className="space-y-1.5 mb-3 sm:mb-0">
                          <p className="font-semibold text-foreground flex items-center">
                            {alloc.estate?.name}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1 text-primary/70" />
                            {alloc.estate?.location?.name || "Unknown Location"}
                          </p>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                          <Badge variant="default" className="text-sm px-3 py-0.5">
                            {alloc.quantityIssued} {selectedProduct.unit}
                          </Badge>
                          <p className="text-xs text-muted-foreground flex items-center font-medium">
                            <CalendarDays className="h-3 w-3 mr-1" />
                            {new Date(alloc.allocationDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

