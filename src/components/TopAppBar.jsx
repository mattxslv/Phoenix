/**
 * Node modules
 */
import {
  useNavigation,
  useNavigate,
  useLoaderData,
  useParams,
  useSubmit,
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Custom modules
 */
import logout from '../utils/logout';
import deleteConversation from '../utils/deleteConversation';

/**
 * Custom hooks
 */
import { useToggle } from '../hooks/useToggle';

/**
 * Components
 */
import { IconBtn } from './Button';
import Avatar from './Avatar';
import Menu from './Menu';
import MenuItem from './MenuItem';
import { LinearProgress } from './Progress';
import Logo from './Logo';

// Incognito SVG icon (inline)
const IncognitoIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    className="rounded-full bg-light-outlineVariant dark:bg-dark-outlineVariant"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="16" cy="16" r="16" fill="none" />
    <g>
      <path
        d="M10.5 20.5C10.5 18.0147 13.2386 16 16 16C18.7614 16 21.5 18.0147 21.5 20.5"
        stroke="#888"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <ellipse cx="12.5" cy="13.5" rx="1.5" ry="2" fill="#888" />
      <ellipse cx="19.5" cy="13.5" rx="1.5" ry="2" fill="#888" />
      <rect x="11" y="10" width="10" height="2" rx="1" fill="#888" />
    </g>
  </svg>
);

const TopAppBar = ({ toggleSidebar }) => {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const { conversations, user } = useLoaderData();
  const params = useParams();
  const submit = useSubmit();
  const [showMenu, setShowMenu] = useToggle();

  const isNormalLoad = navigation.state === 'loading' && !navigation.formData;

  // Check if user has a Google profile picture (Appwrite stores it in user.prefs or user.emailVerification if set up)
  // You may need to adjust this depending on your Appwrite user object structure
  const googlePhoto =
    user?.prefs?.picture ||
    user?.prefs?.googlePicture ||
    user?.prefs?.avatar ||
    user?.photoURL ||
    user?.avatarUrl ||
    user?.imageUrl ||
    null;

  return (
    <header className='relative flex justify-between items-center h-16 px-4'>
      <div className='flex items-center gap-1'>
        <IconBtn
          icon='menu'
          title='Menu'
          classes='lg:hidden'
          onClick={toggleSidebar}
        />

        <Logo classes='lg:hidden' />
      </div>

      {params.conversationId && (
        <IconBtn
          icon='delete'
          classes='ms-auto me-1 lg:hidden'
          onClick={() => {
            const { title } = conversations.documents.find(
              ({ $id }) => params.conversationId === $id,
            );

            deleteConversation({
              id: params.conversationId,
              title,
              submit,
            });
          }}
        />
      )}

      <div className='menu-wrapper'>
        <IconBtn onClick={setShowMenu}>
          {googlePhoto ? (
            <img
              src={googlePhoto}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <IncognitoIcon />
          )}
        </IconBtn>

        <Menu classes={showMenu ? 'active' : ''}>
          <MenuItem
            labelText='Log out'
            onClick={() => logout(navigate)}
          />
        </Menu>
      </div>

      <AnimatePresence>
        {isNormalLoad && (
          <LinearProgress classes='absolute top-full left-0 right-0 z-10' />
        )}
      </AnimatePresence>
    </header>
  );
};

TopAppBar.propTypes = {
  toggleSidebar: PropTypes.func,
};

export default TopAppBar;