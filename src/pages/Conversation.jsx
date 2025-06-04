/**
 * Node modules
 */
import { motion } from 'framer-motion';
import { useLoaderData, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

/**
 * Custom hooks
 */
import { usePromptPreloader } from '../hooks/userPromptPreloader';

/**
 * Components
 */
import PageTitle from '../components/PageTitle';
import UserPrompt from '../components/UserPrompt';
import AiResponse from '../components/AiResponse';
import PromptPreloader from '../components/PromptPreloader';
import Typewriter from '../components/Typewriter';

const Conversation = () => {
  /**
   * Extract the conversation data (title and chats) from the loader data,
   * handling potential undefined values using optional chaining.
   */
  const loaderData = useLoaderData();
  const conversation = loaderData?.conversation;
  const title = conversation?.title || 'Conversation';
  const chats = conversation?.chats || [];

  // Retrieve the prompt preloader value using the custom hook.
  const { promptPreloaderValue } = usePromptPreloader();

  // Obtain the current URL location information using the useLocation hook.
  const location = useLocation();

  return (
    <>
      {/* Meta title */}
      <PageTitle title={`${title} | Phoenix`} />

      <motion.div
        className='max-w-4xl mx-auto !will-change-auto' // Changed from max-w-[700px] to max-w-4xl for a wider chat area
        initial={!location.state?._isRedirect && { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.05, ease: 'easeOut' }}
      >
        {chats.map((chat, idx) => (
          <div key={chat.$id} className="flex flex-col gap-6 my-8">
            {/* UserPrompt aligned right */}
            <div className="flex justify-end">
              <div className="bg-white/90 text-gray-900 px-5 py-2 rounded-full max-w-[70%] text-right shadow break-words border border-gray-300 dark:bg-neutral-800 dark:text-white dark:border-neutral-700">
                {chat.user_prompt}
              </div>
            </div>

            {/* AiResponse aligned left */}
            <div className="flex justify-start">
              <div className="w-full">
                {idx === chats.length - 1 ? (
                  <AiResponse>
                    <Typewriter
                      text={chat.ai_response}
                      speed={5}
                      render={(text) => <>{text}</>}
                    />
                  </AiResponse>
                ) : (
                  <AiResponse aiResponse={chat.ai_response} />
                )}
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {promptPreloaderValue && (
        <PromptPreloader promptValue={promptPreloaderValue} />
      )}
    </>
  );
};

// Add this helper function
function fixNewlines(text) {
  if (!text) return '';
  // Add double newlines before list items if missing
  let fixed = text
    // Ensure a blank line before each list item
    .replace(/([^\n])\n(\s*[\*\-]\s+)/g, '$1\n\n$2')
    // Ensure double newlines between paragraphs (but not before list items or headings)
    .replace(/([^\n\*\-\#])\n([^\n\*\-\#])/g, '$1\n\n$2');
  return fixed;
}

export default Conversation;

<ReactMarkdown>
  {`
**Famous People in India**

- Mahatma Gandhi
- Indira Gandhi
- Narendra Modi

Paragraph one.

Paragraph two.
`}
</ReactMarkdown>

