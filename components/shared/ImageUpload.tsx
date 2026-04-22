"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconX, IconPhoto } from "@tabler/icons-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

/**
 * Simple image upload component.
 * For now, uses a URL text input. When Supabase Storage is set up,
 * this can be extended with actual file upload.
 */
export function ImageUpload({
  value,
  onChange,
  label = "Image URL (Search in browser images then copy image address)",
}: ImageUploadProps) {
  const [preview, setPreview] = useState(value);

  function handleChange(url: string) {
    onChange(url);
    setPreview(url);
  }

  function handleClear() {
    onChange("");
    setPreview("");
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">{label}</Label>
      <div className="flex gap-2">
        <Input
          placeholder="https://example.com/image.jpg"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="flex-1"
        />
        {value && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={handleClear}
          >
            <IconX className="size-4" />
          </Button>
        )}
      </div>
      {preview ? (
        <div className="relative rounded-lg border border-border overflow-hidden bg-muted/40 w-full h-32">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={() => setPreview("")}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 h-32 text-muted-foreground">
          <div className="flex flex-col items-center gap-1">
            <IconPhoto className="size-6" />
            <span className="text-xs">No image</span>
          </div>
        </div>
      )}
    </div>
  );
}
