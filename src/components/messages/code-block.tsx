import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Clipboard } from "lucide-react";

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
  [key: string]: unknown;
}

export function CodeBlock({ inline, className, children, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : "";
  const code = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="bg-[#0d1117] rounded-lg my-4 overflow-hidden">
      <div className="flex justify-between items-center bg-[#161b22] px-3 py-1 border-b border-[#30363d]">
        <span className="text-[#8b949e] text-sm">{lang || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center text-[#8b949e] hover:text-white text-xs"
        >
          <Clipboard className="w-4 h-4 mr-1" />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={lang}
        PreTag="div"
        customStyle={{ background: "transparent", margin: 0, padding: "1rem" }}
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
