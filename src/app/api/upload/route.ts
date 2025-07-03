import pdfParse from 'pdf-parse';
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { Buffer } from 'buffer';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("File upload attempt:", {
      name: file.name,
      size: file.size,
      type: file.type,
      uploadType: type,
    });

    // Check if environment variable exists
    const publicKey = process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY;
    if (!publicKey) {
      console.error("NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    console.log(
      "Using Uploadcare public key:",
      publicKey.substring(0, 10) + "..."
    );

    // Upload to Uploadcare using the correct API format
    const uploadFormData = new FormData();
    uploadFormData.append("UPLOADCARE_PUB_KEY", publicKey);
    uploadFormData.append("file", file);

    console.log("Uploading to Uploadcare...");
    const uploadResponse = await fetch("https://upload.uploadcare.com/base/", {
      method: "POST",
      body: uploadFormData,
    });

    console.log("Uploadcare response status:", uploadResponse.status);
    console.log(
      "Uploadcare response headers:",
      Object.fromEntries(uploadResponse.headers.entries())
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Uploadcare error response:", errorText);
      throw new Error(
        `Upload to Uploadcare failed: ${uploadResponse.status} - ${errorText}`
      );
    }

    const uploadData = await uploadResponse.json();
    console.log("Uploadcare response data:", uploadData);

    if (!uploadData.file) {
      console.error("No file ID in Uploadcare response:", uploadData);
      throw new Error("Invalid response from Uploadcare");
    }

    const fileUrl = `https://ucarecdn.com/${uploadData.file}/`;

    // Extract text content for various file types
    let textContent = "";
    if (type === "pdf") {
      try {
        console.log("Extracting text from PDF...");
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const pdfData = await pdfParse(buffer);
        textContent = pdfData.text;
        console.log("PDF text extracted, length:", textContent.length);
      } catch (error) {
        console.error("PDF parsing error:", error);
        // Continue without text content if parsing fails
      }
    } else if (type === "txt") {
      try {
        console.log("Reading text file...");
        textContent = await file.text();
        console.log("Text file content extracted, length:", textContent.length);
      } catch (error) {
        console.error("Text file reading error:", error);
        // Continue without text content if reading fails
      }
    } else if (type === "csv") {
      try {
        console.log("Reading CSV file...");
        const csvContent = await file.text();
        textContent = `CSV Data:\n${csvContent}`;
        console.log("CSV content extracted, length:", textContent.length);
      } catch (error) {
        console.error("CSV reading error:", error);
        // Continue without text content if reading fails
      }
    } else if (type === "doc") {
      try {
        console.log("Processing document file...");
        // Use mammoth for .docx files
        if (
          file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          const mammoth = (await import("mammoth")).default;
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const result = await mammoth.extractRawText({ buffer });
          textContent = result.value;
          console.log(
            "Document text extracted using mammoth, length:",
            textContent.length
          );
        } else {
          // For .doc files, just provide basic info
          textContent = `Document file: ${file.name} (${file.size} bytes)`;
          console.log("Document info extracted (basic)");
        }
      } catch (error) {
        console.error("Document processing error:", error);
        // Fallback to basic info
        textContent = `Document file: ${file.name} (${file.size} bytes)`;
      }
    }

    console.log("Upload successful, returning response");
    return NextResponse.json({
      url: fileUrl,
      textContent,
      name: file.name,
      size: file.size,
      type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
