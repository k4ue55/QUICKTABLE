/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Table, 
  Code2, 
  Clipboard, 
  Check, 
  Settings2, 
  Eraser, 
  Layout, 
  Eye, 
  FileJson,
  RotateCcw,
  MessageSquare
} from 'lucide-react';

interface TableConfig {
  hasHeader: boolean;
}

const DEFAULT_CONFIG: TableConfig = {
  hasHeader: true,
};

export default function App() {
  const [input, setInput] = useState('');
  const [config, setConfig] = useState<TableConfig>(DEFAULT_CONFIG);
  const [copied, setCopied] = useState(false);

  // Parse TSV/CSV data
  const parsedData = useMemo(() => {
    if (!input.trim()) return [];
    
    const lines = input.trim().split(/\r?\n/);
    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';
    
    return lines.map(line => {
      if (delimiter === ',') {
        const regex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
        const matches = line.match(regex);
        return matches ? matches.map(m => m.replace(/^"|"$/g, '')) : line.split(',');
      }
      return line.split(delimiter);
    });
  }, [input]);

  // Generate HTML string
  const generatedHtml = useMemo(() => {
    if (parsedData.length === 0) return '';

    const rows = [...parsedData];
    const headerRow = config.hasHeader ? rows.shift() : null;

    const tableStyle = 'class="border-collapse border border-slate-300 w-full font-sans text-sm"';
    const thStyle = 'class="px-3 py-1 font-bold text-slate-700 border border-slate-300 text-left bg-slate-50"';
    const tdStyle = (idx: number) => {
      const bgClass = (idx % 2 !== 0) ? 'bg-slate-50/50' : 'bg-white';
      return `class="px-3 py-1 text-slate-600 border border-slate-300 ${bgClass}"`;
    };

    let html = `<table ${tableStyle}>\n`;

    if (headerRow) {
      html += '  <thead>\n    <tr>\n';
      headerRow.forEach(cell => {
        html += `      <th ${thStyle}>${cell}</th>\n`;
      });
      html += '    </tr>\n  </thead>\n';
    }

    html += '  <tbody>\n';
    rows.forEach((row, rIdx) => {
      html += '    <tr>\n';
      row.forEach(cell => {
        html += `      <td ${tdStyle(rIdx)}>${cell}</td>\n`;
      });
      html += '    </tr>\n';
    });
    html += '  </tbody>\n</table>';

    return html;
  }, [parsedData, config]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedHtml]);

  const handleClear = () => setInput('');

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">T</div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-800">
            QuickTable
          </h1>
        </div>
        <button 
          onClick={handleCopy}
          disabled={!input.trim()}
          className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copied ? 'Copiado!' : 'Copiar HTML'}
        </button>
      </header>

      {/* Toolbar / Settings */}
      <section className="flex items-center gap-8 px-8 py-3 bg-white border-b border-slate-100 shrink-0">
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input 
            type="checkbox" 
            checked={config.hasHeader}
            onChange={(e) => setConfig({...config, hasHeader: e.target.checked})}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 accent-indigo-600"
          />
          <span className="font-medium">Linha de Cabeçalho</span>
        </label>
      </section>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
        {/* Input Area */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Entrada</span>
          </div>
          <div className="flex-1 relative group">
            <textarea 
              className="w-full h-full p-6 bg-white border border-slate-200 rounded-xl shadow-sm resize-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono text-sm text-slate-700 leading-relaxed transition-all"
              spellCheck="false"
              placeholder="Cole dados do Excel aqui..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            {input && (
              <button 
                onClick={handleClear}
                className="absolute bottom-4 right-4 px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200 hover:bg-slate-200 transition-opacity opacity-0 group-hover:opacity-100"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Visualização</span>
          </div>
          <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-auto p-4">
            {!input.trim() ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
                <Eye size={48} strokeWidth={1} />
                <p className="text-sm font-medium">Aguardando dados...</p>
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: generatedHtml }} />
            )}
          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="h-10 flex items-center justify-end px-8 bg-white border-t border-slate-200 text-[11px] text-slate-400 shrink-0">
        <div className="flex gap-4 font-bold uppercase tracking-wider">
          <span>Linhas: <strong>{parsedData.length}</strong></span>
          <span>Colunas: <strong>{parsedData[0]?.length || 0}</strong></span>
        </div>
      </footer>
    </div>
  );
}
