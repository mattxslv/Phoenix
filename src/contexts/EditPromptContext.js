import { createContext, useContext } from 'react';

export const EditPromptContext = createContext({
  editingId: null,
  setEditingId: () => {},
});

export const useEditPrompt = () => useContext(EditPromptContext);