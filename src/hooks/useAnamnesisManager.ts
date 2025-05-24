
import { useAnamnesisData } from "./useAnamnesisData";
import { useAnamnesisSearch } from "./useAnamnesisSearch";
import { useAnamnesisActions } from "./useAnamnesisActions";

export const useAnamnesisManager = () => {
  const { anamneses, isLoading, loadAnamneses } = useAnamnesisData();
  const { filteredAnamneses, searchTerm, setSearchTerm } = useAnamnesisSearch(anamneses);
  const {
    handleStatusChange,
    handleDeleteAnamnesis,
    handleDuplicateAnamnesis,
    handleSaveAsTemplate,
  } = useAnamnesisActions(loadAnamneses);

  return {
    anamneses: filteredAnamneses,
    searchTerm,
    setSearchTerm,
    isLoading,
    handleStatusChange,
    handleDeleteAnamnesis,
    handleDuplicateAnamnesis,
    handleSaveAsTemplate,
    loadAnamneses,
  };
};
