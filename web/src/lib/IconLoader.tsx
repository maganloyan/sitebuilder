import React, { useState, useEffect } from "react";

interface IconLoaderProps {
  icon: string;
  size?: number; // Optionally specify the size of the icon
  className?: string; // Additional custom class names for styling
}

const IconLoader: React.FC<IconLoaderProps> = ({ icon, size = 24, className = "" }) => {
  const [IconComponent, setIconComponent] = useState<React.ElementType | null>(null);

  useEffect(() => {
    const loadIcon = async () => {
      try {
        const { [icon]: ImportedIcon } = await import("lucide-react");
        setIconComponent(() => ImportedIcon || "");
      } catch (error) {
        console.error(`Icon "${icon}" not found. Using default icon.`, error);
        setIconComponent(() => "");
      }
    };
    loadIcon();
  }, [icon]);

  const IconToRender = IconComponent || "";

  return <IconToRender className={`w-${size} h-${size} ${className}`} />;
};

export default IconLoader;

