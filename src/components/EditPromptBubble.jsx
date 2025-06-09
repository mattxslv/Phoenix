import { useRef, useEffect, useState } from 'react';

const MAX_HEIGHT = 240; // px, adjust as needed

const EditPromptBubble = ({ initialValue, onSend, onCancel, loading }) => {
  const [value, setValue] = useState(initialValue || '');
  const textareaRef = useRef();

  // Auto-resize textarea as content grows, but limit to MAX_HEIGHT
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, MAX_HEIGHT) + 'px';
      textareaRef.current.style.overflowY =
        textareaRef.current.scrollHeight > MAX_HEIGHT ? 'auto' : 'hidden';
    }
  }, [value]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(value.length, value.length);
    }
  }, [textareaRef, value]);

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !loading) onSend(value);
    }
  };

  return (
    <div className="flex w-full">
      <form
        className="flex flex-col bg-white/90 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-2xl px-6 py-4 shadow w-full max-w-3xl mx-auto"
        onSubmit={e => {
          e.preventDefault();
          if (value.trim() && !loading) onSend(value);
        }}
      >
        <textarea
          ref={textareaRef}
          className="w-full bg-transparent outline-none min-w-0 text-base text-gray-900 dark:text-white resize-none overflow-y-auto"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          maxLength={2000}
          placeholder="Edit your message..."
          rows={2}
          style={{ maxHeight: MAX_HEIGHT }}
        />
        <div className="flex flex-row gap-2 justify-end mt-2">
          <button
            type="submit"
            className="text-primary font-medium px-3 py-1 rounded bg-primary/10 hover:bg-primary/20 transition"
            disabled={loading || !value.trim()}
          >
            Send
          </button>
          <button
            type="button"
            className="text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 px-3 py-1 rounded transition font-medium"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPromptBubble;