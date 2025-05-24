
import { useState, useEffect } from "react";
import type { Anamnesis } from "@/types/anamnesis";

export const useAnamnesisSearch = (anamneses: Anamnesis[]) => {
  const [filteredAnamneses, setFilteredAnamneses] = useState<Anamnesis[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    filterAnamneses();
  }, [searchTerm, anamneses]);

  const filterAnamneses = () => {
    if (!searchTerm) {
      setFilteredAnamneses(anamneses);
      return;
    }

    const filtered = anamneses.filter(anamnesis =>
      anamnesis.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anamnesis.patient?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anamnesis.template?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredAnamneses(filtered);
  };

  return {
    filteredAnamneses,
    searchTerm,
    setSearchTerm,
  };
};
