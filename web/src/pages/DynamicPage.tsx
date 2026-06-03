import React, { useState, useEffect } from "react";
import {  useParams } from "react-router-dom";
import {Helmet} from "react-helmet";
import { useFrappeGetDoc } from "frappe-react-sdk";
import NotFound from "@/pages//NotFound";
import getBlockStyles from "@/utils/getBlockStyles";

const DynamicPage: React.FC = () => {
  
  const {  pageName } = useParams();
 
  const { data: frontPageData, error } = useFrappeGetDoc("Site Page", pageName || "");

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

  if (error ) {
    return <NotFound />;
  }
  if ( !frontPageData) {
    return null;
  }
 
  // Extract SEO metadata
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

export default DynamicPage;
