"use client";

import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  type?: "text" | "email" | "password" | "url";
  maxLength?: number;
  showCounter?: boolean;
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  type = "text",
  maxLength,
  showCounter = false,
}: TextFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        {showCounter && maxLength && (
          <span className="text-xs text-muted-foreground">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        maxLength={maxLength}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  rows?: number;
  maxLength?: number;
  minLength?: number;
  showCounter?: boolean;
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  rows = 3,
  maxLength,
  minLength,
  showCounter = true,
}: TextAreaFieldProps) {
  const isUnderMin = minLength && value.length > 0 && value.length < minLength;
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        {showCounter && (
          <span className={`text-xs ${value.length === 0 ? 'text-muted-foreground' : isUnderMin ? 'text-amber-600' : 'text-muted-foreground'}`}>
            {value.length === 0 ? 'Required' : `${value.length} characters`}
          </span>
        )}
      </div>
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        rows={rows}
        maxLength={maxLength}
        minLength={minLength}
      />
      {isUnderMin && (
        <p className="text-xs text-amber-600">
          Please provide more details (at least {minLength} characters recommended)
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  required,
  error,
}: SelectFieldProps) {
  return (
    <FormField label={label} required={required} error={error}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
