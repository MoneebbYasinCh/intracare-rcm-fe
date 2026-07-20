import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';
import { api } from '../../api';
import { useToast } from '../shared/Toast';
import { ConfirmDialog } from '../shared/ConfirmDialog';

const TABLE_OPTIONS = [
  'gold_snowflake_charges_and_payments',
  'gold_snowflake_writeoffs',
  'gold_snowflake_account_receivables_main',
  'gold_snowflake_claimdenials',
];

const EMPTY_FORM = {
  natural_language: '',
  sql: '',
  tables_used: [],
  verified: false,
};

export function ExamplesTab() {
  const toast = useToast();
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.adminListExamples();
      setExamples(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditingIndex(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (idx) => {
    const ex = examples[idx];
    setEditingIndex(idx);
    setForm({
      natural_language: ex.natural_language || '',
      sql: ex.sql || '',
      tables_used: ex.tables_used || [],
      verified: !!ex.verified,
    });
    setModalOpen(true);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-poppins font-semibold text-lg text-text-primary">
          NL-to-SQL Examples
          <span className="ml-2 text-sm font-normal text-text-secondary">({examples.length})</span>
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
                <th className="px-3 py-2.5 font-poppins font-medium text-xs text-text-secondary uppercase tracking-wider">#</th>
                <th className="px-3 py-2.5 font-poppins font-medium text-xs text-text-secondary uppercase tracking-wider">Natural Language</th>
                <th className="px-3 py-2.5 font-poppins font-medium text-xs text-text-secondary uppercase tracking-wider">SQL</th>
                <th className="px-3 py-2.5 font-poppins font-medium text-xs text-text-secondary uppercase tracking-wider">Tables Used</th>
                <th className="px-3 py-2.5 font-poppins font-medium text-xs text-text-secondary uppercase tracking-wider">Verified</th>
                <th className="px-3 py-2.5 font-poppins font-medium text-xs text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {examples.map((ex, idx) => (
                <tr key={idx} className="hover:bg-surface-muted/20 transition-colors">
                  <td className="px-3 py-2.5 font-prompt text-sm text-text-secondary">{idx}</td>
                  <td className="px-3 py-2.5 font-prompt text-sm text-text-primary max-w-[240px] truncate" title={ex.natural_language}>
                    {ex.natural_language}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-primary max-w-[280px] truncate bg-primary-muted/30 rounded" title={ex.sql}>
                    {ex.sql}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {(ex.tables_used || []).map((t) => (
                        <span key={t} className="inline-block px-1.5 py-0.5 bg-primary-muted/40 text-primary text-[10px] font-prompt rounded">
                          {t.replace('gold_snowflake_', '')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {ex.verified ? (
                      <Check size={16} className="text-success mx-auto" />
                    ) : (
                      <X size={16} className="text-text-secondary/40 mx-auto" />
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(idx)} className="p-1.5 rounded hover:bg-primary-muted/30 text-text-secondary hover:text-primary transition-colors" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(idx)} className="p-1.5 rounded hover:bg-danger-light text-text-secondary hover:text-danger transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                  onChange={(e) => setForm((p) => ({ ...p, sql: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-lg font-mono text-xs text-primary bg-primary-muted/10 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  placeholder="SELECT COUNT(*) FROM ..."
                />
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
                <input
                  type="checkbox"
                  id="verified"
                  checked={form.verified}
                  onChange={(e) => setForm((p) => ({ ...p, verified: e.target.checked }))}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/40"
                />
                <label htmlFor="verified" className="font-prompt text-sm text-text-secondary">Verified</label>
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
