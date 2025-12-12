'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Trash2, ChevronUp, ChevronDown, Edit2, CheckCircle2, GripVertical, Image as ImageIcon, Film, Type, LayoutGrid, Plus } from 'lucide-react';

export type SectionType = 'default' | 'cards' | 'carousel' | 'video' | 'custom';

export type CardItem = {
  id: string;
  title: string;
  subtitle?: string;
  body?: string;
  image?: string;
};

export type SectionShape = {
  id: string; // existing DB id or 'new-...'
  company_id?: string;
  type: string;
  title?: string | null;
  content?: string | null;
  media_url?: string | null;
  layout?: string | null;
  order_index?: number;
  visible?: boolean;
  created_at?: string;
  updated_at?: string;
  _dirty?: boolean;
};

export default function SectionsBuilder({
  sections: initial = [],
  onChange,
  onDeletedChange,
}: {
  sections: SectionShape[];
  onChange: (next: SectionShape[]) => void;
  onDeletedChange?: (deletedIds: string[]) => void;
}) {
  const [sections, setSections] = useState<SectionShape[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Sync incoming props into local state when parent provides new data
  useEffect(() => {
    const normalized = (initial ?? []).map((s, idx) => ({ ...s, order_index: s.order_index ?? idx, visible: s.visible ?? true }));
    setSections(normalized);
  }, [initial]);

  const notifyParent = (next: SectionShape[], nextDeleted?: string[]) => {
    onChange(next);
    if (typeof onDeletedChange === 'function' && nextDeleted) onDeletedChange(nextDeleted);
  };

  const makeNewSection = (type: SectionType): SectionShape => {
    const id = `new-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const base: SectionShape = {
      id,
      type,
      title: type === 'cards' ? 'Our Values' : type === 'video' ? 'Culture Video' : 'New Section',
      content: type === 'default' ? 'Add your content description here.' : null,
      media_url: null,
      layout: null,
      visible: true,
      order_index: sections.length,
      _dirty: true,
    };
    if (type === 'cards') {
      const defaultCards: CardItem[] = [
        { id: `${id}-c1`, title: 'Value 1', subtitle: 'Subtitle', body: 'Description...', image: '' },
        { id: `${id}-c2`, title: 'Value 2', subtitle: 'Subtitle', body: 'Description...', image: '' },
      ];
      base.layout = JSON.stringify(defaultCards);
    }
    if (type === 'carousel') {
      const slides = [{ id: `${id}-s1`, title: 'Slide 1', image: '' }];
      base.layout = JSON.stringify(slides);
    }
    return base;
  };

  function startAddTemplate(type: SectionType) {
    const s = makeNewSection(type);
    const next = [...sections, s];
    setSections(next);
    setEditingId(s.id);
    notifyParent(next);
  }

  function updateLocal(id: string, patch: Partial<SectionShape>) {
    const next = sections.map((s) => (s.id === id ? { ...s, ...patch, _dirty: true } : s));
    setSections(next);
    notifyParent(next);
  }

  function removeSection(id: string) {
    if (!confirm('Delete this section? You must click "Save Sections" to persist this change.')) return;
    const next = sections.filter((s) => s.id !== id);
    setSections(next);

    // Notify parent about deletion
    if (!id.startsWith('new-') && onDeletedChange) {
      onDeletedChange([id]);
    }
    notifyParent(next);

    if (editingId === id) setEditingId(null);
  }

  function moveUp(idx: number) {
    if (idx <= 0) return;
    const arr = [...sections];
    const prev = arr[idx - 1];
    const curr = arr[idx];
    if (!prev || !curr) return;

    arr[idx - 1] = curr;
    arr[idx] = prev;

    const next = arr.map((s, i) => ({ ...s, order_index: i }));
    setSections(next);
    notifyParent(next);
  }

  function moveDown(idx: number) {
    if (idx >= sections.length - 1) return;
    const arr = [...sections];
    const curr = arr[idx];
    const post = arr[idx + 1];
    if (!curr || !post) return;

    arr[idx] = post;
    arr[idx + 1] = curr;

    const next = arr.map((s, i) => ({ ...s, order_index: i }));
    setSections(next);
    notifyParent(next);
  }

  // --- HTML5 Drag & Drop (Simple Reordering) ---
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent, position: number) => {
    dragItem.current = position;
    // e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, position: number) => {
    dragOverItem.current = position;
    e.preventDefault();
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const copy = [...sections];
      const dragItemContent = copy[dragItem.current];
      copy.splice(dragItem.current, 1);
      copy.splice(dragOverItem.current, 0, dragItemContent);

      const next = copy.map((s, i) => ({ ...s, order_index: i }));
      setSections(next);
      notifyParent(next);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };


  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Sections List */}
      <div className="space-y-4">
        {sections.map((s, idx) => {
          const isEditing = editingId === s.id;
          return (
            <div
              key={s.id}
              draggable={!isEditing}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragEnter={(e) => handleDragEnter(e, idx)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`bg-white rounded-xl border transition-all duration-200 ${isEditing ? 'border-indigo-500 shadow-lg ring-1 ring-indigo-500 scale-[1.01]' : 'border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md'}`}
            >

              {/* Header Row */}
              <div className="flex items-center gap-4 p-4 select-none">
                <div
                  className={`cursor-grab text-slate-400 hover:text-slate-600 p-1 ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Drag to reorder"
                >
                  <GripVertical size={20} />
                </div>

                <div className={`p-2.5 rounded-lg shrink-0 ${isEditing ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                  {s.type === 'default' && <Type size={20} />}
                  {s.type === 'cards' && <LayoutGrid size={20} />}
                  {s.type === 'carousel' && <ImageIcon size={20} />}
                  {s.type === 'video' && <Film size={20} />}
                </div>

                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setEditingId(isEditing ? null : s.id)}>
                  <h4 className={`font-bold text-base truncate ${isEditing ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {s.title || '(Untitled Section)'}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium capitalize mt-0.5 flex items-center gap-2">
                    {s.type.replace('_', ' ')}
                    {!s.visible && <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide">Hidden</span>}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5 mr-2">
                    <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded disabled:opacity-20"><ChevronUp size={14} /></button>
                    <button onClick={() => moveDown(idx)} disabled={idx === sections.length - 1} className="p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded disabled:opacity-20"><ChevronDown size={14} /></button>
                  </div>

                  {isEditing ? (
                    <button onClick={() => setEditingId(null)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
                      <CheckCircle2 size={16} />
                      Done
                    </button>
                  ) : (
                    <button onClick={() => setEditingId(s.id)} className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 text-sm font-bold rounded-lg transition-all">
                      <Edit2 size={16} />
                      Edit
                    </button>
                  )}

                  <button onClick={() => removeSection(s.id)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors ml-1" title="Delete Section">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Editor Pane (Expandable) */}
              {isEditing && (
                <div className="border-t border-indigo-100 p-6 bg-indigo-50/10 rounded-b-xl animate-in slide-in-from-top-2 duration-200">
                  <SectionEditor
                    section={s}
                    onUpdate={(patch) => updateLocal(s.id, patch)}
                  />
                </div>
              )}
            </div>
          );
        })}

        {sections.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-sm">🚀</div>
            <h3 className="text-slate-900 font-bold text-lg">Start building your page</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">Add your first section below. You can include text, image galleries, video, and grid cards.</p>
          </div>
        )}
      </div>

      {/* Add New Section */}
      <div className="pt-4 border-t border-slate-100">
        <SectionTypeSelector onSelect={startAddTemplate} />
      </div>

    </div>
  );
}

function SectionTypeSelector({ onSelect }: { onSelect: (t: SectionType) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 font-bold rounded-xl transition-all flex items-center justify-center gap-3 group animate-in fade-in"
      >
        <div className="bg-slate-200 group-hover:bg-indigo-600 group-hover:text-white text-slate-500 rounded-md w-8 h-8 flex items-center justify-center transition-colors">
          <Plus size={20} />
        </div>
        <span className="text-lg">Add New Section</span>
      </button>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 animate-in zoom-in-95 slide-in-from-bottom-2 duration-200">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold text-base text-slate-800 flex items-center gap-2">
          <Plus size={16} className="text-indigo-600" />
          Pick a Section Type
        </h4>
        <button onClick={() => setIsOpen(false)} className="text-xs text-slate-400 hover:text-slate-700 font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full">Cancel</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={() => { onSelect('default'); setIsOpen(false); }} className="p-4 text-left rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-all group hover:-translate-y-1 hover:shadow-md">
          <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mb-3 group-hover:ring-2 group-hover:ring-indigo-100">
            <Type className="text-slate-500 group-hover:text-indigo-600" size={24} />
          </div>
          <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-700">Text Content</div>
          <p className="text-xs text-slate-500 leading-relaxed mt-2">Standard text block with an optional side image.</p>
        </button>

        <button onClick={() => { onSelect('cards'); setIsOpen(false); }} className="p-4 text-left rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-all group hover:-translate-y-1 hover:shadow-md">
          <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mb-3 group-hover:ring-2 group-hover:ring-indigo-100">
            <LayoutGrid className="text-slate-500 group-hover:text-indigo-600" size={24} />
          </div>
          <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-700">Feature Cards</div>
          <p className="text-xs text-slate-500 leading-relaxed mt-2">Grid layout for features, values, or benefits.</p>
        </button>

        <button onClick={() => { onSelect('carousel'); setIsOpen(false); }} className="p-4 text-left rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-all group hover:-translate-y-1 hover:shadow-md">
          <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mb-3 group-hover:ring-2 group-hover:ring-indigo-100">
            <ImageIcon className="text-slate-500 group-hover:text-indigo-600" size={24} />
          </div>
          <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-700">Image Gallery</div>
          <p className="text-xs text-slate-500 leading-relaxed mt-2">Scrollable carousel for photos or logos.</p>
        </button>

        <button onClick={() => { onSelect('video'); setIsOpen(false); }} className="p-4 text-left rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-all group hover:-translate-y-1 hover:shadow-md">
          <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mb-3 group-hover:ring-2 group-hover:ring-indigo-100">
            <Film className="text-slate-500 group-hover:text-indigo-600" size={24} />
          </div>
          <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-700">Video Embed</div>
          <p className="text-xs text-slate-500 leading-relaxed mt-2">Embed a YouTube video player responsively.</p>
        </button>
      </div>
    </div>
  );
}

function SectionEditor({ section, onUpdate }: { section: SectionShape, onUpdate: (p: Partial<SectionShape>) => void }) {
  if (!section) return null;
  const getLayout = () => { try { return section.layout ? JSON.parse(section.layout) : [] } catch { return [] } };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Section Title</label>
          <input
            value={section.title ?? ''}
            onChange={e => onUpdate({ title: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
            placeholder="e.g. Our Values"
          />
        </div>
        <div className="flex items-end pb-3">
          <label className="flex items-center gap-3 cursor-pointer group select-none p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="relative flex items-center">
              <input type="checkbox" checked={!!section.visible} onChange={e => onUpdate({ visible: e.target.checked })} className="peer w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer transition-all" />
            </div>
            <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900">Visible on public page</span>
          </label>
        </div>
      </div>

      {section.type === 'default' && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Content</label>
            <textarea
              value={section.content ?? ''}
              onChange={e => onUpdate({ content: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm resize-y"
              placeholder="Write your content here..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Image URL (Optional)</label>
            <div className="flex gap-2">
              <input
                value={section.media_url ?? ''}
                onChange={e => onUpdate({ media_url: e.target.value })}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none"
                placeholder="https://..."
              />
              {section.media_url && <img src={section.media_url} className="w-10 h-10 rounded object-cover border" alt="Preview" />}
            </div>
          </div>
        </div>
      )}

      {section.type === 'video' && (
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">YouTube URL</label>
          <input
            value={section.media_url ?? ''}
            onChange={e => onUpdate({ media_url: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none"
            placeholder="https://youtube.com/watch?v=..."
          />
          <p className="text-xs text-slate-400 mt-1.5 ml-1">Paste the full YouTube URL here.</p>
        </div>
      )}

      {section.type === 'cards' && (
        <CardsEditor layout={getLayout()} onChange={val => onUpdate({ layout: JSON.stringify(val) })} />
      )}

      {section.type === 'carousel' && (
        <CarouselEditor layout={getLayout()} onChange={val => onUpdate({ layout: JSON.stringify(val) })} />
      )}
    </div>
  );
}

function CardsEditor({ layout, onChange }: { layout: CardItem[], onChange: (l: CardItem[]) => void }) {
  // Simple reorder for cards could be added similarly, but standard list for now
  const update = (idx: number, patch: Partial<CardItem>) => {
    const next = [...layout];
    next[idx] = { ...next[idx], ...patch } as CardItem;
    onChange(next);
  };
  const remove = (idx: number) => onChange(layout.filter((_, i) => i !== idx));
  const add = () => onChange([...layout, { id: Date.now().toString(), title: 'New Item', subtitle: '', body: '' }]);

  return (
    <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <LayoutGrid size={14} />
          Cards List
        </label>
        <button onClick={add} className="text-xs px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-700 text-slate-700 font-bold rounded-md transition-colors shadow-sm">+ Add Item</button>
      </div>
      <div className="grid gap-3">
        {layout.map((c, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 relative group hover:border-indigo-300 transition-all shadow-sm">
            <button onClick={() => remove(i)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
            <div className="grid gap-3">
              <input value={c.title} onChange={e => update(i, { title: e.target.value })} className="w-[90%] bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 px-0 py-1 font-bold text-sm outline-none transition-colors" placeholder="Card Title" />
              <input value={c.subtitle ?? ''} onChange={e => update(i, { subtitle: e.target.value })} className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 px-0 py-1 text-xs outline-none transition-colors" placeholder="Subtitle (Optional)" />
              <textarea value={c.body ?? ''} onChange={e => update(i, { body: e.target.value })} className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg p-2.5 text-xs h-16 resize-none outline-none mt-1 transition-all" placeholder="Description..." />
            </div>
          </div>
        ))}
        {layout.length === 0 && <div className="text-center text-xs text-slate-400 italic py-4">No cards added yet. Click "+ Add Item" to start.</div>}
      </div>
    </div>
  )
}

function CarouselEditor({ layout, onChange }: { layout: any[], onChange: (l: any[]) => void }) {
  const update = (idx: number, patch: Partial<any>) => {
    const next = [...layout];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };
  const remove = (idx: number) => onChange(layout.filter((_, i) => i !== idx));
  const add = () => onChange([...layout, { id: Date.now().toString(), title: '', image: '' }]);

  return (
    <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <ImageIcon size={14} />
          Gallery Slides
        </label>
        <button onClick={add} className="text-xs px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-700 text-slate-700 font-bold rounded-md transition-colors shadow-sm">+ Add Slide</button>
      </div>
      <div className="space-y-3">
        {layout.map((c, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-3 shadow-sm hover:border-indigo-300 transition-colors">
            <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-400">{i + 1}</div>
            <div className="flex-1 space-y-2">
              <input value={c.title ?? ''} onChange={e => update(i, { title: e.target.value })} className="w-full bg-transparent border-b border-dashed border-slate-200 focus:border-indigo-500 px-1 py-0.5 text-sm outline-none" placeholder="Caption" />
              <input value={c.image ?? ''} onChange={e => update(i, { image: e.target.value })} className="w-full bg-transparent border-b border-dashed border-slate-200 focus:border-indigo-500 px-1 py-0.5 text-xs outline-none text-slate-500" placeholder="Image URL" />
            </div>
            <button onClick={() => remove(i)} className="text-slate-300 hover:text-red-500 p-2 rounded hover:bg-red-50"><Trash2 size={16} /></button>
          </div>
        ))}
        {layout.length === 0 && <div className="text-center text-xs text-slate-400 italic py-4">No slides added yet.</div>}
      </div>
    </div>
  )
}