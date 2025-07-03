import { ExperimentalAttachment } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { FileText, File, BarChart3, Download } from "lucide-react";

export const FileAttachment = ({
  attachment,
  messageId,
  attachmentIndex,
}: {
  attachment: ExperimentalAttachment;
  messageId: string;
  attachmentIndex: number;
}) => {
  const getFileIcon = () => {
    if (attachment.contentType?.includes("pdf")) {
      return <FileText className="w-5 h-5 mr-3 flex-shrink-0 text-red-400" />;
    }
    if (attachment.contentType?.includes("text")) {
      return <File className="w-5 h-5 mr-3 flex-shrink-0 text-blue-400" />;
    }
    if (
      attachment.contentType?.includes("csv") ||
      attachment.contentType?.includes("excel")
    ) {
      return (
        <BarChart3 className="w-5 h-5 mr-3 flex-shrink-0 text-green-400" />
      );
    }
    return <FileText className="w-5 h-5 mr-3 flex-shrink-0 text-gray-400" />;
  };

  const getFileTypeDescription = () => {
    if (attachment.contentType?.includes("pdf")) return "PDF Document";
    if (attachment.contentType?.includes("text")) return "Text File";
    if (attachment.contentType?.includes("csv")) return "CSV File";
    if (attachment.contentType?.includes("doc")) return "Document";
    return "File";
  };

  return (
    <div
      key={`${messageId}-file-${attachmentIndex}`}
      className="flex items-center bg-white/10 rounded-lg p-3 text-white/80 text-sm max-w-md mb-2"
    >
      <div className="flex items-center flex-1 min-w-0">
        {getFileIcon()}
        <div className="flex-1 min-w-0">
          <div className="truncate font-medium">
            {attachment.name || "Attachment"}
          </div>
          <div className="text-xs text-white/60">
            {getFileTypeDescription()}
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.open(attachment.url, "_blank")}
        className="ml-2 h-8 w-8 p-0 text-white/60 hover:text-white/80"
        title="Download file"
      >
        <Download className="w-4 h-4" />
      </Button>
    </div>
  );
};
