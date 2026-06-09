import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useFrappeGetDoc, useFrappeGetDocList } from "frappe-react-sdk";
import { LayoutDashboard, ChevronRight } from "lucide-react";
import NotFound from "@/pages/NotFound";
import getBlockStyles from "@/lib/getBlockStyles";
import { usePortalPageMetaOverride } from "@/context/portal-page-meta-context";
import { buildWorkPanelPageMeta } from "@/lib/portal-page-meta-route";
import { DynamicIcon } from "@/portal/DynamicIcon";

function ChildIndex({ parentName }: { parentName: string }) {
  const { data: children } = useFrappeGetDocList("Work Panel", {
    fields: ["name", "title", "route", "icon"],
    filters: [
      ["parent_page", "=", parentName],
      ["published", "=", 1],
    ],
    orderBy: { field: "sequence_id", order: "asc" },
  })

  if (!children?.length) {
    return <p className="text-sm text-muted-foreground">No sub-pages yet.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {children.map(child => (
        <Link
          key={child.name}
          to={`/portal/${child.route}`}
          className="flex items-center gap-3 rounded-lg border bg-card p-4 hover:bg-accent hover:border-primary/30 transition-colors group"
        >
          <div className="flex items-center justify-center h-9 w-9 rounded-md bg-primary/10 text-primary shrink-0">
            {child.icon ? (
              <DynamicIcon name={child.icon} className="h-4 w-4" />
            ) : (
              <LayoutDashboard className="h-4 w-4" />
            )}
          </div>
          <span className="text-sm font-medium flex-1">{child.title}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
        </Link>
      ))}
    </div>
  )
}

const DynamicPanel: React.FC = () => {
  const { pageName } = useParams();
  const { data: frontPageData, error } = useFrappeGetDoc("Work Panel", pageName || "");
  const { apply: applyPageMeta, clear: clearPageMeta } = usePortalPageMetaOverride();
  const [importedComponents, setImportedComponents] = useState<Record<string, React.ComponentType>>({});

  useEffect(() => {
    if (!frontPageData?.title) return;
    const hasBlocks = (frontPageData.page_blocks?.length ?? 0) > 0;
    applyPageMeta(
      buildWorkPanelPageMeta(
        frontPageData.title,
        hasBlocks
          ? ((frontPageData.description as string | undefined) || "Custom portal page")
          : "Choose a section to continue."
      )
    );
    return () => clearPageMeta();
  }, [frontPageData?.title, frontPageData?.description, frontPageData?.page_blocks, applyPageMeta, clearPageMeta]);

  useEffect(() => {
    const loadComponents = async () => {
      if (!frontPageData?.page_blocks) return;
      const loadedComponents: Record<string, React.ComponentType> = {};
      for (const block of frontPageData.page_blocks) {
        const { label, hide_block, folder } = block;
        if (hide_block) continue;
        try {
          const module = await import(`@/components/${folder}/${label}.tsx`);
          loadedComponents[block.name] = module.default;
        } catch (err) {
          console.error(`Error loading component: ${label}`, err);
          loadedComponents[block.name] = () => <div>Component not found: {label}</div>;
        }
      }
      setImportedComponents(loadedComponents);
    };
    void loadComponents();
  }, [frontPageData]);

  if (error) return <NotFound />;
  if (!frontPageData) return null;

  const hasBlocks = frontPageData.page_blocks?.length > 0;
  if (!hasBlocks) {
    return <ChildIndex parentName={frontPageData.name} />;
  }

  const { meta_title, meta_description, meta_image } = frontPageData;

  return (
    <>
      <Helmet>
        {meta_title && <title>{meta_title}</title>}
        {meta_description && <meta name="description" content={meta_description} />}
        {meta_image && <meta property="og:image" content={meta_image} />}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>
      <div className="space-y-4">
        {frontPageData.page_blocks.map((block: { name: string; web_template_values?: string; hide_block?: number; folder?: string; label?: string }) => {
          const { name, web_template_values, hide_block } = block;
          if (hide_block) return null;
          const DynamicComponent = importedComponents[name];
          const parsedWebTemplateValues = JSON.parse(web_template_values || "{}");
          const { classes, inlineStyles, overlayStyles } = getBlockStyles(block);
          return (
            <div key={block.name} className={classes} style={inlineStyles}>
              {Object.keys(overlayStyles).length > 0 && (
                <div style={overlayStyles as React.CSSProperties} aria-hidden="true" />
              )}
              {DynamicComponent && <DynamicComponent {...parsedWebTemplateValues} />}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default DynamicPanel;
