import { Image, FileText, X, File, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface FileAttachment {
  type: 'image' | 'pdf' | 'doc' | 'txt' | 'csv';
  url: string;
  name: string;
  size: number;
  textContent?: string;
}

interface FileAttachmentDisplayProps {
  attachments: FileAttachment[];
  onRemove?: (index: number) => void;
  showRemove?: boolean;
}

export default function FileAttachmentDisplay({ 
  attachments, 
  onRemove, 
  showRemove = false 
}: FileAttachmentDisplayProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4 mr-2 flex-shrink-0" />;
      case 'pdf':
        return <FileText className="w-4 h-4 mr-2 flex-shrink-0" />;
      case 'doc':
        return <FileText className="w-4 h-4 mr-2 flex-shrink-0" />;
      case 'txt':
        return <File className="w-4 h-4 mr-2 flex-shrink-0" />;
      case 'csv':
        return <BarChart3 className="w-4 h-4 mr-2 flex-shrink-0" />;
      default:
        return <File className="w-4 h-4 mr-2 flex-shrink-0" />;
    }
  };

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case 'image':
        return 'Image';
      case 'pdf':
        return 'PDF';
      case 'doc':
        return 'Document';
      case 'txt':
        return 'Text File';
      case 'csv':
        return 'CSV';
      default:
        return 'File';
    }
  };

  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {attachments.map((attachment, index) => (
        <div
          key={index}
          className="flex items-center bg-[#404040] rounded-lg p-2 text-white/80 text-sm max-w-xs"
        >
          <div className="flex items-center flex-1 min-w-0">
            {getFileIcon(attachment.type)}
            <div className="flex-1 min-w-0">
              <div className="truncate font-medium">{attachment.name}</div>
              <div className="text-xs text-white/60">
                {getFileTypeLabel(attachment.type)} • {formatFileSize(attachment.size)}
              </div>
            </div>
          </div>
          
          {showRemove && onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="ml-2 h-6 w-6 p-0 text-white/60 hover:text-white/80"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
