"use client";

import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Save, 
  Code, 
  Eye, 
  Info,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { getEmailTemplatesAction, updateEmailTemplateAction } from "@/app/actions/email";

export default function EmailsPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    setLoading(true);
    const result = await getEmailTemplatesAction();
    if (result.success && result.data) {
      setTemplates(result.data);
      if (result.data.length > 0) setSelectedTemplate(result.data[0]);
    }
    setLoading(false);
  }

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setSaving(true);
    const result = await updateEmailTemplateAction(selectedTemplate.id, {
      subject: selectedTemplate.subject,
      body: selectedTemplate.body
    });
    if (result.success) {
      alert("Template saved successfully!");
      fetchTemplates();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Email Templates</h1>
          <p className="text-zinc-500 font-medium mt-1">Customize the messages your customers receive.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
        >
          {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: Template List */}
        <div className="lg:col-span-1 space-y-4">
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest px-2">System Emails</span>
          <div className="space-y-2">
            {loading ? (
              [1, 2].map(i => <div key={i} className="h-14 bg-zinc-900/40 rounded-2xl animate-pulse" />)
            ) : (
              templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left group",
                    selectedTemplate?.id === t.id 
                      ? "bg-orange-500/10 border-orange-500/20 text-orange-500" 
                      : "bg-zinc-900/40 border-white/5 text-zinc-400 hover:text-white hover:border-white/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Mail size={18} />
                    <span className="font-bold text-sm truncate">{t.name.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                  </div>
                  <ChevronRight size={16} className={cn("transition-transform", selectedTemplate?.id === t.id && "rotate-90")} />
                </button>
              ))
            )}
          </div>

          {/* Placeholder Help */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 space-y-4">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <Info size={16} className="text-orange-500" />
              Placeholders
            </h4>
            <div className="space-y-3">
              {[
                { key: "{{customer_name}}", label: "Full Name" },
                { key: "{{order_id}}", label: "Order UUID" },
                { key: "{{order_id_short}}", label: "8-char ID" },
                { key: "{{total_amount}}", label: "Price in ₹" },
                { key: "{{order_items}}", label: "HTML List" },
              ].map(p => (
                <div key={p.key} className="flex flex-col">
                  <code className="text-orange-500 text-[10px] font-bold tracking-wider">{p.key}</code>
                  <span className="text-zinc-500 text-[10px] font-medium">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-3 space-y-6">
          {selectedTemplate ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 lg:p-10 space-y-8"
            >
              {/* Subject Line */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Subject Line</label>
                <div className="relative group">
                  <input 
                    type="text"
                    value={selectedTemplate.subject}
                    onChange={(e) => setSelectedTemplate({...selectedTemplate, subject: e.target.value})}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-bold text-lg"
                  />
                </div>
              </div>

              {/* Body Editor (HTML) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                   <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Email Content (HTML)</label>
                   <div className="flex gap-2">
                      <button className="px-3 py-1 rounded-lg bg-white/5 text-zinc-500 text-[10px] font-bold hover:text-white transition-all flex items-center gap-1">
                        <Code size={12} /> Code
                      </button>
                      <button className="px-3 py-1 rounded-lg bg-white/5 text-zinc-500 text-[10px] font-bold hover:text-white transition-all flex items-center gap-1">
                        <Eye size={12} /> Preview
                      </button>
                   </div>
                </div>
                <textarea 
                  value={selectedTemplate.body}
                  onChange={(e) => setSelectedTemplate({...selectedTemplate, body: e.target.value})}
                  className="w-full bg-black/40 border border-white/5 rounded-3xl p-6 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono text-sm leading-relaxed min-h-[500px]"
                />
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500 font-medium">
              Select a template to begin editing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
