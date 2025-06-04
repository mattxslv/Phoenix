/**
 * Node modules
 */
import PropTypes from 'prop-types';

/**
 * Components
 */
import UserPrompt from './UserPrompt';
import Skeleton from './Skeleton';

const PromptPreloader = ({ promptValue }) => {
  return (
    <div className="max-w-4xl mx-auto !will-change-auto">
      <div className="flex flex-col gap-6 my-8">
        {/* UserPrompt aligned right */}
        <div className="flex justify-end">
          <UserPrompt text={promptValue} />
        </div>
        {/* Skeleton (AI response) aligned left */}
        <div className="flex justify-start">
          <div className="w-full">
            <Skeleton />
          </div>
        </div>
      </div>
    </div>
  );
};

PromptPreloader.propTypes = {
  promptValue: PropTypes.string,
};

export default PromptPreloader;
