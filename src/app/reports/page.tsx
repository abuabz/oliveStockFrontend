"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { exportToExcel } from "@/lib/export-excel";
import { Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function ReportsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, allocRes] = await Promise.all([
          api.get("/products"),
          api.get("/allocations")
        ]);
        setProducts(prodRes.data);
        setAllocations(allocRes.data);
      } catch (error) {
        console.error("Failed to fetch reports data");
      }
    };
    fetchData();
  }, []);

  const handleExportStock = () => {
    const exportData = products.map(p => ({
      Code: p.productCode,
      Name: p.name,
      Category: p.category?.name,
      TotalQuantity: p.totalQuantity,
      AvailableQuantity: p.availableQuantity,
      AllocatedQuantity: p.totalQuantity - p.availableQuantity,
      MinimumStock: p.minimumStock,
      Status: p.availableQuantity < p.minimumStock ? 'Low Stock' : 'OK'
    }));
    exportToExcel(exportData, "Stock_Report");
  };

  const handleExportAllocations = () => {
    const exportData = allocations.map(a => ({
      Product: a.product?.name,
      Estate: a.estate?.name,
      QuantityIssued: a.quantityIssued,
      Date: format(new Date(a.allocationDate), "PPP"),
      Remarks: a.remarks
    }));
    exportToExcel(exportData, "Allocation_History");
  };

  const stockColumns: ColumnDef<any>[] = [
    { accessorKey: "productCode", header: "Code" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "category.name", header: "Category" },
    { accessorKey: "totalQuantity", header: "Total Qty" },
    { accessorKey: "availableQuantity", header: "Available Qty" },
    { 
      id: "allocatedQuantity", 
      header: "Allocated Qty",
      cell: ({ row }) => row.original.totalQuantity - row.original.availableQuantity
    },
    { 
      id: "status", 
      header: "Status",
      cell: ({ row }) => {
        const isLow = row.original.availableQuantity < row.original.minimumStock;
        return <span className={isLow ? "text-red-500 font-bold" : "text-green-500"}>{isLow ? "Low Stock" : "OK"}</span>;
      }
    },
  ];

  const allocColumns: ColumnDef<any>[] = [
    { accessorKey: "product.name", header: "Product" },
    { accessorKey: "estate.name", header: "Estate" },
    { accessorKey: "quantityIssued", header: "Qty Issued" },
    { 
      accessorKey: "allocationDate", 
      header: "Date",
      cell: ({ row }) => format(new Date(row.original.allocationDate), "PPP")
    },
    { accessorKey: "remarks", header: "Remarks" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Exportable stock and allocation reports.</p>
      </div>

      <Tabs defaultValue="stock" className="w-full">
        <TabsList>
          <TabsTrigger value="stock">Stock Report</TabsTrigger>
          <TabsTrigger value="allocations">Allocation History</TabsTrigger>
        </TabsList>
        <TabsContent value="stock" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleExportStock}>
              <Download className="mr-2 h-4 w-4" /> Export Stock Report
            </Button>
          </div>
            <DataTable columns={stockColumns} data={products} searchKey="name" />
        </TabsContent>
        <TabsContent value="allocations" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleExportAllocations}>
              <Download className="mr-2 h-4 w-4" /> Export Allocation History
            </Button>
          </div>
            <DataTable columns={allocColumns} data={allocations} searchKey="remarks" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
