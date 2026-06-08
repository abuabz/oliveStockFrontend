"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { exportToExcel } from "@/lib/export-excel";
import { Plus, Download, Trash2, Edit } from "lucide-react";
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

interface Location {
  _id: string;
  name: string;
}

interface Estate {
  _id: string;
  estateId: string;
  name: string;
  location: Location;
  contactPerson: string;
  contactNumber: string;
  address: string;
}

export default function EstatesPage() {
  const [data, setData] = useState<Estate[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ estateId: "", name: "", location: "", contactPerson: "", contactNumber: "", address: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchEstates = async () => {
    try {
      const res = await api.get("/estates");
      setData(res.data);
    } catch (error) {
      toast.error("Failed to fetch estates");
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await api.get("/locations");
      setLocations(res.data);
    } catch (error) {
      toast.error("Failed to fetch locations");
    }
  };

  useEffect(() => {
    fetchEstates();
    fetchLocations();
  }, []);

  const handleExport = () => {
    const exportData = data.map(d => ({
      ...d,
      location: d.location?.name || ''
    }));
    exportToExcel(exportData, "Estates");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/estates/${editingId}`, formData);
        toast.success("Estate updated");
      } else {
        await api.post("/estates", formData);
        toast.success("Estate added");
      }
      setOpen(false);
      setFormData({ estateId: "", name: "", location: "", contactPerson: "", contactNumber: "", address: "" });
      setEditingId(null);
      fetchEstates();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/estates/${id}`);
      toast.success("Estate deleted");
      fetchEstates();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleEdit = (estate: Estate) => {
    setFormData({
      estateId: estate.estateId,
      name: estate.name,
      location: estate.location?._id || "",
      contactPerson: estate.contactPerson,
      contactNumber: estate.contactNumber,
      address: estate.address,
    });
    setEditingId(estate._id);
    setOpen(true);
  };

  const columns: ColumnDef<Estate>[] = [
    { accessorKey: "estateId", header: "Estate ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "location.name", header: "Location" },
    { accessorKey: "contactPerson", header: "Contact Person" },
    { accessorKey: "contactNumber", header: "Contact Number" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const estate = row.original;
        return (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(estate)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(estate._id)}>
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
        <h1 className="text-3xl font-bold">Estates</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          
          <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
              setEditingId(null);
              setFormData({ estateId: "", name: "", location: "", contactPerson: "", contactNumber: "", address: "" });
            }
          }}>
            <DialogTrigger render={<Button />}>
              <Plus className="mr-2 h-4 w-4" /> Add New
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Estate" : "Add Estate"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Estate ID</Label>
                    <Input value={formData.estateId} onChange={e => setFormData({...formData, estateId: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Select value={formData.location} onValueChange={(val) => setFormData({...formData, location: val || ""})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map(loc => (
                          <SelectItem key={loc._id} value={loc._id}>{loc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Person</Label>
                    <Input value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Number</Label>
                    <Input value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
                  </div>
                </div>
                <Button type="submit" className="w-full">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataTable columns={columns} data={data} searchKey="name" />
      </div>
  );
}
