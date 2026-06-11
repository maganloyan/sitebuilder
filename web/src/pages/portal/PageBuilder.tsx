import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import { useFrappeGetDoc, useFrappeGetDocList, useFrappePostCall } from "frappe-react-sdk"
import { ArrowLeft, ArrowUp, ArrowDown, X, Plus, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { PageBuilderSkeleton } from "@/components/kit/feedback/view-skeletons"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { usePortalPageMetaOverride } from "@/context/portal-page-meta-context"

interface PageBlockItem {
  name?: string
  type: string
  web_template: string
  label: string
  web_template_values?: string
  idx?: number
}

export function PageBuilder() {
  const { pageName } = useParams<{ pageName: string }>()
  const [blocks, setBlocks] = useState<PageBlockItem[]>([])
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  const { apply: applyMeta, clear: clearMeta } = usePortalPageMetaOverride()

  const { data: page, isLoading: pageLoading } = useFrappeGetDoc<any>(
    "Site Page",
    pageName ?? ""
  )
  const { data: siteBlocks, isLoading: blocksLoading } = useFrappeGetDocList("Site Block", {
    fields: ["name"],
    limit: 200,
    orderBy: { field: "name", order: "asc" },
  })

  const { call: savePageBlocks, loading: saving } = useFrappePostCall(
    "sitebuilder.api.save_page_blocks"
  )

  const pageMeta = useMemo(
    () => ({
      title: page?.title ?? pageName ?? "Page Builder",
      breadcrumbs: [
        { label: "Portal", href: "/portal" },
        { label: "Site Pages", href: "/portal/app/site-page" },
        { label: page?.title ?? pageName ?? "…" },
      ],
    }),
    [page?.title, pageName]
  )

  useEffect(() => {
    applyMeta(pageMeta)
    return () => clearMeta()
  }, [applyMeta, clearMeta, pageMeta.title])

  useEffect(() => {
    if (page?.page_blocks) {
      setBlocks(page.page_blocks)
      setIsDirty(false)
    }
  }, [page])

  const addBlock = useCallback((blockName: string) => {
    setBlocks(prev => [
      ...prev,
      { type: "Page Block", web_template: blockName, label: blockName },
    ])
    setIsDirty(true)
  }, [])

  const removeBlock = useCallback((idx: number) => {
    setBlocks(prev => prev.filter((_, i) => i !== idx))
    setSelectedIdx(prev =>
      prev === idx ? null : prev !== null && prev > idx ? prev - 1 : prev
    )
    setIsDirty(true)
  }, [])

  const moveBlock = useCallback((idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir
    setBlocks(prev => {
      if (newIdx < 0 || newIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
      return next
    })
    setSelectedIdx(newIdx)
    setIsDirty(true)
  }, [])

  const handleSave = async () => {
    if (!pageName) return
    try {
      await savePageBlocks({
        page_name: pageName,
        blocks: JSON.stringify(
          blocks.map((b, i) => ({
            type: b.type || "Page Block",
            web_template: b.web_template,
            label: b.label,
            web_template_values: b.web_template_values ?? "{}",
            idx: i + 1,
          }))
        ),
      })
      setIsDirty(false)
      toast.success("Page saved")
    } catch {
      toast.error("Failed to save page")
    }
  }

  return (
    <div className="flex flex-col -m-4 md:-m-6 h-[calc(100vh-3.5rem)]">
      {/* Action bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-background shrink-0">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground h-8 px-2" asChild>
          <Link to="/portal/app/site-page">
            <ArrowLeft className="size-3.5" />
            Site Pages
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-sm font-medium truncate flex-1 min-w-0">
          {pageLoading ? (
            <Skeleton className="h-4 w-32 inline-block align-middle" />
          ) : (
            page?.title ?? pageName
          )}
        </span>
        {isDirty && (
          <Badge variant="outline" className="text-[11px] text-muted-foreground shrink-0">
            Unsaved
          </Badge>
        )}
        <Button size="sm" onClick={handleSave} disabled={saving || !isDirty} className="h-8">
          {saving ? (
            <Loader2 className="size-3.5 mr-1.5 animate-spin" />
          ) : (
            <Save className="size-3.5 mr-1.5" />
          )}
          Save
        </Button>
      </div>

      {/* Three-column body */}
      <div className="flex flex-1 min-h-0">
        {pageLoading || blocksLoading ? (
          <PageBuilderSkeleton />
        ) : (
          <>
        {/* Left — block library */}
        <div className="w-56 shrink-0 border-r bg-muted/20 flex flex-col">
          <div className="px-3 py-2 border-b">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Blocks
            </p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-0.5">
              {siteBlocks?.map(block => (
                    <button
                      key={block.name}
                      onClick={() => addBlock(block.name)}
                      className="w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-left hover:bg-accent transition-colors group"
                    >
                      <Plus className="size-3 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
                      <span className="truncate">{block.name}</span>
                    </button>
                  ))}
              {!siteBlocks?.length && (
                <p className="text-xs text-muted-foreground px-2 py-8 text-center leading-relaxed">
                  No blocks yet.
                  <br />
                  <Link
                    to="/portal/app/site-block/new"
                    className="underline hover:text-foreground"
                  >
                    Create a Site Block
                  </Link>
                </p>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Center — canvas */}
        <ScrollArea className="flex-1 bg-muted/10">
          <div className="p-6 min-h-full">
            <div className="max-w-2xl mx-auto space-y-2">
              {blocks.length === 0 ? (
                <div className="border-2 border-dashed rounded-xl p-16 text-center">
                  <p className="text-sm font-medium text-muted-foreground">No blocks on this page</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Click a block in the sidebar to add it
                  </p>
                </div>
              ) : (
                blocks.map((block, idx) => (
                  <div
                    key={`${block.web_template}-${idx}`}
                    onClick={() => setSelectedIdx(idx)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5 cursor-pointer",
                      "transition-all hover:shadow-sm",
                      selectedIdx === idx
                        ? "border-primary/60 ring-1 ring-primary/30 shadow-sm"
                        : "hover:border-muted-foreground/30"
                    )}
                  >
                    <span className="text-[11px] font-mono text-muted-foreground/50 w-5 text-center shrink-0 select-none">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {block.label || block.web_template}
                      </p>
                      {block.label && block.label !== block.web_template && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          {block.web_template}
                        </p>
                      )}
                    </div>
                    <div
                      className="flex items-center gap-0.5 shrink-0"
                      onClick={e => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-lg"
                        disabled={idx === 0}
                        onClick={() => moveBlock(idx, -1)}
                      >
                        <ArrowUp className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-lg"
                        disabled={idx === blocks.length - 1}
                        onClick={() => moveBlock(idx, 1)}
                      >
                        <ArrowDown className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeBlock(idx)}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
              {blocks.length > 0 && (
                <p className="text-center text-xs text-muted-foreground/50 pt-2">
                  {blocks.length} block{blocks.length !== 1 ? "s" : ""} · click sidebar to add more
                </p>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Right — inspector */}
        <div className="w-56 shrink-0 border-l bg-muted/20 flex flex-col">
          <div className="px-3 py-2 border-b">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Inspector
            </p>
          </div>
          <div className="flex-1 p-3">
            {selectedIdx !== null && blocks[selectedIdx] ? (
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
                    Block
                  </p>
                  <p className="text-sm font-medium">{blocks[selectedIdx].web_template}</p>
                </div>
                {blocks[selectedIdx].label &&
                  blocks[selectedIdx].label !== blocks[selectedIdx].web_template && (
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
                        Label
                      </p>
                      <p className="text-sm">{blocks[selectedIdx].label}</p>
                    </div>
                  )}
                <Separator />
                <p className="text-xs text-muted-foreground text-center pt-2">
                  Field editing coming in Phase 2
                </p>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  Select a block
                  <br />
                  to inspect it
                </p>
              </div>
            )}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  )
}
