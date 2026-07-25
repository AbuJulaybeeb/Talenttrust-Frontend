'use client';

import { useState } from 'react';
import { useToast } from './toast-provider';
import { FormField } from '../FormField';

export function ToastDemo() {
  const { showError, showSuccess } = useToast();
  
  const [title, setTitle] = useState('Milestone released');
  const [description, setDescription] = useState('Funds are on the way to the freelancer wallet.');
  const [duration, setDuration] = useState('');
  const [errors, setErrors] = useState<{ fieldId: string; message: string }[]>([]);

  const validate = () => {
    const newErrors: { fieldId: string; message: string }[] = [];
    
    if (!title.trim()) {
      newErrors.push({ fieldId: 'title', message: 'Title is required' });
    } else if (title.length > 50) {
      newErrors.push({ fieldId: 'title', message: 'Title must be 50 characters or less' });
    }

    if (description && description.length > 200) {
      newErrors.push({ fieldId: 'description', message: 'Description must be 200 characters or less' });
    }
    
    if (duration) {
      const durationMs = parseInt(duration, 10);
      if (isNaN(durationMs) || durationMs < 1000 || durationMs > 60000) {
        newErrors.push({ fieldId: 'duration', message: 'Duration must be between 1000 and 60000 ms' });
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (variant: 'success' | 'error') => {
    if (!validate()) return;
    
    const toastData = {
      title: title.trim(),
      description: description.trim() || undefined,
      duration: duration ? parseInt(duration, 10) : undefined,
    };

    if (variant === 'success') {
      showSuccess(toastData);
    } else {
      showError(toastData);
    }
  };

  const getError = (fieldId: string) => errors.find((e) => e.fieldId === fieldId)?.message;

  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-6 w-full max-w-md mx-auto">
      <form
        className="w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
        onSubmit={(e) => { e.preventDefault(); handleSubmit('success'); }}
        noValidate
      >
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Test Notifications</h3>
        
        <FormField label="Title" id="title" error={getError('title')} required>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </FormField>
        
        <FormField label="Description" id="description" error={getError('description')}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            rows={2}
          />
        </FormField>
        
        <FormField label="Duration (ms)" id="duration" error={getError('duration')} helperText="Optional. Overrides default duration.">
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            placeholder="e.g. 5000"
          />
        </FormField>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={() => handleSubmit('success')}
            
            className="flex-1 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
          >
            Show Success
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('error')}
            
            className="flex-1 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:opacity-50"
          >
            Show Error
          </button>
        </div>
      </form>
    </div>
  );
}
