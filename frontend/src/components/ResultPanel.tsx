import React, { useState } from 'react';
import { SqlResult } from '@/lib/fakeChatData';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ResultPanelProps {
  result: SqlResult;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ result }) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  
  // Sort rows
  const sortedRows = [...result.rows].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    
    if (sortDirection === 'asc') {
      return aStr.localeCompare(bStr);
    } else {
      return bStr.localeCompare(aStr);
    }
  });
  
  // Pagination
  const totalPages = Math.ceil(sortedRows.length / rowsPerPage);
  const paginatedRows = sortedRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const formatValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">NULL</span>;
    }
    
    if (typeof value === 'number') {
      // Format numbers with commas for thousands and keep decimal precision
      return new Intl.NumberFormat('fr-FR').format(value);
    }
    
    return String(value);
  };
  
  return (
    <div className="rounded-lg border border-border overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="sql-table">
          <thead>
            <tr>
              {result.columns.map((column) => (
                <th key={column} onClick={() => handleSort(column)} className="cursor-pointer select-none">
                  <div className="flex items-center justify-between gap-2">
                    {column}
                    {sortColumn === column && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="h-3 w-3" /> : 
                        <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, index) => (
              <tr key={index}>
                {result.columns.map((column) => (
                  <td key={`${index}-${column}`}>{formatValue(row[column])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/30">
          <div className="text-xs text-muted-foreground">
            Affichage de {(currentPage - 1) * rowsPerPage + 1}-
            {Math.min(currentPage * rowsPerPage, result.rows.length)} sur {result.rows.length} lignes
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded text-xs disabled:opacity-50 disabled:pointer-events-none hover:bg-secondary transition-colors"
            >
              Précédent
            </button>
            
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
              let pageNum = currentPage;
              if (totalPages <= 3) {
                pageNum = i + 1;
              } else if (currentPage === 1) {
                pageNum = i + 1;
              } else if (currentPage === totalPages) {
                pageNum = totalPages - 2 + i;
              } else {
                pageNum = currentPage - 1 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-2 py-1 rounded text-xs ${
                    currentPage === pageNum 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-secondary transition-colors'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded text-xs disabled:opacity-50 disabled:pointer-events-none hover:bg-secondary transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultPanel;
