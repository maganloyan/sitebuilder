// Utility function to get block styles
const getBlockStyles = (block: any) => {
    let classes = "";
    let inlineStyles: any = {};
    let overlayStyles = {};
  
    if (block.add_container) classes += "container mx-auto ";
    if (block.add_border_at_top) classes += "border-t ";
    if (block.add_border_at_bottom) classes += "border-b ";
    if (block.add_shade) classes += "bg-gray-100 dark:bg-gray-800 ";
    if (block.add_top_padding) classes += "pt-10 ";
    if (block.add_bottom_padding) classes += "pb-10 ";
  
    if (block.add_background_image && block.background_image) {
      classes += "bg-cover bg-center ";
      inlineStyles.backgroundImage = `url(${block.background_image})`;
    }
  
    if (block.add_animation) {
      classes += "animate-fade-up";
    }
    if (block.animation) {
      classes +=`animate-${block.animation} `;
    }
  
    if (block.add_shadow) {
      classes += "shadow-lg ";
    }
  
    if (block.background_color) {
      classes += `bg-${block.background_color} `;
    }
  
    if (block.add_overlay) {
      classes += "relative ";
      overlayStyles = {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
      };
    }
  
    if (block.text_alignment) {
      classes += `text-${block.text_alignment} `;
    }
  
    return { classes, inlineStyles, overlayStyles };
  };

  export default getBlockStyles