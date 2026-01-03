import { useState } from "react";
import { RTLDialog as Dialog, RTLDialogContent as DialogContent, RTLDialogDescription as DialogDescription, RTLDialogFooter as DialogFooter, RTLDialogHeader as DialogHeader, RTLDialogTitle as DialogTitle } from "@/components/RTLDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  officeId: number;
  staffMembers: Array<{ userId: number; name: string }>;
}

export function ExportDialog({ open, onOpenChange, officeId, staffMembers }: ExportDialogProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [staffUserId, setStaffUserId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [exportFormat, setExportFormat] = useState<"csv" | "excel">("csv");

  const exportCSV = trpc.export.exportConversationsCSV.useMutation({
    onSuccess: (data) => {
      // Create blob and download
      const blob = new Blob([data.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success("Export completed successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Export failed: " + error.message);
    },
  });

  const exportExcel = trpc.export.exportConversationsExcel.useMutation({
    onSuccess: (data) => {
      // Decode base64 and download
      const byteCharacters = atob(data.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success("Export completed successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Export failed: " + error.message);
    },
  });

  const handleExport = () => {
    const filters = {
      officeId,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      staffUserId: staffUserId !== "all" ? parseInt(staffUserId) : undefined,
      status: status !== "all" ? (status as "active" | "closed" | "archived") : undefined,
    };

    if (exportFormat === "csv") {
      exportCSV.mutate(filters);
    } else {
      exportExcel.mutate(filters);
    }
  };

  const isLoading = exportCSV.isPending || exportExcel.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Conversations</DialogTitle>
          <DialogDescription>
            Export conversation data with customizable filters for compliance and reporting.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Date Range */}
          <div className="grid gap-2">
            <Label>Date Range (Optional)</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Staff Filter */}
          <div className="grid gap-2">
            <Label htmlFor="staff">Staff Member (Optional)</Label>
            <Select value={staffUserId} onValueChange={setStaffUserId}>
              <SelectTrigger id="staff">
                <SelectValue placeholder="All staff members" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All staff members</SelectItem>
                {staffMembers.map((staff) => (
                  <SelectItem key={staff.userId} value={staff.userId.toString()}>
                    {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="grid gap-2">
            <Label htmlFor="status">Status (Optional)</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Format Selection */}
          <div className="grid gap-2">
            <Label htmlFor="format">Export Format</Label>
            <Select value={exportFormat} onValueChange={(val) => setExportFormat(val as "csv" | "excel")}>
              <SelectTrigger id="format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>CSV (Comma-separated values)</span>
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Excel (.xlsx)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isLoading}>
            {isLoading ? (
              <>Exporting...</>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
