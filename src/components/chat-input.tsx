import { Button } from "@/components/ui/button";
import { Mic, ArrowUp, SlidersHorizontal } from "lucide-react";
import FileUploadDropdown, { FileAttachment } from "./file-upload-dropdown";
import FileAttachmentDisplay from "./file-attachment-display";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  attachments?: FileAttachment[];
  onFileUpload?: (attachment: FileAttachment) => void;
  onRemoveAttachment?: (index: number) => void;
}

export default function ChatInput({
  input,
  isLoading,
  onInputChange,
  onSubmit,
  attachments = [],
  onFileUpload,
  onRemoveAttachment,
}: ChatInputProps) {
  return (
    <div className="max-w-3xl mx-auto w-full pb-6">
      <form onSubmit={onSubmit} className="relative w-full">
        <div className="bg-[#2f2f2f] rounded-3xl p-4">
          {/* File attachments display */}
          <FileAttachmentDisplay
            attachments={attachments}
            onRemove={onRemoveAttachment}
            showRemove={true}
          />
          
          <input
            value={input}
            onChange={onInputChange}
            placeholder="Message ChatGPT"
            className="w-full p-1 border-0 bg-transparent text-white placeholder-white/50 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none font-normal"
            disabled={isLoading}
          />
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center">
              <FileUploadDropdown onFileUpload={onFileUpload!} />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-white/50 hover:text-white/70 flex items-center flex-shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4 mr-1" />
                Tools
              </Button>
            </div>
            <div className="flex items-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white/50 hover:text-white/70 rounded-lg flex-shrink-0"
              >
                <Mic className="w-5 h-5" />
              </Button>
              <Button
                type="submit"
                disabled={(!input.trim() && attachments.length === 0) || isLoading}
                size="icon"
                className="bg-white text-black rounded-full w-8 h-8 ml-2 flex-shrink-0 disabled:bg-white/20 disabled:text-white/40"
              >
                <ArrowUp className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
