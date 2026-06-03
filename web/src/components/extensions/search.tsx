"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import useDebounce from "@/hooks/use-debounce";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { useNavigate } from "react-router-dom";

interface Doctype {
    name: string;
}

interface ActionSearchBarProps {
    doctype: string;
    route: string;
}

const ActionSearchBar: React.FC<ActionSearchBarProps> = ({ doctype, route }) => {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const debouncedQuery = useDebounce(query, 200);
    const navigate = useNavigate();

    const filters = debouncedQuery ? [["name", "like", `%${debouncedQuery}%`]] : [];
    if (doctype === "DocType") {
        filters.push(["istable", "=", "0"]);
    }

    const { data: doctypes, isLoading } = useFrappeGetDocList(doctype, {
        fields: ["name"],
        filters: filters,
        limit: 10,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleDoctypeClick = (doctype: Doctype) => {
        navigate(`${route}/${doctype.name}`);
        setIsFocused(false);
    };

    return (
        <div className="w-full max-w-xl mx-auto pt-2">
            <div className="relative w-full max-w-sm mb-4 sm:mb-0">
                
                {/* Search Input */}
                <Input
                    type="text"
                    placeholder={`Search ${doctype}s...`}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    className="pl-3 pr-9 py-1.5 h-9 text-sm rounded-md bg-accent focus-visible:ring-offset-0 dark:bg-neutral-800 dark:text-white"
                />
                <Search className="absolute w-5 h-5 right-2 top-1/2 transform -translate-y-1/2 text-neutral-500 dark:text-neutral-300" />

                {/* Search Results Dropdown */}
                <AnimatePresence>
                    {(isFocused && doctypes && doctypes.length > 0) || isLoading ? (
                        <motion.div
                            className="absolute top-full left-0 w-full border rounded-md shadow-lg bg-white dark:bg-neutral-900 dark:border-neutral-700 mt-1 z-50 max-h-60 overflow-y-auto"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            {isLoading ? (
                                <div className="px-3 py-2 flex items-center justify-center">
                                    <Loader2 className="h-4 w-4 animate-spin text-neutral-600 dark:text-neutral-400" />
                                </div>
                            ) : (
                                <motion.ul>
                                    {doctypes.map((doctype) => (
                                        <motion.li
                                            key={doctype.name}
                                            className="px-3 py-2 flex items-center justify-between hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer rounded-md"
                                            onClick={() => handleDoctypeClick(doctype)}
                                        >
                                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                                {doctype.name}
                                            </span>
                                        </motion.li>
                                    ))}
                                </motion.ul>
                            )}
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default ActionSearchBar;
