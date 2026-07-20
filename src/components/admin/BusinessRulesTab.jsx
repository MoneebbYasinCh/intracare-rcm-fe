import { useState, useEffect, useCallback } from 'react';
import { Loader2, Save, Check, X } from 'lucide-react';
import { api } from '../../api';
import { useToast } from '../shared/Toast';

export function BusinessRulesTab() {
  const toast = useToast();
  const [text, setText] = useState('');
  const [original, setOriginal] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.adminGetBusinessRules();
      setText(data.text || '');
      setOriginal(data.text || '');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const hasChanges = text !== original;

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.adminUpdateBusinessRules(text);
      toast.success('Business rules updated — restart server for changes to take effect');
      setOriginal(text);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-poppins font-semibold text-lg text-text-primary">
            Business Rules
          </h3>
          <p className="font-prompt text-sm text-text-secondary">
            Edit the business rules prompt used by the SQL generator
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-poppins text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Save Changes
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-text-secondary font-prompt text-sm">
          <Loader2 size={20} className="animate-spin mr-2" />
          Loading business rules...
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {hasChanges ? (
              <span className="flex items-center gap-1 text-warning font-prompt text-xs">
                <X size={12} />
                Unsaved changes
              </span>
            ) : (
              <span className="flex items-center gap-1 text-success font-prompt text-xs">
                <Check size={12} />
                Saved
              </span>
            )}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={30}
            className="w-full px-4 py-3 border border-border rounded-lg font-mono text-xs text-text-primary leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
          <p className="font-prompt text-xs text-text-secondary">
            After saving, restart the server for changes to take effect in the SQL generator.
          </p>
        </div>
      )}
    </div>
  );
}
