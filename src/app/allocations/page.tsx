"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { exportToExcel } from "@/lib/export-excel";
import { Plus, Download, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { format } from "date-fns";

interface Product {
  _id: string;
  name: string;
  availableQuantity: number;
}

interface Estate {
  _id: string;
  name: string;
}

interface Allocation {
  _id: string;
  product: Product;
  estate: Estate;
  quantityIssued: number;
  allocationDate: string;
  remarks: string;
}

export default function AllocationsPage() {
  const [data, setData] = useState<Allocation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [estates, setEstates] = useState<Estate[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    product: "", estate: "", quantityIssued: "" as number | string, remarks: "" 
  });

  const fetchAllocations = async () => {
    try {
      const res = await api.get("/allocations");
      setData(res.data);
    } catch (error) {
      toast.error("Failed to fetch allocations");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  const fetchEstates = async () => {
    try {
      const res = await api.get("/estates");
      setEstates(res.data);
    } catch (error) {
      toast.error("Failed to fetch estates");
    }
  };

  useEffect(() => {
    fetchAllocations();
    fetchProducts();
    fetchEstates();
  }, []);

  const handleExport = () => {
    const exportData = data.map(d => ({
      ...d,
      product: d.product?.name || '',
      estate: d.estate?.name || '',
      allocationDate: format(new Date(d.allocationDate), "PPP")
    }));
    exportToExcel(exportData, "Allocations");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/allocations", formData);
      toast.success("Allocation added");
      setOpen(false);
      setFormData({ product: "", estate: "", quantityIssued: "", remarks: "" });
      fetchAllocations();
      fetchProducts(); // refresh available quantities
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will revert the quantity back to the product.")) return;
    try {
      await api.delete(`/allocations/${id}`);
      toast.success("Allocation deleted");
      fetchAllocations();
      fetchProducts(); // refresh available quantities
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const columns: ColumnDef<Allocation>[] = [
    { accessorKey: "product.name", header: "Product" },
    { accessorKey: "estate.name", header: "Estate" },
    { accessorKey: "quantityIssued", header: "Qty Issued" },
    { 
      accessorKey: "allocationDate", 
      header: "Date",
      cell: ({ row }) => format(new Date(row.original.allocationDate), "PPP")
    },
    { accessorKey: "remarks", header: "Remarks" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const alloc = row.original;
        return (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(alloc._id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Allocations</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          
          <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
              setFormData({ product: "", estate: "", quantityIssued: "", remarks: "" });
            }
          }}>
            <DialogTrigger render={<Button />}>
              <Plus className="mr-2 h-4 w-4" /> Allocate Product
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Allocate Product to Estate</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select value={formData.product} onValueChange={(val) => setFormData({...formData, product: val || ""})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Product">
                        {formData.product ? products.find(p => p._id === formData.product)?.name : "Select Product"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(prod => (
                        <SelectItem key={prod._id} value={prod._id}>
                          {prod.name} (Avail: {prod.availableQuantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estate</Label>
                  <Select value={formData.estate} onValueChange={(val) => setFormData({...formData, estate: val || ""})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Estate">
                        {formData.estate ? estates.find(e => e._id === formData.estate)?.name : "Select Estate"}
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
                  <Label>Quantity Issued</Label>
                  <Input type="number" min={1} value={formData.quantityIssued} onChange={e => setFormData({...formData, quantityIssued: e.target.value === "" ? "" : Number(e.target.value)})} required />
                </div>
                <div className="space-y-2">
                  <Label>Remarks</Label>
                  <Input value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
                </div>
                <Button type="submit" className="w-full">Allocate</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataTable columns={columns} data={data} searchKey="remarks" />
    </div>
  );
}
