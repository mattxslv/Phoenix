/**
 * Node modules
 */
import { motion } from 'framer-motion';
import { useLoaderData, useLocation, useNavigate, useSubmit, useParams, useRevalidator, useNavigation } from 'react-router-dom';
import { useState, memo, useEffect } from 'react';

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
import EditPromptBubble from '../components/EditPromptBubble';
import { updatePrompt } from '../api/prompt'; // or wherever your updatePrompt function is

const AiBubble = memo(function AiBubble({
  chat,
  isLast,
  typewriterDoneId,
  setTypewriterDoneId,
  copied,
  setCopied,
  justEditedId,
  setJustEditedId, // <-- pass this as a prop!
}) {
  const shouldType = (isLast || justEditedId === chat.$id) && typewriterDoneId !== chat.$id;

  return (
    <div className="relative flex flex-col">
      {shouldType ? (
        <Typewriter
          key={chat.$id}
          text={chat.ai_response || ''}
          speed={2}
          onDone={() => {
            setTypewriterDoneId(chat.$id);
            if (justEditedId === chat.$id) setJustEditedId(null); // <-- clear after animation
          }}
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
  const { editingId, setEditingId } = useEditPrompt(); // Use context editingId

  // Obtain the current URL location information using the useLocation hook.
  const location = useLocation();
  const navigate = useNavigate();
  const submit = useSubmit();
  const { conversationId } = useParams();
  const { revalidate } = useRevalidator();
  const navigation = useNavigation();

  // State to track which AI response is being copied (by chat id)
  const [copiedId, setCopiedId] = useState(null);
  const [typewriterDoneId, setTypewriterDoneId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [pendingEditId, setPendingEditId] = useState(null);
  const [justEditedId, setJustEditedId] = useState(null);

  // Handler for editing a prompt: set editingId only
  const handleEditPrompt = (chat) => {
    setEditingId(chat.$id);
    // Remove this line to prevent filling the prompt field:
    // if (typeof setPromptInputValue === 'function') setPromptInputValue(chat.user_prompt);
  };

  // Handler for sending the edited prompt
  const handleEditSend = (newPrompt) => {
    setPendingEditId(editingId);
    setJustEditedId(editingId); // Track which chat was just edited
    setTypewriterDoneId(null);  // <-- Reset typewriter for the edited chat
    submit(
      {
        user_prompt: newPrompt,
        request_type: 'user_prompt',
        editing_id: editingId,
      },
      {
        method: 'POST',
        encType: 'application/x-www-form-urlencoded',
        action: `/${conversationId}`,
      }
    );
    setEditingId(null);
  };

  // When chats change (loader refreshes), clear pendingEditId
  useEffect(() => {
    setPendingEditId(null);
    // Do NOT clear justEditedId here!
  }, [chats]);

  // Handler for canceling edit
  const handleEditCancel = () => {
    setEditingId(null);
  };

  // After successful edit/submit, reload the conversation and update the chat list
  const handleSuccessfulEdit = () => {
    navigate(0);
  };

  // Update prompt in the database if editingId is set
  const updatePromptInDb = async (userPrompt, aiResponse) => {
    if (editingId) {
      try {
        console.log('Attempting to update:', editingId, userPrompt);
        await databases.updateDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_COLLECTION_CHATS_ID,
          editingId,
          {
            title: userPrompt.slice(0, 50),
            user_prompt: userPrompt,
            ai_response: aiResponse,
          }
        );
        console.log('Update successful');
        return null;
      } catch (err) {
        console.log(`Error updating chat: ${err.message}`);
      }
    }
  };

  // Detect if the first chat is being edited and is pending
  const isEditingFirstChat = chats.length > 0 && pendingEditId === chats[0].$id;

  // Filter chats for instant UI update when editing any chat and pending
  let visibleChats = chats;
  if (pendingEditId) {
    const editIdx = chats.findIndex(chat => chat.$id === pendingEditId);
    if (editIdx !== -1) {
      visibleChats = chats.slice(0, editIdx + 1);
    }
  }

  const lastVisibleChat = visibleChats[visibleChats.length - 1];
  const lastIsAi = lastVisibleChat && lastVisibleChat.ai_response;
  const shouldDisablePrompt =
    lastIsAi && typewriterDoneId !== lastVisibleChat.$id;

  // Show stop icon if submitting or typewriter is running
  const loading = shouldDisablePrompt || navigation.state === 'submitting';

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
        {visibleChats.map((chat, idx) => {
          const isLast = chat.$id === visibleChats[visibleChats.length - 1]?.$id;
          const isEditing = editingId === chat.$id;
          const isPendingEdit = pendingEditId === chat.$id;

          // Hide the chat being edited while pending
          if (isPendingEdit) return null;

          return (
            <div key={chat.$id} className="flex flex-col gap-6 my-8">
              {/* UserPrompt aligned right */}
              {isEditing ? (
                <EditPromptBubble
                  initialValue={chat.user_prompt}
                  onSend={handleEditSend}
                  onCancel={handleEditCancel}
                  loading={editLoading}
                />
              ) : (
                <div className="flex justify-end">
                  <div className="relative max-w-[70%] w-fit group">
                    <div className="bg-white/90 text-gray-900 px-5 py-2 rounded-full text-right shadow break-words border border-gray-300 dark:bg-neutral-800 dark:text-white dark:border-neutral-700">
                      <span className="break-words text-right">{chat.user_prompt}</span>
                    </div>
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
              )}

              {/* AiResponse aligned left */}
              {/* Show AiBubble unless this chat is pending edit (being updated) */}
              {!isEditing && (
                <div className="flex justify-start">
                  <div className="w-full relative group">
                    <AiBubble
                      chat={chat}
                      isLast={isLast}
                      typewriterDoneId={typewriterDoneId}
                      setTypewriterDoneId={setTypewriterDoneId}
                      copied={copiedId === chat.$id}
                      setCopied={setCopiedId}
                      justEditedId={justEditedId}
                      setJustEditedId={setJustEditedId}
                    />
                  </div>
                </div>
              )}
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
