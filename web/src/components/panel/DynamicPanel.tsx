import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useFrappeGetDoc, useFrappeGetDocList } from "frappe-react-sdk";
import { LayoutDashboard, ChevronRight } from "lucide-react";
import NotFound from "@/pages/NotFound";
import getBlockStyles from "@/utils/getBlockStyles";

// Renders child Work Panels when a group parent has no page_blocks
function ChildIndex({ parentName }: { parentName: string }) {
  const { data: children } = useFrappeGetDocList("Work Panel", {
    fields: ["name", "title", "route", "icon"],
    filters: [["parent_page", "=", parentName]],
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
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium flex-1">{child.title}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
        </Link>
      ))}
    </div>
  )
}

const DynamicPanel: React.FC = () => {
  
  const {  pageName } = useParams();
 
  const { data: frontPageData, error } = useFrappeGetDoc("Work Panel", pageName || "");

  // Group parent Work Panels (is_group=true) have no page_blocks — show nothing useful
  // The sidebar handles navigation to their children

  const [importedComponents, setImportedComponents] = useState<any>({});

 

  useEffect(() => {
    const loadComponents = async () => {
      if (frontPageData) {
        const loadedComponents: any = {};
        for (const block of frontPageData.page_blocks) {
          const { label, hide_block, folder } = block;
          
          // Skip hidden blocks
          if (hide_block) continue;

          // Dynamically import each component
          try {
            const module = await import(`@/components/${folder}/${label}.tsx`);
            loadedComponents[block.name] = module.default;
          } catch (error) {
            console.error(`Error loading component: ${label}`, error);
            loadedComponents[block.name] = () => <div>Component not found: {label}</div>;
          }
        }

        // Store the loaded components in state
        setImportedComponents(loadedComponents);
      }
    };

    loadComponents();
  }, [frontPageData]);

  if (error) return <NotFound />;
  if (!frontPageData) return null;

  // Group parent: has no page_blocks — show a card grid of its children
  const hasBlocks = frontPageData.page_blocks?.length > 0
  if (!hasBlocks) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">{frontPageData.title}</h1>
        <ChildIndex parentName={frontPageData.name} />
      </div>
    )
  }

  const { meta_title, meta_description, meta_image } = frontPageData;
  return (
    <>
    {/* SEO Meta Tags */}
    <Helmet>
      {meta_title && <title>{meta_title}</title>}
      {meta_description && <meta name="description" content={meta_description} />}
      {meta_image && <meta property="og:image" content={meta_image} />}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Helmet>

    <div>
      {frontPageData.page_blocks.map((block: any) => {
        const { name, web_template_values, hide_block } = block;

        // Skip hidden blocks
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
