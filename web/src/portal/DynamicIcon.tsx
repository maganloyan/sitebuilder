
// src/components/DynamicIcon.tsx
import * as LucideIcons from "lucide-react";
import { Folder } from "lucide-react";

interface DynamicIconProps {
  name?: string;
  className?: string;
}

export const DynamicIcon = ({ name, className }: DynamicIconProps) => {
  const Icon = name 
    ? (LucideIcons as Record<string, React.ComponentType>)[name] || Folder 
    : Folder;

  return <Icon className={className} />;
};





// // Extended version with more features
// interface DynamicIconProps {
//     name?: string;
//     className?: string;
//     size?: number;
//     color?: string;
//     onClick?: () => void;
//   }
  
//   export const DynamicIcon = ({ 
//     name, 
//     className, 
//     size = 24, 
//     color,
//     onClick 
//   }: DynamicIconProps) => {
//     const Icon = name 
//       ? (LucideIcons as Record<string, React.ComponentType>)[name] || Folder 
//       : Folder;
  
//     return (
//       <Icon 
//         className={className}
//         size={size}
//         color={color}
//         onClick={onClick}
//       />
//     );
//   };