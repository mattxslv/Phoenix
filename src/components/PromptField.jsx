/**
 * Node modules
 */
import { motion } from 'framer-motion';
import { useRef, useCallback, useEffect, useContext, useState } from 'react';
import { useNavigation, useSubmit, useParams } from 'react-router-dom';
import { Client, Storage } from 'appwrite';

/**
 * Components
 */
import { IconBtn } from './Button';
// Fix the import path to point to the contexts folder
import { PromptInputContext } from '../contexts/PromptInputContext';
import { useEditPrompt } from '../contexts/EditPromptContext';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1') // Your Appwrite endpoint
  .setProject('6836c538000e425cff41'); // Your project ID

const storage = new Storage(client);

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
  const [uploadedFiles, setUploadedFiles] = useState([]);

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
    setUploadedFiles([]); // Clear uploaded files after successful submit
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
      className="prompt-field-container rounded-large relative pb-8 mb-4 lg:pb-14 lg:mb-0"
      variants={promptFieldVariant}
      initial="hidden"
      animate="visible"
      ref={inputFieldContainer}
    >
      {/* Uploaded files preview (above input, full width) */}
      {uploadedFiles.length > 0 && (
        <div className="w-full flex flex-wrap gap-3 mb-2">
          {uploadedFiles.map(file => (
            <div
              key={file.id}
              className="relative flex items-center rounded px-2 py-1 cursor-pointer"
              style={{ minWidth: '4rem', minHeight: '4rem' }}
              title={file.name}
            >
              {/* X button at top right of each preview */}
              <button
                className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-white dark:bg-neutral-900 rounded-full shadow p-0 hover:bg-red-500 hover:text-white transition"
                style={{ lineHeight: 1 }}
                onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}
                aria-label="Remove file"
                type="button"
              >
                &times;
              </button>
              {file.mimeType.startsWith('image/') ? (
                <img
                  src={`https://fra.cloud.appwrite.io/v1/storage/buckets/${file.bucketId}/files/${file.id}/view?project=6836c538000e425cff41`}
                  alt={file.name}
                  className="w-16 h-16 object-cover rounded"
                  draggable={false}
                />
              ) : (
                <div className="w-16 h-16 flex flex-col items-center justify-center rounded bg-white dark:bg-neutral-900">
                  {file.mimeType === 'application/pdf' ? (
                    <>
                      <span className="material-icons text-red-500 text-3xl mb-1 select-none">picture_as_pdf</span>
                      <span className="text-xs text-red-500 select-none">PDF file</span>
                    </>
                  ) : file.mimeType === 'application/msword' || file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
                    <>
                      <span className="material-icons text-blue-500 text-3xl mb-1 select-none">description</span>
                      <span className="text-xs text-blue-500 select-none">Word file</span>
                    </>
                  ) : file.mimeType === 'application/vnd.ms-excel' || file.mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ? (
                    <>
                      <span className="material-icons text-green-500 text-3xl mb-1 select-none">grid_on</span>
                      <span className="text-xs text-green-500 select-none">Excel file</span>
                    </>
                  ) : file.mimeType === 'application/vnd.ms-powerpoint' || file.mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ? (
                    <>
                      <span className="material-icons text-orange-500 text-3xl mb-1 select-none">slideshow</span>
                      <span className="text-xs text-orange-500 select-none">PowerPoint</span>
                    </>
                  ) : file.mimeType === 'application/zip' || file.mimeType === 'application/x-zip-compressed' || file.mimeType === 'application/x-7z-compressed' || file.mimeType === 'application/x-rar-compressed' ? (
                    <>
                      <span className="material-icons text-yellow-600 text-3xl mb-1 select-none">folder_zip</span>
                      <span className="text-xs text-yellow-600 select-none">Archive</span>
                    </>
                  ) : (
                    <>
                      <span className="material-icons text-blue-500 text-3xl mb-1 select-none">insert_drive_file</span>
                      <span className="text-xs text-blue-500 select-none">File</span>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Full-width input area */}
      <motion.div
        className={`prompt-field w-full pr-4 pb-10 lg:pb-4 text-left ${placeholderShown ? '' : 'after:hidden'}`}
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
        style={{
          minHeight: 48,
          textAlign: 'left', // <-- force left alignment for text and placeholder
        }}
      />

      {/* Bottom left: Add photo & upload file */}
      <div className="absolute bottom-3 left-3 flex items-end gap-2">
        <IconBtn
          icon="add"
          size="md"
          color="secondary"
          title="Add photo and files"
          onClick={e => {
            document.getElementById('photo-upload-input').click();
            if (e.currentTarget) e.currentTarget.blur();
          }}
        />
        {/* Hidden file input (accept both images and files) */}
        <input
          id="photo-upload-input"
          type="file"
          accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,application/x-zip-compressed"
          style={{ display: 'none' }}
          multiple
          onChange={async e => {
            const files = e.target.files;
            if (files && files.length > 0) {
              for (const file of files) {
                try {
                  const response = await storage.createFile(
                    '68479bea0015c77ba427',
                    'unique()',
                    file
                  );
                  let fileText = '';
                  if (file.type === 'text/plain') {
                    fileText = await file.text();
                  }
                  // TODO: Add PDF/DOCX extraction here

                  // Save fileText to state for later use
                  setUploadedFiles(prev => [
                    ...prev,
                    {
                      id: response.$id,
                      name: file.name,
                      mimeType: file.type,
                      bucketId: response.bucketId,
                      content: fileText, // <-- add extracted text
                    }
                  ]);
                } catch (err) {
                  console.error('Appwrite upload error:', err);
                }
              }
            }
            e.target.value = '';
          }}
        />
      </div>
      {/* Bottom right: Send/stop icon */}
      <div className="absolute bottom-3 right-3 flex items-end">
        <IconBtn
          icon={navigation.state === 'submitting' ? "stop_circle" : "send"}
          size="md"
          color="primary"
          onClick={handleSubmit}
          disabled={!inputValue || navigation.state === 'submitting'}
        />
      </div>
    </motion.div>
  );
};

export default PromptField;
