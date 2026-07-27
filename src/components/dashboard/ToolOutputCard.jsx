import { useState } from 'react';
import { ChevronRight, Database, FileCode, AlertTriangle, Wrench } from 'lucide-react';

/**
 * Parse the retrieve_schema tool output (JSON with tables/columns/joins).
 * Returns null if parsing fails (caller falls back to raw text render).
 */
/** Strips markdown code-fence wrappers (```json ... ```) and leading/trailing whitespace. */
function stripCodeFence(text) {
  return text.replace(/^```[a-z]*\n*/i, '').replace(/\n*```\s*$/i, '').trim();
}

function parseSchemaOutput(output) {
  try {
    const cleaned = stripCodeFence(output);
    const parsed = JSON.parse(cleaned);
    return {
      tables: parsed.tables_needed || [],
      columns: parsed.columns || {},
      joins: parsed.joins || [],
      reasoning: parsed.reasoning || '',
    };
  } catch {
    return null;
  }
}

/**
 * Parse the generate_sql tool output (multi-section text).
 * Returns structured sections or null.
 */
function parseSqlOutput(output) {
  const sqlMatch = output.match(/Generated SQL:\n([\s\S]*?)(?=\nColumns:|\nResults \(|$)/);
  const columnsMatch = output.match(/Columns: (.+)/);
  const resultsMatch = output.match(/Results \((\d+) rows\):\n([\s\S]*?)(?=\nBytes scanned:|$)/);
  const bytesMatch = output.match(/Bytes scanned: ([\d,]+)/);

  // Parse result rows: each line is "  N. {json}"
  let resultRows = [];
  if (resultsMatch) {
    const rowsText = resultsMatch[2];
    const lines = rowsText.split('\n').filter(Boolean);
    for (const line of lines) {
      const jsonStart = line.indexOf('{');
      if (jsonStart !== -1) {
        try {
          resultRows.push(JSON.parse(line.slice(jsonStart)));
        } catch {
          resultRows.push(line.trim());
        }
      } else {
        resultRows.push(line.trim());
      }
    }
  }

  if (!sqlMatch && !resultsMatch) return null;

  return {
    sql: sqlMatch ? sqlMatch[1].trim() : null,
    columns: columnsMatch ? columnsMatch[1].trim() : null,
    rowCount: resultsMatch ? parseInt(resultsMatch[1], 10) : 0,
    rows: resultRows,
    bytesScanned: bytesMatch ? bytesMatch[1].trim() : null,
  };
}

/**
 * Detect if the output indicates an error/warning from the tool.
 */
function detectStatus(output) {
  const cleaned = stripCodeFence(output);
  if (cleaned.startsWith('Error:') || cleaned.startsWith('Error running')) return 'error';
  if (cleaned.startsWith('No relevant schema found.')) return 'warning';
  return 'success';
}

/**
 * Tool icon mapping.
 */
const TOOL_ICONS = {
  retrieve_schema: Database,
  generate_sql: FileCode,
};

/**
 * ToolOutputCard — renders a collapsible card showing a tool's output.
 *
 * Props:
 *   toolName  — e.g. "retrieve_schema", "generate_sql"
 *   toolLabel — human-readable e.g. "Retrieving schema..."
 *   output    — raw tool output string
 */
export function ToolOutputCard({ toolName, toolLabel, output }) {
  const [expanded, setExpanded] = useState(false);
  const status = detectStatus(output);
  const Icon = TOOL_ICONS[toolName] || Wrench;

  // Status-based border and icon colors — ponytail: single accent, no green
  const statusColors = {
    success: 'border-l-danger-accent',
    error: 'border-l-danger',
    warning: 'border-l-warning',
  };
  const iconColors = {
    success: 'text-success',
    error: 'text-danger-accent',
    warning: 'text-warning',
  };

  return (
    <div
      className={`max-w-[90%] md:max-w-[80%] rounded-lg bg-surface-muted border border-surface-border border-l-4 ${statusColors[status]} overflow-hidden`}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded((s) => !s)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/30 transition-colors"
      >
        <ChevronRight
          size={14}
          className={`shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
        />
        <Icon size={14} className={`shrink-0 ${iconColors[status]}`} />
        <span className="font-poppins text-xs text-text-primary font-medium truncate">
          {toolLabel}
        </span>
        {status === 'error' && (
          <AlertTriangle size={14} className="shrink-0 text-danger-accent ml-auto" />
        )}
      </button>

      {/* Body — collapsible */}
      {expanded && (
        <div className="px-3 pb-3 pt-0 max-h-[400px] overflow-y-auto">
          {toolName === 'retrieve_schema' && <SchemaOutputBody output={output} />}
          {toolName === 'generate_sql' && <SqlOutputBody output={output} />}
          {toolName !== 'retrieve_schema' && toolName !== 'generate_sql' && (
            <pre className="font-poppins text-[10px] md:text-[11px] text-text-secondary whitespace-pre-wrap break-words mt-1">
              {output}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

/** Renders the schema retrieval tool output. */
function SchemaOutputBody({ output }) {
  const data = parseSchemaOutput(output);

  if (!data) {
    return (
      <pre className="font-poppins text-[10px] md:text-[11px] text-text-secondary whitespace-pre-wrap break-words mt-1">
        {output}
      </pre>
    );
  }

  return (
    <div className="font-poppins text-[10px] md:text-[11px] text-text-secondary space-y-2 mt-1">
      {data.tables.length > 0 && (
        <div>
          <span className="font-semibold text-text-primary">Tables:</span>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {data.tables.map((t, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded bg-primary-muted text-primary text-[10px]">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {Object.keys(data.columns).length > 0 && (
        <div>
          <span className="font-semibold text-text-primary">Columns:</span>
          {Object.entries(data.columns).map(([table, cols], i) => (
            <div key={i} className="ml-2 mt-0.5">
              <span className="text-primary font-medium">{table}:</span>{' '}
              {Array.isArray(cols) ? cols.join(', ') : String(cols)}
            </div>
          ))}
        </div>
      )}

      {data.joins.length > 0 && (
        <div>
          <span className="font-semibold text-text-primary">Joins:</span>
          {data.joins.map((join, i) => (
            <div key={i} className="ml-2 mt-0.5">
              {typeof join === 'object'
                ? `${join.from || '?'} → ${join.to || '?'}`
                : String(join)}
            </div>
          ))}
        </div>
      )}

      {data.reasoning && (
        <div>
          <span className="font-semibold text-text-primary">Reasoning:</span>
          <p className="ml-2 mt-0.5 italic">{data.reasoning}</p>
        </div>
      )}
    </div>
  );
}

/** Renders the SQL generation tool output. */
function SqlOutputBody({ output }) {
  const data = parseSqlOutput(output);

  if (!data) {
    return (
      <pre className="font-poppins text-[10px] md:text-[11px] text-text-secondary whitespace-pre-wrap break-words mt-1">
        {output}
      </pre>
    );
  }

  return (
    <div className="font-poppins text-[10px] md:text-[11px] text-text-secondary space-y-2 mt-1">
      {data.sql && (
        <div>
          <span className="font-semibold text-text-primary">SQL:</span>
          <pre className="mt-1 p-2 rounded bg-white/60 text-[10px] md:text-[11px] overflow-x-auto whitespace-pre-wrap break-words border border-surface-border">
            {data.sql}
          </pre>
        </div>
      )}

      {data.columns && (
        <div>
          <span className="font-semibold text-text-primary">Columns:</span>{' '}
          <span>{data.columns}</span>
        </div>
      )}

      {data.rows.length > 0 && (
        <div>
          <span className="font-semibold text-text-primary">
            Results ({data.rowCount} rows):
          </span>
          <div className="mt-1 max-h-[250px] overflow-auto rounded border border-surface-border">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary-muted/30">
                  {Object.keys(data.rows[0] || {}).map((col, i) => (
                    <th key={i} className="px-2 py-1 font-semibold text-text-primary whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white/30' : ''}>
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-2 py-0.5 whitespace-nowrap">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.bytesScanned && (
        <div>
          <span className="font-semibold text-text-primary">Bytes scanned:</span>{' '}
          <span>{data.bytesScanned}</span>
        </div>
      )}
    </div>
  );
}
