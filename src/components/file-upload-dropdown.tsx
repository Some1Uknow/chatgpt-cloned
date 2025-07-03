"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Image, FileText, Loader2, File } from "lucide-react";

export interface FileAttachment {
  type: 'image' | 'pdf' | 'doc' | 'txt' | 'csv';
  url: string;
  name: string;
  size: number;
  textContent?: string;
}

interface FileUploadDropdownProps {
  onFileUpload: (attachment: FileAttachment) => void;
}

export default function FileUploadDropdown({ onFileUpload }: FileUploadDropdownProps) {
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const txtInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File, type: 'image' | 'pdf' | 'doc' | 'txt' | 'csv') => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      onFileUpload({
        type,
        url: data.url,
        name: file.name,
        size: file.size,
        textContent: data.textContent,
      });
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handlePdfClick = () => {
    pdfInputRef.current?.click();
  };

  const handleDocClick = () => {
    docInputRef.current?.click();
  };

  const handleTxtClick = () => {
    txtInputRef.current?.click();
  };

  const handleCsvClick = () => {
    csvInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('Image size must be less than 10MB');
        return;
      }
      handleFileUpload(file, 'image');
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file');
        return;
      }
      if (file.size > 25 * 1024 * 1024) { // 25MB limit
        alert('PDF size must be less than 25MB');
        return;
      }
      handleFileUpload(file, 'pdf');
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      if (!validTypes.includes(file.type)) {
        alert('Please select a Word document (.doc or .docx)');
        return;
      }
      if (file.size > 25 * 1024 * 1024) { // 25MB limit
        alert('Document size must be less than 25MB');
        return;
      }
      handleFileUpload(file, 'doc');
    }
  };

  const handleTxtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/plain') {
        alert('Please select a text file (.txt)');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('Text file size must be less than 10MB');
        return;
      }
      handleFileUpload(file, 'txt');
    }
  };

  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['text/csv', 'application/vnd.ms-excel'];
      if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.csv')) {
        alert('Please select a CSV file');
        return;
      }
      if (file.size > 25 * 1024 * 1024) { // 25MB limit
        alert('CSV file size must be less than 25MB');
        return;
      }
      handleFileUpload(file, 'csv');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-white/50 hover:text-white/70 rounded-lg flex-shrink-0"
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="bg-[#2f2f2f] border-[#424242] text-white"
        >
          <DropdownMenuItem
            onClick={handleImageClick}
            className="cursor-pointer hover:bg-[#404040] focus:bg-[#404040]"
          >
            <Image className="w-4 h-4 mr-2" />
            Upload Image
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handlePdfClick}
            className="cursor-pointer hover:bg-[#404040] focus:bg-[#404040]"
          >
            <FileText className="w-4 h-4 mr-2" />
            Upload PDF
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDocClick}
            className="cursor-pointer hover:bg-[#404040] focus:bg-[#404040]"
          >
            <FileText className="w-4 h-4 mr-2" />
            Upload Document
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleTxtClick}
            className="cursor-pointer hover:bg-[#404040] focus:bg-[#404040]"
          >
            <File className="w-4 h-4 mr-2" />
            Upload Text File
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleCsvClick}
            className="cursor-pointer hover:bg-[#404040] focus:bg-[#404040]"
          >
            <FileText className="w-4 h-4 mr-2" />
            Upload CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        aria-label="Upload image file"
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf"
        onChange={handlePdfChange}
        className="hidden"
        aria-label="Upload PDF file"
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleDocChange}
        className="hidden"
        aria-label="Upload document file"
      />
      <input
        ref={txtInputRef}
        type="file"
        accept=".txt,text/plain"
        onChange={handleTxtChange}
        className="hidden"
        aria-label="Upload text file"
      />
      <input
        ref={csvInputRef}
        type="file"
        accept=".csv,text/csv,application/vnd.ms-excel"
        onChange={handleCsvChange}
        className="hidden"
        aria-label="Upload CSV file"
      />
    </>
  );
}
