/**
 * Node modules
 */
import { motion } from 'framer-motion';
import { useRef, useCallback, useEffect, useContext } from 'react';
import { useNavigation, useSubmit, useParams } from 'react-router-dom';

/**
 * Components
 */
import { IconBtn } from './Button';
// Fix the import path to point to the contexts folder
import { PromptInputContext } from '../contexts/PromptInputContext';
import { useEditPrompt } from '../contexts/EditPromptContext';

const PromptField = ({ inputValue, setInputValue, inputRef: externalInputRef }) => {
  // Provide a fallback ref if none is passed
  const internalInputRef = useRef(null);
  const inputRef = externalInputRef ?? internalInputRef;
  const inputFieldContainer = useRef(null);

  const submit = useSubmit();
  const navigation = useNavigation();
  const { conversationId } = useParams();
  const { promptInputValue, setPromptInputValue, promptInputRef } = useContext(PromptInputContext);
  const { editingId, setEditingId } = useEditPrompt();

  // Placeholder and multiline logic
  const placeholderShown = !inputValue;
  const isMultiline = inputFieldContainer.current?.clientHeight > 64;

  // Keep contentEditable in sync with inputValue
  useEffect(() => {
    if (inputRef.current && inputRef.current.innerText !== inputValue) {
      inputRef.current.innerText = inputValue || '';
    }
  }, [inputValue, inputRef]);

  const handleInputChange = useCallback(() => {
    if (inputRef.current) {
      setInputValue(inputRef.current.innerText.trim());
    }
  }, [setInputValue, inputRef]);

  const handlePaste = useCallback(
    (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text');
      if (inputRef.current) {
        inputRef.current.innerText += text;
        handleInputChange();
        // Move cursor to end
        const editableElem = inputRef.current;
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(editableElem);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    },
    [handleInputChange, inputRef],
  );

  const handleSubmit = useCallback(() => {
    if (!inputValue || navigation.state === 'submitting') return;
    submit(
      {
        user_prompt: inputValue,
        request_type: 'user_prompt',
        ...(editingId ? { editing_id: editingId } : {}),
      },
      {
        method: 'POST',
        encType: 'application/x-www-form-urlencoded',
        action: `/${conversationId || ''}`,
      },
    );
    setInputValue('');
    if (inputRef.current) inputRef.current.innerText = '';
    if (editingId) setEditingId(null); // Reset editing after submit
  }, [inputValue, navigation.state, submit, conversationId, setInputValue, inputRef, editingId, setEditingId]);

  const promptFieldVariant = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.2,
        duration: 0.4,
        delay: 0.4,
        ease: [0.05, 0.7, 0.1, 1],
      },
    },
  };

  const promptFieldChildrenVariant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <motion.div
      className={`prompt-field-container ${isMultiline ? 'rounded-large' : ''}`}
      variants={promptFieldVariant}
      initial="hidden"
      animate="visible"
      ref={inputFieldContainer}
    >
      <motion.div
        className={`prompt-field ${placeholderShown ? '' : 'after:hidden'}`}
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label="Ask anything"
        data-placeholder="Ask anything"
        variants={promptFieldChildrenVariant}
        ref={inputRef}
        onInput={handleInputChange}
        onPaste={handlePaste}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />

      <IconBtn
        icon="send"
        size="md"
        color="primary"
        onClick={handleSubmit}
        disabled={!inputValue || navigation.state === 'submitting'}
      />
    </motion.div>
  );
};

export default PromptField;
