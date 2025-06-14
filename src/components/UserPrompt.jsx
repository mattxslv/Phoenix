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
    <div className="flex w-full justify-center lg:justify-end">
      <div className="user-prompt-bubble">
        <span
          className="whitespace-pre-wrap break-words"
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
