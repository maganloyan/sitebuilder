// import React, { useState, useEffect } from "react";
// import { Menu, X } from "lucide-react";
// import {
//   NavigationMenu,
//   NavigationMenuList,
//   NavigationMenuItem,
//   NavigationMenuTrigger,
//   NavigationMenuContent,
//   NavigationMenuLink,
//   navigationMenuTriggerStyle,
// } from "@/components/ui/navigation-menu";
// // import { menuItems } from "./menuItems";
// import { Link } from "react-router-dom";
// import { ModeToggle } from "@/utils/ModeToggle";

// const Navbar: React.FC = () => {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [hasScrolled, setHasScrolled] = useState(false);
//   const [ setOpenDropdownIndex] = useState<number | null>(null);

//   useEffect(() => {
//     const handleScroll = () => {
//       setHasScrolled(window.scrollY > 0);
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const handleMouseEnter = (index: number) => {
//     setOpenDropdownIndex(index);
//   };

//   const handleMouseLeave = () => {
//     setOpenDropdownIndex(null);
//   };

//   return (
//     <header
//       className={`fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm ${
//         hasScrolled ? "shadow-lg" : ""
//       }`}
//     >
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <div className="flex-shrink-0">
//             <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">
//               MyLogo
//             </Link>
//           </div>

//           {/* Centered Desktop Navigation */}
//           <div className="hidden md:flex flex-1 justify-center">
//             <NavigationMenu>
//               <NavigationMenuList className="space-x-2">
//                 {menuItems.map((item, index) =>
//                   item.dropdown ? (
//                     <NavigationMenuItem
//                       key={index}
//                       onMouseEnter={() => handleMouseEnter(index)}
//                       onMouseLeave={handleMouseLeave}
//                     >
//                       <NavigationMenuTrigger
//                         className=" text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white text-base"
//                       >
//                         {item.label}
//                       </NavigationMenuTrigger>
//                       <NavigationMenuContent>
//                         <ul className="grid w-[200px] gap-2 p-2">
//                           {item.dropdown.map((dropdownItem, dropdownIndex) => (
//                             <li key={dropdownIndex}>
//                               <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
//                                 <Link
//                                   to={dropdownItem.link}
//                                   className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
//                                 >
//                                   {dropdownItem.label}
//                                 </Link>
//                               </NavigationMenuLink>
//                             </li>
//                           ))}
//                         </ul>
//                       </NavigationMenuContent>
//                     </NavigationMenuItem>
//                   ) : (
//                     <NavigationMenuItem key={index}>
//                       <NavigationMenuLink asChild>
//                         <Link
//                           to={item.link}
//                           className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white px-1 py-2 text-base"
//                         >
//                           {item.label}
//                         </Link>
//                       </NavigationMenuLink>
//                     </NavigationMenuItem>
//                   )
//                 )}
//               </NavigationMenuList>
//             </NavigationMenu>
//           </div>

//           {/* Right Side Actions */}
//           <div className="flex items-center space-x-4">
//             <ModeToggle />
//             {/* Mobile Menu Button */}
//             <div className="flex md:hidden">
//               <button
//                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//                 className="text-gray-800 dark:text-white hover:text-gray-600 focus:outline-none"
//               >
//                 {isMobileMenuOpen ? (
//                   <X className="w-6 h-6" />
//                 ) : (
//                   <Menu className="w-6 h-6" />
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Navigation */}
//       {isMobileMenuOpen && (
//         <nav className="md:hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
//           <div className="px-4 py-2 space-y-1">
//             {menuItems.map((item, index) =>
//               item.dropdown ? (
//                 <NavigationMenu key={index} className="mb-2 w-full">
//                   <NavigationMenuList>
//                     <NavigationMenuItem className="w-full">
//                       <NavigationMenuTrigger className="w-full text-left font-medium text-gray-600 dark:text-gray-300">
//                         {item.label}
//                       </NavigationMenuTrigger>
//                       <NavigationMenuContent>
//                         <ul className="grid w-[200px] gap-2 p-2">
//                           {item.dropdown.map((dropdownItem, dropdownIndex) => (
//                             <li key={dropdownIndex}>
//                               <NavigationMenuLink asChild>
//                                 <Link
//                                   to={dropdownItem.link}
//                                   className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
//                                 >
//                                   {dropdownItem.label}
//                                 </Link>
//                               </NavigationMenuLink>
//                             </li>
//                           ))}
//                         </ul>
//                       </NavigationMenuContent>
//                     </NavigationMenuItem>
//                   </NavigationMenuList>
//                 </NavigationMenu>
//               ) : (
//                 <Link
//                   key={index}
//                   to={item.link}
//                   className="block text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
//                 >
//                   {item.label}
//                 </Link>
//               )
//             )}
//           </div>
//         </nav>
//       )}
//     </header>
//   );
// };

// export default Navbar;
