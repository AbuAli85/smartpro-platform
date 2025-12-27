/**
 * Dynamic Template Form Generator
 * Automatically generates form fields based on template placeholders
 * Includes smart field type detection and Hijri date conversion
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'number' | 'textarea';
  required: boolean;
  placeholder?: string;
}

interface DynamicTemplateFormProps {
  placeholders: string[];
  onSubmit: (data: Record<string, any>) => void;
  isGenerating?: boolean;
  generatedDocUrl?: string;
}

export function DynamicTemplateForm({ 
  placeholders, 
  onSubmit, 
  isGenerating = false,
  generatedDocUrl 
}: DynamicTemplateFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Smart field detection based on placeholder name
  const detectFieldType = (placeholder: string): FieldDefinition => {
    const lower = placeholder.toLowerCase();
    
    // Email fields
    if (lower.includes('email')) {
      return {
        name: placeholder,
        label: formatLabel(placeholder),
        type: 'email',
        required: true,
        placeholder: 'example@email.com',
      };
    }
    
    // Phone fields
    if (lower.includes('phone') || lower.includes('mobile') || lower.includes('contact')) {
      return {
        name: placeholder,
        label: formatLabel(placeholder),
        type: 'phone',
        required: true,
        placeholder: '+968 9123 4567',
      };
    }
    
    // Date fields
    if (lower.includes('date') || lower.includes('day') || lower.includes('month') || lower.includes('year')) {
      return {
        name: placeholder,
        label: formatLabel(placeholder),
        type: 'date',
        required: true,
      };
    }
    
    // Number fields
    if (lower.includes('salary') || lower.includes('amount') || lower.includes('price') || 
        lower.includes('number') || lower.includes('id') || lower.includes('age')) {
      return {
        name: placeholder,
        label: formatLabel(placeholder),
        type: 'number',
        required: true,
        placeholder: lower.includes('salary') || lower.includes('amount') ? '1,500.000' : '12345',
      };
    }
    
    // Textarea fields (long text)
    if (lower.includes('address') || lower.includes('description') || 
        lower.includes('reason') || lower.includes('purpose') || lower.includes('details')) {
      return {
        name: placeholder,
        label: formatLabel(placeholder),
        type: 'textarea',
        required: false,
        placeholder: `Enter ${formatLabel(placeholder).toLowerCase()}...`,
      };
    }
    
    // Default to text
    return {
      name: placeholder,
      label: formatLabel(placeholder),
      type: 'text',
      required: true,
      placeholder: `Enter ${formatLabel(placeholder).toLowerCase()}...`,
    };
  };

  // Format placeholder name to readable label
  const formatLabel = (placeholder: string): string => {
    // Remove common suffixes
    let label = placeholder
      .replace(/Ar$/i, ' (Arabic)')
      .replace(/En$/i, ' (English)');
    
    // Convert camelCase to Title Case
    label = label.replace(/([A-Z])/g, ' $1').trim();
    
    // Capitalize first letter of each word
    label = label.replace(/\b\w/g, (char) => char.toUpperCase());
    
    return label;
  };

  // Generate field definitions
  const fields = placeholders.map(detectFieldType);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
      
      // Email validation
      if (field.type === 'email' && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = 'Invalid email format';
        }
      }
      
      // Phone validation (Oman format)
      if (field.type === 'phone' && formData[field.name]) {
        const phoneRegex = /^(\+968)?[0-9\s-]{8,15}$/;
        if (!phoneRegex.test(formData[field.name])) {
          newErrors[field.name] = 'Invalid phone number';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FieldDefinition) => {
    switch (field.type) {
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !formData[field.name] && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData[field.name] ? (
                  format(formData[field.name], 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData[field.name]}
                onSelect={(date) => handleChange(field.name, date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      
      case 'textarea':
        return (
          <Textarea
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
          />
        );
      
      case 'number':
        return (
          <Input
            type="text"
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );
      
      default:
        return (
          <Input
            type={field.type}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  if (generatedDocUrl) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <FileText className="w-5 h-5" />
            Document Generated Successfully!
          </CardTitle>
          <CardDescription>
            Your document is ready for download
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <a href={generatedDocUrl} download>
              <Download className="w-4 h-4 mr-2" />
              Download Document (.docx)
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fill Template Information</CardTitle>
          <CardDescription>
            Complete the form below to generate your document. Date fields will automatically include Hijri dates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
                {field.type === 'date' && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Auto Hijri
                  </Badge>
                )}
              </Label>
              {renderField(field)}
              {errors[field.name] && (
                <p className="text-sm text-red-500">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={isGenerating}
          className="min-w-[200px]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Document...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Generate Document
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
