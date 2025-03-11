
import React from 'react';
import { Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  onCopy: (text: string) => void;
}

// Very simple SQL syntax highlighting
const highlightSQL = (code: string): string => {
  return code
    .replace(
      /\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|LIMIT|JOIN|ON|AS|AND|OR|IN|BETWEEN|LIKE|IS|NULL|NOT|DISTINCT|COUNT|SUM|AVG|MAX|MIN|HAVING|UNION|ALL|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TABLE|VIEW|INDEX|CONSTRAINT|PRIMARY KEY|FOREIGN KEY|REFERENCES|DEFAULT|CASCADE|TRIGGER|PROCEDURE|FUNCTION)\b/gi,
      '<span class="keyword">$1</span>'
    )
    .replace(
      /\b(DATE_FORMAT|DATE_SUB|CURRENT_DATE|CURRENT_TIMESTAMP|NOW|COUNT|SUM|AVG|MAX|MIN|CONCAT|SUBSTRING|TRIM|UPPER|LOWER)\b/gi, 
      '<span class="function">$1</span>'
    )
    .replace(/'([^']*)'/g, '<span class="string">\'$1\'</span>')
    .replace(/"([^"]*)"/g, '<span class="string">"$1"</span>')
    .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="number">$1</span>')
    .replace(/`([^`]*)`/g, '<span class="table">`$1`</span>');
};

const CodeBlock: React.FC<CodeBlockProps> = ({ code, onCopy }) => {
  return (
    <div className="code-block group relative">
      <pre 
        className="text-xs md:text-sm"
        dangerouslySetInnerHTML={{ __html: highlightSQL(code) }}
      />
      <button
        onClick={() => onCopy(code)}
        className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm border border-border hover:bg-background"
        aria-label="Copier le code"
      >
        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    </div>
  );
};

export default CodeBlock;
