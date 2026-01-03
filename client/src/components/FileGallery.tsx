import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RTLDialog, RTLDialogContent, RTLDialogHeader, RTLDialogTitle, RTLDialogDescription } from "@/components/RTLDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  FileIcon,
  Image as ImageIcon,
  Download,
  Search,
  X,
  FileText,
  Grid3x3,
  List,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";

interface FileGalleryProps {
  conversationId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function FileGallery({ conversationId, isOpen, onClose }: FileGalleryProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState<"all" | "images" | "documents">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFile, setSelectedFile] = useState<any>(null);

  // Get all messages with attachments
  const { data: messages } = trpc.chat.getMessages.useQuery(
    { conversationId },
    { enabled: isOpen && !!conversationId }
  );

  // Filter messages that have attachments
  const filesWithMetadata = messages
    ?.filter((msg: any) => msg.attachmentUrl)
    .map((msg: any) => ({
      id: msg.id,
      url: msg.attachmentUrl,
      type: msg.attachmentType,
      name: msg.attachmentUrl.split('/').pop() || 'file',
      uploadedAt: msg.createdAt,
      uploadedBy: msg.senderType === 'user' ? 'Customer' : 'Office',
      message: msg.message,
    })) || [];

  // Apply filters
  const filteredFiles = filesWithMetadata.filter((file) => {
    // Search filter
    const matchesSearch = !searchQuery || 
      file.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter
    const matchesType = 
      fileTypeFilter === "all" ||
      (fileTypeFilter === "images" && file.type?.startsWith("image/")) ||
      (fileTypeFilter === "documents" && !file.type?.startsWith("image/"));

    return matchesSearch && matchesType;
  });

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleBulkDownload = async () => {
    for (const file of filteredFiles) {
      await handleDownload(file.url, file.name);
      // Add delay to avoid overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getFileIcon = (type: string) => {
    if (type?.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <>
      <RTLDialog open={isOpen} onOpenChange={onClose}>
        <RTLDialogContent className="max-w-4xl">
          <RTLDialogHeader>
            <RTLDialogTitle>
              <div className="flex items-center gap-2">
                <FileIcon className="h-5 w-5" />
                {t("files.gallery") || "File Gallery"}
                <Badge variant="secondary" className="ml-2">
                  {filteredFiles.length} {t("files.count") || "files"}
                </Badge>
              </div>
            </RTLDialogTitle>
          </RTLDialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">

          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files..."
                  className="pl-9"
                />
              </div>

              <Select value={fileTypeFilter} onValueChange={(v: any) => setFileTypeFilter(v)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Files</SelectItem>
                  <SelectItem value="images">Images</SelectItem>
                  <SelectItem value="documents">Documents</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-1 border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {filteredFiles.length > 0 && (
                <Button onClick={handleBulkDownload} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              )}
            </div>

            {/* Files Display */}
            <ScrollArea className="h-[400px]">
              {filteredFiles.length > 0 ? (
                viewMode === "grid" ? (
                  <div className="grid grid-cols-3 gap-4">
                    {filteredFiles.map((file) => (
                      <Card
                        key={file.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedFile(file)}
                      >
                        <CardContent className="p-4">
                          {file.type?.startsWith("image/") ? (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-32 object-cover rounded mb-2"
                            />
                          ) : (
                            <div className="w-full h-32 bg-muted rounded mb-2 flex items-center justify-center">
                              <FileText className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}
                          </p>
                          <p className="text-xs text-muted-foreground">By {file.uploadedBy}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredFiles.map((file) => (
                      <Card key={file.id} className="cursor-pointer hover:bg-accent transition-colors">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="flex-shrink-0">
                            {file.type?.startsWith("image/") ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                                <FileText className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Uploaded {formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })} by {file.uploadedBy}
                            </p>
                            {file.message && (
                              <p className="text-xs text-muted-foreground truncate mt-1">
                                {file.message}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(file.url, file.name);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <FileIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No files found</p>
                </div>
              )}
            </ScrollArea>
          </div>
          </div>
        </RTLDialogContent>
      </RTLDialog>

      {/* File Preview Dialog */}
      {selectedFile && (
        <RTLDialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
          <RTLDialogContent className="max-w-3xl">
            <RTLDialogHeader>
              <RTLDialogTitle>
                <div className="flex items-center justify-between w-full">
                  <span className="truncate">{selectedFile.name}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(selectedFile.url, selectedFile.name)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t("files.download") || "Download"}
                  </Button>
                </div>
              </RTLDialogTitle>
            </RTLDialogHeader>
            <div className="space-y-4">
              {selectedFile.type?.startsWith("image/") ? (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.name}
                  className="w-full max-h-[500px] object-contain rounded"
                />
              ) : (
                <div className="w-full h-64 bg-muted rounded flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Preview not available</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => handleDownload(selectedFile.url, selectedFile.name)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download to view
                    </Button>
                  </div>
                </div>
              )}
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Uploaded:</span>{" "}
                  {formatDistanceToNow(new Date(selectedFile.uploadedAt), { addSuffix: true })}
                </p>
                <p>
                  <span className="font-medium">By:</span> {selectedFile.uploadedBy}
                </p>
                {selectedFile.message && (
                  <p>
                    <span className="font-medium">Message:</span> {selectedFile.message}
                  </p>
                )}
              </div>
            </div>
          </RTLDialogContent>
        </RTLDialog>
      )}
    </>
  );
}
