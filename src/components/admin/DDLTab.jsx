import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Loader2, Save } from 'lucide-react';
import { api } from '../../api';
import { useToast } from '../shared/Toast';
import { ConfirmDialog } from '../shared/ConfirmDialog';

const EMPTY_DDL = {
  table_name: '',
  description: '',
  columns: [{ name: '', type: 'VARCHAR', description: '' }],
};

export function DDLTab() {
  const toast = useToast();
  const [ddlList, setDdlList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_DDL);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.adminListDDL();
      setDdlList(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (item) => {
    const c = item.content || {};
    setEditing(item.table_name);
    setIsAdding(false);
    setForm({
      table_name: item.table_name,
      description: c.description || '',
      columns: c.columns?.length ? c.columns.map((col) => ({ ...col })) : [{ name: '', type: 'VARCHAR', description: '' }],
    });
  };

  const openAdd = () => {
    setEditing(null);
    setIsAdding(true);
    setForm(EMPTY_DDL);
  };

  const handleSave = async () => {
    if (!form.table_name.trim()) {
      toast.error('Table name is required');
      return;
    }
    const body = {
      table_name: form.table_name.trim(),
      description: form.description.trim(),
      columns: form.columns.filter((c) => c.name.trim()),
    };
    setSaving(true);
    try {
      if (editing) {
        await api.adminUpdateDDL(editing, body);
        toast.success('DDL updated');
      } else {
        await api.adminCreateDDL(body);
        toast.success('DDL created');
      }
      setEditing(null);
      setIsAdding(false);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.adminDeleteDDL(deleteTarget);
      toast.success('DDL deleted');
      setDeleteTarget(null);
      if (editing === deleteTarget) {
        setEditing(null);
        setIsAdding(false);
      }
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const updateColumn = (idx, field, value) => {
    setForm((prev) => {
      const cols = [...prev.columns];
      cols[idx] = { ...cols[idx], [field]: value };
      return { ...prev, columns: cols };
    });
  };

  const addColumn = () => setForm((p) => ({ ...p, columns: [...p.columns, { name: '', type: 'VARCHAR', description: '' }] }));
  const removeColumn = (idx) => setForm((p) => ({ ...p, columns: p.columns.filter((_, i) => i !== idx) }));

  const isEditing = (tableName) => editing === tableName || (isAdding && !editing);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-poppins font-semibold text-lg text-text-primary">
          DDL Files
          <span className="ml-2 text-sm font-normal text-text-secondary">({ddlList.length})</span>
        </h3>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-poppins text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          Add DDL
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-text-secondary font-prompt text-sm">
          <Loader2 size={20} className="animate-spin mr-2" />
          Loading DDL files...
        </div>
      ) : ddlList.length === 0 && !isAdding ? (
        <div className="text-center py-12 text-text-secondary font-prompt text-sm border border-dashed border-border rounded-lg">
          No DDL files yet. Click &quot;Add DDL&quot; to create one.
        </div>
      ) : null}

      {isAdding && (
        <DDLEditor
          form={form}
          setForm={setForm}
          saving={saving}
          onSave={handleSave}
          onCancel={() => { setIsAdding(false); setEditing(null); }}
          updateColumn={updateColumn}
          addColumn={addColumn}
          removeColumn={removeColumn}
          tableNameEditable
        />
      )}

      {ddlList.map((item) => {
        const isOpen = expanded === item.table_name;
        const editingThis = isEditing(item.table_name);

        if (editingThis && !isOpen) {
          return (
            <div key={item.table_name} className="border border-primary/30 rounded-lg overflow-hidden">
              <DDLEditor
                form={form}
                setForm={setForm}
                saving={saving}
                onSave={handleSave}
                onCancel={() => { setEditing(null); setIsAdding(false); }}
                updateColumn={updateColumn}
                addColumn={addColumn}
                removeColumn={removeColumn}
              />
            </div>
          );
        }

        return (
          <div key={item.table_name} className="border border-border rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3 bg-surface-muted/30 hover:bg-surface-muted/50 cursor-pointer transition-colors"
              onClick={() => setExpanded(isOpen ? null : item.table_name)}
            >
              <div className="flex items-center gap-3">
                {isOpen ? <ChevronDown size={16} className="text-text-secondary" /> : <ChevronRight size={16} className="text-text-secondary" />}
                <div>
                  <span className="font-prompt font-medium text-sm text-primary">{item.table_name}</span>
                  <span className="ml-2 font-prompt text-xs text-text-secondary">
                    {item.content?.columns?.length || 0} columns
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => openEdit(item)} className="p-1.5 rounded hover:bg-primary-muted/30 text-text-secondary hover:text-primary transition-colors" title="Edit">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleteTarget(item.table_name)} className="p-1.5 rounded hover:bg-danger-light text-text-secondary hover:text-danger transition-colors" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {isOpen && (
              <div className="px-4 py-3 border-t border-border space-y-3">
                {item.content?.description && (
                  <p className="font-prompt text-sm text-text-secondary">{item.content.description}</p>
                )}
                {item.content?.columns?.length > 0 && (
                  <div>
                    <h4 className="font-poppins text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">Columns</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="px-2 py-1 font-prompt text-[10px] text-text-secondary uppercase">Name</th>
                            <th className="px-2 py-1 font-prompt text-[10px] text-text-secondary uppercase">Type</th>
                            <th className="px-2 py-1 font-prompt text-[10px] text-text-secondary uppercase">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {item.content.columns.map((col, i) => (
                            <tr key={i}>
                              <td className="px-2 py-1 font-mono text-xs text-primary">{col.name}</td>
                              <td className="px-2 py-1 font-mono text-xs text-text-secondary">{col.type}</td>
                              <td className="px-2 py-1 font-prompt text-xs text-text-secondary">{col.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete DDL File"
        message={`This will permanently delete the DDL for "${deleteTarget}". Continue?`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function DDLEditor({ form, setForm, saving, onSave, onCancel, updateColumn, addColumn, removeColumn, tableNameEditable = false }) {
  return (
    <div className="bg-surface rounded-lg border border-primary/30 p-5 space-y-4">
      <h4 className="font-poppins font-semibold text-base text-text-primary">
        {tableNameEditable ? 'New DDL' : `Edit: ${form.table_name}`}
      </h4>

      <div>
        <label className="block font-poppins text-sm font-medium text-text-secondary mb-1">Table Name *</label>
        <input
          type="text"
          value={form.table_name}
          onChange={(e) => setForm((p) => ({ ...p, table_name: e.target.value }))}
          disabled={!tableNameEditable}
          className="w-full px-3 py-2 border border-border rounded-lg font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:bg-surface-muted/30 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block font-poppins text-sm font-medium text-text-secondary mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          rows={2}
          className="w-full px-3 py-2 border border-border rounded-lg font-prompt text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="font-poppins text-sm font-medium text-text-secondary">Columns</label>
          <button onClick={addColumn} className="text-xs text-primary hover:text-primary/80 font-prompt flex items-center gap-1">
            <Plus size={12} /> Add
          </button>
        </div>
        <div className="space-y-2">
          {form.columns.map((col, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={col.name}
                onChange={(e) => updateColumn(idx, 'name', e.target.value)}
                placeholder="column_name"
                className="flex-1 px-2 py-1.5 border border-border rounded font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
              <input
                type="text"
                value={col.type}
                onChange={(e) => updateColumn(idx, 'type', e.target.value)}
                placeholder="TYPE"
                className="w-24 px-2 py-1.5 border border-border rounded font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
              <input
                type="text"
                value={col.description}
                onChange={(e) => updateColumn(idx, 'description', e.target.value)}
                placeholder="Description"
                className="flex-1 px-2 py-1.5 border border-border rounded font-prompt text-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
              <button onClick={() => removeColumn(idx)} className="p-1 text-text-secondary/40 hover:text-danger transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 rounded-lg border border-border font-poppins text-sm text-text-secondary hover:bg-surface-muted transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-primary text-white font-poppins text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {tableNameEditable ? 'Create DDL' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
