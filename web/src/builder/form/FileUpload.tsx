import { useRef, useState, DragEvent } from "react"
import { useFrappeFileUpload } from "frappe-react-sdk"
import { ImageIcon, FileIcon, UploadCloud, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import toast from "@/lib/portal-toast"

interface FileUploadProps {
  fieldname: string
  onFileUpload: (url: string) => void
  accept?: string
  /** Hint for layout: "square" (logo), "wide" (cover), "auto" (default) */
  shape?: "square" | "wide" | "auto"
}

export default function FileUpload({ fieldname, onFileUpload, accept, shape = "auto" }: FileUploadProps) {
  const { upload, progress, loading } = useFrappeFileUpload()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const isImage = accept?.includes("image") || shape === "wide" || shape === "square"

  const handleFile = async (file: File) => {
    try {
      const result = await upload(file, { isPrivate: false })
      onFileUpload(result.file_url)
      toast.success("Uploaded")
    } catch {
      toast.error("Upload failed")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ""
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const heightClass =
    shape === "square" ? "h-32 w-32" :
    shape === "wide"   ? "h-28 w-full" :
    isImage            ? "h-32 w-full" :
                         "h-20 w-full"

  return (
    <div className="space-y-2">
      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50",
          loading && "pointer-events-none opacity-70",
          heightClass
        )}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : isImage ? (
          <ImageIcon className="h-6 w-6 text-muted-foreground/60" />
        ) : (
          <FileIcon className="h-6 w-6 text-muted-foreground/60" />
        )}

        {!loading && shape !== "square" && (
          <div className="text-center px-3">
            <p className="text-xs font-medium text-muted-foreground">
              <span className="text-primary">Click to upload</span> or drag & drop
            </p>
            {accept && (
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                {isImage ? "PNG, JPG, GIF, WebP" : accept}
              </p>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          id={fieldname}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {loading && (
        <Progress value={progress} className="h-1" />
      )}
    </div>
  )
}
