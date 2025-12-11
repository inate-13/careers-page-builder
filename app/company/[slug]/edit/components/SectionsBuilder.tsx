// app/company/[slug]/edit/components/SectionsBuilder.tsx
'use client';
import React from 'react'; 
import { Button } from '../../../../components/ui/Button';
import { Textarea } from '../../../../components/ui/Textarea';
import { Input } from '../../../../components/ui/Input';
import { Label } from '../../../../components/ui/Label';
import { Switch } from '../../../../components/ui/Switch';
import { Separator } from '../../../../components/ui/Separator';
import { MoveUp, MoveDown, Trash2, Plus, Eye, EyeOff, ChevronDown, Check } from 'lucide-react'; // Added Check for visibility

// Using basic select/options for simplicity instead of Shadcn Select
const SimpleSelect = ({ value, onValueChange, options }: { value: string, onValueChange: (v: string) => void, options: { value: string; label: string }[] }) => (
    <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="block w-[180px] h-10 px-3 py-2 border rounded-md bg-white text-sm focus:border-blue-500 focus:ring-blue-500"
    >
        {options.map(opt => (
            <option key={opt.value} value={opt.value}>
                {opt.label}
            </option>
        ))}
    </select>
);


type SectionType = 'about_us' | 'life_at_company' | 'culture_video' | 'custom_text' | 'benefits' | 'jobs';

type Section = {
  id: string; // Can be a temporary string like 'new-123' or a real DB ID
  title: string | null;
  content: string | null;
  media_url: string | null;
  type: SectionType | string;
  visible: boolean;
  layout?: string | null; // Used for structured data like benefits
};

interface SectionsBuilderProps {
    sections: Section[];
    // Correct type for functional state updates (solves the 'prev' issue)
    setSections: React.Dispatch<React.SetStateAction<Section[]>>;
    companyId: string;
}


const SECTION_OPTIONS: { value: SectionType | string; label: string; description: string }[] = [
    { value: 'custom_text', label: 'Custom Content', description: 'A general-purpose text section.' },
    { value: 'about_us', label: 'About Us', description: 'Standard introductory section.' },
    { value: 'benefits', label: 'Benefits (Structured)', description: 'Special section for benefits.' },
    { value: 'life_at_company', label: 'Life at Company', description: 'Section for team photos or testimonials.' },
    { value: 'culture_video', label: 'Culture Video', description: 'Uses the main culture video link from Branding.' },
    { value: 'jobs', label: 'Open Jobs List', description: 'The main list of available positions.' },
];

