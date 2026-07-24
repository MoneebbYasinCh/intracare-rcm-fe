import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Pencil, Trash2, Check, X, Loader2, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../api';
import { useToast } from '../shared/Toast';
import { ConfirmDialog } from '../shared/ConfirmDialog';

const PAGE_SIZE = 50;

const TABLE_OPTIONS = [
  'gold_snowflake_charges_and_payments',
  'gold_snowflake_writeoffs',
  'gold_snowflake_account_receivables_main',
  'gold_snowflake_claimdenials',
];

function ResultPreview({ columns, rows, execution_time_ms, bytes_scanned }) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface-muted/50 border-b border-border">
        <span className="font-poppins text-[10px] text-text-secondary">
          {execution_time_ms}ms &middot; {(bytes_scanned ?? 0).toLocaleString()} bytes scanned
        </span>
        <span className="font-poppins text-[10px] text-text-secondary">{rows.length} row{rows.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-muted/30">
              {columns.map((col, i) => (
                <th key={i} className="px-2 py-1 font-poppins font-medium text-[10px] text-text-secondary uppercase tracking-wider whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={ri < rows.length - 1 ? 'border-b border-border/50' : ''}>
                {columns.map((col, ci) => (
                  <td key={ci} className="px-2 py-1 font-mono text-[10px] text-text-primary whitespace-nowrap">
                    {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-text-secondary/50">NULL</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  natural_language: '',
  sql: '',
  tables_used: [],
  verified: false,
};

export function ExamplesTab({ onVerifyChange }) {
  const toast = useToast();
  const [examples, setExamples] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [rowRunResults, setRowRunResults] = useState({});
  const [modalRunning, setModalRunning] = useState(false);
  const [modalRunResult, setModalRunResult] = useState(null);

  const onVerifyChangeRef = useRef(onVerifyChange);
  onVerifyChangeRef.current = onVerifyChange;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const offset = page * PAGE_SIZE;

  const notifyVerify = useCallback((data) => {
    const verified = data.filter((ex) => ex.verified).length;
    const allVerified = data.length > 0 && verified === data.length;
    onVerifyChangeRef.current?.({ allVerified, verified, total: data.length });
  }, []);

  const load = useCallback(async (pageNum) => {
    setLoading(true);
    const off = (pageNum ?? page) * PAGE_SIZE;
    try {
      const data = await api.adminListExamples(off, PAGE_SIZE);
      const items = data.examples ?? (Array.isArray(data) ? data : []);
      setExamples(items);
      setTotal(data.total ?? items.length);
      notifyVerify(items);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [toast, notifyVerify, page]);

  useEffect(() => { load(page); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditingIndex(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
    setModalRunResult(null);
  };

  const openEdit = (id) => {
    const ex = examples.find((e) => e.id === id);
    if (!ex) return;
    setEditingIndex(id);
    setForm({
      natural_language: ex.natural_language || '',
      sql: ex.sql || '',
      tables_used: ex.tables_used || [],
      verified: !!ex.verified,
    });
    setModalOpen(true);
    setModalRunResult(null);
  };

  const handleSave = async () => {
    if (!form.natural_language.trim() || !form.sql.trim()) {
      toast.error('Natural Language and SQL are required');
      return;
    }
    const body = {
      natural_language: form.natural_language.trim(),
      sql: form.sql.trim(),
      tables_used: form.tables_used,
      verified: form.verified,
    };
    setSaving(true);
    try {
      if (editingIndex !== null) {
        await api.adminUpdateExample(editingIndex, body);
        toast.success('Example updated');
      } else {
        await api.adminAddExample(body);
        toast.success('Example added');
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    try {
      await api.adminDeleteExample(deleteTarget);
      toast.success('Example deleted');
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const toggleTable = (table) => {
    setForm((prev) => ({
      ...prev,
      tables_used: prev.tables_used.includes(table)
        ? prev.tables_used.filter((t) => t !== table)
        : [...prev.tables_used, table],
    }));
  };

  const handleModalRun = async () => {
    if (!form.sql.trim()) return;
    setModalRunning(true);
    setModalRunResult(null);
    try {
      const result = await api.adminRunQuery(form.sql.trim());
      setModalRunResult({
        success: true,
        execution_time_ms: result.execution_time_ms,
        rows: result.rows,
        columns: result.columns,
        bytes_scanned: result.bytes_scanned,
      });
      setForm((prev) => ({ ...prev, verified: true }));
    } catch (e) {
      setModalRunResult({ success: false, error: e.message });
    } finally {
      setModalRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-poppins font-semibold text-lg text-text-primary">
          NL-to-SQL Examples
          <span className="ml-2 text-sm font-normal text-text-secondary">({total} total)</span>
        </h3>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-poppins text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          Add Example
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-text-secondary font-prompt text-sm">
          <Loader2 size={20} className="animate-spin mr-2" />
          Loading examples...
        </div>
      ) : examples.length === 0 ? (
        <div className="text-center py-12 text-text-secondary font-prompt text-sm border border-dashed border-border rounded-lg">
          No examples yet. Click &quot;Add Example&quot; to get started.
        </div>
      ) : (
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-muted/50 border-b border-border">
                <th className="px-3 py-2.5 w-8 font-poppins font-medium text-xs text-text-secondary uppercase tracking-wider">#</th>
                <th className="px-3 py-2.5 w-[18%] font-poppins font-medium text-xs text-text-secondary uppercase tracking-wider">Natural Language</th>
                <th className="px-3 py-2.5 font-poppins font-medium text-xs text-text-secondary uppercase tracking-wider">SQL</th>
                <th className="px-3 py-2.5 w-24 font-poppins font-medium text-xs text-text-secondary uppercase tracking-wider">Verified</th>
                <th className="px-3 py-2.5 w-28 font-poppins font-medium text-xs text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {examples.map((ex, idx) => {
                const rowResult = rowRunResults[idx];
                const exampleId = ex.id ?? idx;
                return (
                  <tr key={exampleId} className="hover:bg-surface-muted/20 transition-colors">
                    <td className="px-3 py-2.5 font-prompt text-sm text-text-secondary">{exampleId}</td>
                    <td className="px-3 py-2.5 font-prompt text-sm text-text-primary break-words" title={ex.natural_language}>
                      {ex.natural_language}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="max-h-32 overflow-y-auto bg-primary-muted/20 rounded p-2">
                        <code className="font-mono text-xs text-primary leading-relaxed whitespace-pre-wrap break-all">
                          {ex.sql}
                        </code>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 align-middle">
                      <div className="flex items-center justify-center">
                        {rowResult && !rowResult.success ? (
                          <span className="text-danger text-[10px] font-prompt" title={rowResult.error}>Error</span>
                        ) : ex.verified ? (
                          <div className="flex items-center gap-1 text-success">
                            <Check size={14} />
                            <span className="text-[10px] font-prompt">
                              {rowResult?.execution_time_ms ? `${rowResult.execution_time_ms}ms` : 'Verified'}
                            </span>
                          </div>
                        ) : (
                          <X size={14} className="text-text-secondary/40" />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(exampleId)}
                          className="p-1.5 rounded hover:bg-primary-muted/30 text-text-secondary hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(exampleId)}
                          className="p-1.5 rounded hover:bg-danger-light text-text-secondary hover:text-danger transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {examples.map((ex, idx) => {
                const rowResult = rowRunResults[idx];
                if (!rowResult) return null;
                return (
                  <tr key={`${idx}-result`}>
                    <td colSpan={5} className="px-3 pb-3">
                      {rowResult.success ? (
                        <ResultPreview
                          columns={rowResult.columns}
                          rows={rowResult.rows}
                          execution_time_ms={rowResult.execution_time_ms}
                          bytes_scanned={rowResult.bytes_scanned}
                        />
                      ) : (
                        <div className="bg-danger-light border border-danger/30 rounded-lg p-3">
                          <p className="font-poppins text-xs text-danger-dark font-medium mb-0.5">Query failed</p>
                          <p className="font-mono text-[11px] text-danger-dark/80 whitespace-pre-wrap break-all">
                            {rowResult.error}
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && examples.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="font-poppins text-xs text-text-secondary">
            Showing {offset + 1}–{Math.min(offset + examples.length, total)} of {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded border border-border hover:bg-surface-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-poppins text-xs text-text-secondary tabular-nums">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded border border-border hover:bg-surface-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !saving && setModalOpen(false)} />
          <div className="relative bg-surface rounded-xl shadow-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h3 className="font-poppins font-semibold text-lg text-text-primary">
              {editingIndex !== null ? 'Edit Example' : 'Add Example'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block font-poppins text-sm font-medium text-text-secondary mb-1">Natural Language *</label>
                <textarea
                  value={form.natural_language}
                  onChange={(e) => setForm((p) => ({ ...p, natural_language: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg font-prompt text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  placeholder="How many claims were denied last month?"
                />
              </div>

              <div>
                <label className="block font-poppins text-sm font-medium text-text-secondary mb-1">SQL *</label>
                <textarea
                  value={form.sql}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, sql: e.target.value }));
                    setModalRunResult(null);
                  }}
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-lg font-mono text-xs text-primary bg-primary-muted/10 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  placeholder="SELECT COUNT(*) FROM ..."
                />
                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={handleModalRun}
                    disabled={modalRunning || !form.sql.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white font-poppins text-xs hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {modalRunning ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Play size={12} />
                    )}
                    Run Query
                  </button>
                  {modalRunResult && (
                    modalRunResult.success ? (
                      <span className="flex items-center gap-1 text-success font-prompt text-xs">
                        <Check size={12} />
                        OK ({modalRunResult.execution_time_ms}ms)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-danger font-prompt text-xs">
                        <X size={12} />
                        {modalRunResult.error}
                      </span>
                    )
                  )}
                </div>
                {modalRunResult?.success && modalRunResult?.rows && (
                  <div className="mt-3">
                    <ResultPreview
                      columns={modalRunResult.columns}
                      rows={modalRunResult.rows}
                      execution_time_ms={modalRunResult.execution_time_ms}
                      bytes_scanned={modalRunResult.bytes_scanned}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-poppins text-sm font-medium text-text-secondary mb-1">Tables Used</label>
                <div className="flex flex-wrap gap-2">
                  {TABLE_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTable(t)}
                      className={`px-3 py-1.5 rounded-lg border font-prompt text-xs transition-colors ${
                        form.tables_used.includes(t)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface border-border text-text-secondary hover:border-primary/50'
                      }`}
                    >
                      {t.replace('gold_snowflake_', '')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded ${form.verified ? 'bg-success-muted text-success' : 'bg-surface-muted text-text-secondary'}`}>
                  {form.verified ? <Check size={12} /> : <X size={12} />}
                  <span className="font-prompt text-xs">
                    {form.verified ? 'Verified (query ran successfully)' : 'Not verified — run the query first'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <button
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="px-4 py-2 rounded-lg border border-border font-poppins text-sm text-text-secondary hover:bg-surface-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-primary text-white font-poppins text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editingIndex !== null ? 'Save Changes' : 'Add Example'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Example"
        message="This action cannot be undone. Are you sure you want to delete this example?"
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
