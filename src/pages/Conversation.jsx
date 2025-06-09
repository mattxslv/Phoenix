/**
 * Node modules
 */
import { motion } from 'framer-motion';
import { useLoaderData, useLocation } from 'react-router-dom';
import { useState, memo } from 'react';

/**
 * Custom hooks
 */
import { usePromptPreloader } from '../hooks/userPromptPreloader';
import { usePromptInput } from '../contexts/PromptInputContext';
import { useEditPrompt } from '../contexts/EditPromptContext';

/**
 * Components
 */
import PageTitle from '../components/PageTitle';
import UserPrompt from '../components/UserPrompt';
import AiResponse from '../components/AiResponse';
import PromptPreloader from '../components/PromptPreloader';
import Typewriter from '../components/Typewriter';
import { IconBtn } from '../components/Button';

const AiBubble = memo(function AiBubble({
  chat,
  isLast,
  typewriterDoneId,
  setTypewriterDoneId,
  copied,
  setCopied,
}) {
  // Only animate typewriter for the last message and if not already done
  const shouldType = isLast && typewriterDoneId !== chat.$id;

  return (
    <div className="relative flex flex-col">
      {shouldType ? (
        <Typewriter
          key={chat.$id}
          text={chat.ai_response || ''}
          speed={3}
          onDone={() => setTypewriterDoneId(chat.$id)}
          render={text => (
            <AiResponse aiResponse={text} />
          )}
        />
      ) : (
        <>
          <AiResponse aiResponse={chat.ai_response} />
          <CopyButton
            copied={copied}
            onCopy={() => {
              navigator.clipboard.writeText(chat.ai_response || '');
              setCopied(chat.$id);
              setTimeout(() => setCopied(null), 1200);
            }}
          />
        </>
      )}
    </div>
  );
});

function CopyButton({ copied, onCopy, disabled }) {
  return (
    <div className="mt-2 ml-5">
      <IconBtn
        icon={copied ? "check" : "content_copy"}
        title={copied ? "Copied!" : "Copy"}
        size="small"
        classes="opacity-70 hover:opacity-100 transition"
        onClick={onCopy}
        disabled={disabled}
      />
    </div>
  );
}

const Conversation = () => {
  /**
   * Extract the conversation data (title and chats) from the loader data,
   * handling potential undefined values using optional chaining.
   */
  const loaderData = useLoaderData();
  const conversation = loaderData?.conversation;
  const title = conversation?.title || 'Conversation';
  const chats = conversation?.chats || []; // Use loader data directly

  // Retrieve the prompt preloader value using the custom hook.
  const { promptPreloaderValue } = usePromptPreloader();
  const { setPromptInputValue, promptInputRef } = usePromptInput();
  const { setEditingId } = useEditPrompt();

  // Obtain the current URL location information using the useLocation hook.
  const location = useLocation();

  // State to track which AI response is being copied (by chat id)
  const [copiedId, setCopiedId] = useState(null);
  const [typewriterDoneId, setTypewriterDoneId] = useState(null);
  const [editingId, setEditingIdState] = useState(null);

  // Handler for editing a prompt: set editingId, set input value, focus input
  const handleEditPrompt = (chat) => {
    setEditingId(chat.$id);
    if (typeof setPromptInputValue === 'function') setPromptInputValue(chat.user_prompt);
    if (promptInputRef && promptInputRef.current) promptInputRef.current.focus();
  };

  return (
    <>
      {/* Meta title */}
      <PageTitle title={`${title} | Phoenix`} />

      <motion.div
        className='max-w-4xl mx-auto !will-change-auto'
        initial={!location.state?._isRedirect && { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.05, ease: 'easeOut' }}
      >
        {chats.map((chat, idx) => {
          const isLast = chat.$id === chats[chats.length - 1]?.$id;
          return (
            <div key={chat.$id} className="flex flex-col gap-6 my-8">
              {/* UserPrompt aligned right */}
              <div className="flex justify-end">
                <div className="relative max-w-[70%] w-fit group">
                  {/* Only hide the user prompt bubble if editing */}
                  {editingId === chat.$id ? null : (
                    <div className="bg-white/90 text-gray-900 px-5 py-2 rounded-full text-right shadow break-words border border-gray-300 dark:bg-neutral-800 dark:text-white dark:border-neutral-700">
                      <span className="break-words text-right">{chat.user_prompt}</span>
                    </div>
                  )}
                  {/* Action buttons, shown only on hover, bottom right OUTSIDE the bubble */}
                  <div className="absolute -bottom-8 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconBtn
                      icon="edit"
                      title="Edit prompt"
                      size="small"
                      classes="opacity-70 hover:opacity-100 transition"
                      onClick={() => handleEditPrompt(chat)}
                    />
                    <IconBtn
                      icon={copiedId === chat.$id ? "check" : "content_copy"}
                      title={copiedId === chat.$id ? "Copied!" : "Copy"}
                      size="small"
                      classes="opacity-70 hover:opacity-100 transition"
                      onClick={() => {
                        navigator.clipboard.writeText(chat.user_prompt || '');
                        setCopiedId(chat.$id);
                        setTimeout(() => setCopiedId(null), 1200);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* AiResponse aligned left */}
              <div className="flex justify-start">
                <div className="w-full relative group">
                  <AiBubble
                    chat={chat}
                    isLast={isLast}
                    typewriterDoneId={typewriterDoneId}
                    setTypewriterDoneId={setTypewriterDoneId}
                    copied={copiedId === chat.$id}
                    setCopied={setCopiedId}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {promptPreloaderValue && (
        <PromptPreloader promptValue={promptPreloaderValue} />
      )}
    </>
  );
};

export default Conversation;