export default function SectionsBuilder({
  sections,
  setSections,
  companyId, 
}: SectionsBuilderProps) {

  // Function to update a single section property in the parent state
  const updateLocal = (id: string, patch: Partial<Section>) => {
    setSections(prev => 
      prev.map(s => (s.id === id ? { ...s, ...patch } : s))
    );
  };

  // Function to move a section (updates parent state immediately)
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    // Use functional update to ensure atomicity
    setSections(prev => {
        const newSections = [...prev];
        [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
        return newSections;
    });
  };

  // Function to add a new section (updates parent state immediately)
  const addNewSection = () => {
    const newSection: Section = {
      id: `new-${Date.now()}`, // Use a temporary ID for client-side tracking
      title: 'New Custom Section',
      content: 'Add your content here.',
      type: 'custom_text',
      media_url: null,
      visible: true,
      layout: null,
    };
    setSections(prev => [...prev, newSection]);
  };

  // Function to delete a section (updates parent state immediately)
  const deleteSection = (id: string) => {
    // Note: The actual deletion from the database happens when the parent Save function is called.
    setSections(prev => prev.filter(s => s.id !== id));
  };


  return (
    <div className="space-y-4">
      <Button onClick={addNewSection} className="w-full mb-4">
        <Plus className="mr-2 h-4 w-4" /> Add New Section
      </Button>
      <Separator />

      <div className="w-full space-y-3">
        {sections.map((s, idx) => (
          // Using HTML details/summary for simple accordion/collapse functionality
          // Note: Add 'open' attribute to details to keep it open by default on creation if desired
          <details key={s.id} className="border rounded-lg shadow-sm bg-white overflow-hidden group">
            
            {/* Summary (Header/Trigger) */}
            <summary className="cursor-pointer list-none flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4 w-full">
                    {s.visible ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-red-600" />}
                    <span className="font-semibold truncate">
                        {s.title || SECTION_OPTIONS.find(o => o.value === s.type)?.label || 'Untitled Section'} 
                        <span className="text-sm text-gray-500 ml-2">({SECTION_OPTIONS.find(o => o.value === s.type)?.label || s.type})</span>
                    </span>
                    <div className="flex items-center space-x-2 ml-auto">
                        <span className="text-sm text-gray-500 min-w-[30px]">{idx + 1}</span>
                        <div className="flex space-x-1">
                            {/* Move Up */}
                            <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={(e) => { e.preventDefault(); moveSection(idx, 'up'); }} 
                                disabled={idx === 0}
                                className='h-8 w-8'
                            ><MoveUp className="h-4 w-4" /></Button>
                            {/* Move Down */}
                            <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={(e) => { e.preventDefault(); moveSection(idx, 'down'); }} 
                                disabled={idx === sections.length - 1}
                                className='h-8 w-8'
                            ><MoveDown className="h-4 w-4" /></Button>
                        </div>
                        {/* Accordion Chevron */}
                        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                    </div>
                </div>
            </summary>

            {/* Content (Editor) */}
            <div className="space-y-4 p-4">
              <Separator />

              {/* Visibility and Type */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-2">
                      <Switch
                          id={`visible-${s.id}`}
                          checked={s.visible}
                          onCheckedChange={(checked) => updateLocal(s.id, { visible: checked })}
                      />
                      <Label htmlFor={`visible-${s.id}`} className='flex items-center'>
                        {s.visible ? <Check className='h-4 w-4 mr-1 text-green-600' /> : <EyeOff className='h-4 w-4 mr-1 text-red-600' />}
                        {s.visible ? 'Visible on Page' : 'Hidden (Draft Only)'}
                      </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label className='whitespace-nowrap'>Section Type</Label>
                    <SimpleSelect
                        value={s.type as string}
                        onValueChange={(value) => updateLocal(s.id, { type: value as SectionType })}
                        options={SECTION_OPTIONS}
                    />
                  </div>
              </div>

              {/* Title, Content, Media (Conditionally Rendered) */}
              
              {/* Title */}
              {s.type !== 'jobs' && s.type !== 'culture_video' && (
                <div className="space-y-1">
                  <Label htmlFor={`title-${s.id}`}>Section Title</Label>
                  <Input
                    id={`title-${s.id}`}
                    value={s.title ?? ''}
                    onChange={(e) => updateLocal(s.id, { title: e.target.value })}
                    placeholder="E.g., Our Core Values"
                  />
                </div>
              )}

              {/* Content */}
              {s.type !== 'jobs' && s.type !== 'culture_video' && (
                <div className="space-y-1">
                  <Label htmlFor={`content-${s.id}`}>Content (Text)</Label>
                  <Textarea
                    id={`content-${s.id}`}
                    value={s.content ?? ''}
                    onChange={(e) => updateLocal(s.id, { content: e.target.value })}
                    placeholder="Enter detailed text here. Note: Simple HTML is supported (e.g., <strong>)."
                    rows={6}
                  />
                </div>
              )}
              
              {/* Media URL */}
              {s.type !== 'jobs' && s.type !== 'culture_video' && (
                <div className="space-y-1">
                  <Label htmlFor={`media_url-${s.id}`}>Section Image/Video URL</Label>
                  <Input
                    id={`media_url-${s.id}`}
                    value={s.media_url ?? ''}
                    onChange={(e) => updateLocal(s.id, { media_url: e.target.value })}
                    placeholder="URL for an image (optional)"
                  />
                  <p className="text-xs text-gray-500">This URL is for content in this specific section, separate from the main banner/logo.</p>
                  {s.media_url && s.media_url.startsWith('http') && (
                     <img src={s.media_url} alt="Media Preview" className="mt-2 h-20 w-auto object-contain rounded border" />
                  )}
                </div>
              )}

              {/* Layout Helper for Benefits (JSON input) */}
              {s.type === 'benefits' && (
                <div className="space-y-1 p-3 border rounded-lg bg-yellow-50/50">
                    <Label htmlFor={`layout-${s.id}`}>Layout Data (for {s.type})</Label>
                    <Textarea 
                      id={`layout-${s.id}`}
                      value={s.layout ?? ''}
                      onChange={(e) => updateLocal(s.id, { layout: e.target.value })}
                      placeholder='[{"title":"Free Lunch","icon":"fork","description":"..."}, ...]' 
                      rows={3}
                    />
                    <p className="text-xs text-red-500">This field expects a valid JSON array for structured data (e.g., benefits lists).</p>
                </div>
              )}

              {/* Deletion */}
              <div className="pt-4 flex justify-end">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={(e) => { e.preventDefault(); deleteSection(s.id); }} // Prevent details from closing
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Section
                </Button>
              </div>
            </div>
          </details>
        ))}
      </div>
      
      {sections.length === 0 && (
          <div className="text-center p-6 text-gray-500 border rounded-lg">
              No sections added yet. Click "Add New Section" above to start building your page.
          </div>
      )}
    </div>
  );
}