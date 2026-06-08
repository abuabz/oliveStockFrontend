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

interface Location {
  _id: string;
  locationId: string;
  name: string;
  pin: string;
  address: string;
}

export default function LocationsPage() {
  const [data, setData] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ locationId: "", name: "", pin: "", address: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      const res = await api.get("/locations");
      setData(res.data);
    } catch (error) {
      toast.error("Failed to fetch locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleExport = () => {
    exportToExcel(data, "Locations");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/locations/${editingId}`, formData);
        toast.success("Location updated");
      } else {
        await api.post("/locations", formData);
        toast.success("Location added");
      }
      setOpen(false);
      setFormData({ locationId: "", name: "", pin: "", address: "" });
      setEditingId(null);
      fetchLocations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/locations/${id}`);
      toast.success("Location deleted");
      fetchLocations();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleEdit = (loc: Location) => {
    setFormData({
      locationId: loc.locationId,
      name: loc.name,
      pin: loc.pin,
      address: loc.address,
    });
    setEditingId(loc._id);
    setOpen(true);
  };

  const columns: ColumnDef<Location>[] = [
    { accessorKey: "locationId", header: "Location ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "pin", header: "PIN Code" },
    { accessorKey: "address", header: "Address" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const loc = row.original;
        return (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(loc)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(loc._id)}>
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
        <h1 className="text-3xl font-bold">Locations</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          
          <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
              setEditingId(null);
              setFormData({ locationId: "", name: "", pin: "", address: "" });
            }
          }}>
            <DialogTrigger render={<Button />}>
              <Plus className="mr-2 h-4 w-4" /> Add New
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Location" : "Add Location"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Location ID</Label>
                  <Input value={formData.locationId} onChange={e => setFormData({...formData, locationId: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>PIN Code</Label>
                  <Input value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
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
