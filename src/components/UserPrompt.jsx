/**
 * Node modules
 */
import PropTypes from 'prop-types';
import { useRef, useState, useEffect } from 'react';

/**
 * Custom modules
 */
import { useToggle } from '../hooks/useToggle';

/**
 * Components
 */
import { IconBtn } from './Button';

const UserPrompt = ({ text }) => {
  const [isExpanded, toggleExpand] = useToggle();
  const textBoxRef = useRef();
  const [hasMoreContent, setMoreContent] = useState(false);

  useEffect(() => {
    setMoreContent(
      textBoxRef.current && textBoxRef.current.scrollHeight > textBoxRef.current.clientHeight,
    );
  }, [textBoxRef, text]);

  return (
    <div className="flex justify-end w-full">
      <div className="bg-white/90 text-gray-900 px-5 py-2 rounded-full max-w-[70%] w-fit min-w-0 text-right shadow break-words border border-gray-300 dark:bg-neutral-800 dark:text-white dark:border-neutral-700">
        <span
          className={`text-bodyLarge whitespace-pre-wrap ${!isExpanded ? 'line-clamp-4' : ''}`}
          ref={textBoxRef}
          style={{ marginBottom: 0, marginTop: 0, display: 'block' }}
        >
          {text}
        </span>
        {hasMoreContent && (
          <div className="flex justify-end">
            <IconBtn
              icon={isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
              onClick={toggleExpand}
              title={isExpanded ? 'Collapse text' : 'Expand text'}
            />
          </div>
        )}
      </div>
    </div>
  );
};

UserPrompt.propTypes = {
  text: PropTypes.string,
};

export default UserPrompt;
