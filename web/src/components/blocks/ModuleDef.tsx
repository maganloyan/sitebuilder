import React from "react";
import { useNavigate } from "react-router-dom";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";


interface ModuleDefProps {
  title?: string;
  module: string; // Required module name
}

const ModuleDef: React.FC<ModuleDefProps> = ({
   title, 
   module ="sitebuilder"
   }) => {
  const navigate = useNavigate();

  // Fetch doctypes filtered by module
  const { data, error, isLoading } = useFrappeGetDocList("DocType", {
    fields: ["name"],
    filters: [
        ["module", "=", module],
        ["istable", "=", 0]
    ],
     // Fetch up to 100 doctypes
  });

  // Handle navigation
  const handleClick = (doctype: string) => {
    const formattedDoctype = doctype.toLowerCase().replace(/\s+/g, "-");
    navigate(`/portal/app/${formattedDoctype}`);
  };

  return (
    <div className="p-4">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      

      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      )}

      {error && <p className="text-red-500">Error: {error.message}</p>}

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-3  lg:grid-cols-4 gap-4">
          {data.map(({ name }) => (
            <Card
              key={name}
              onClick={() => handleClick(name)}
              className="cursor-pointer hover:shadow-lg transition-all"
            >
              <CardHeader className="text-center font-medium">{name}</CardHeader>
              
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModuleDef;
