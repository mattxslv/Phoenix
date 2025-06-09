import { createContext, useContext } from "react";

export const PromptInputContext = createContext({
  promptInputValue: "",
  setPromptInputValue: () => {},
  promptInputRef: { current: null },
});

export const usePromptInput = () => useContext(PromptInputContext);