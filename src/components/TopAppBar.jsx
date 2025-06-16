/**
 * Node modules
 */
import {
  useNavigation,
  useLoaderData,
  useParams,
  useSubmit,
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import React, { useRef, useEffect, useState } from 'react';

/**
 * Custom modules
 */
import { logout } from '../utils/logout';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hooks
 */
import { useToggle } from '../hooks/useToggle';
import { useIsDesktop } from '../hooks/useIsDesktop';

/**
 * Components
 */
import { IconBtn } from './Button';
import Menu from './Menu';
import MenuItem from './MenuItem';
import { LinearProgress } from './Progress';
import Logo from './Logo';
import logoDark from '../assets/logo-dark.svg';
import logoDarkNoIcon from '../assets/logo-dark_no_icon.svg';

// Default user SVG icon (generic user silhouette)
const DefaultUserIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 32 32"
    fill="none"
    className="w-6 h-6 rounded-full bg-light-outlineVariant dark:bg-dark-outlineVariant"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="16" cy="16" r="16" fill="none" />
    <g>
      <circle cx="16" cy="13" r="6" fill="#888" />
      <ellipse cx="16" cy="24" rx="9" ry="5" fill="#888" />
    </g>
  </svg>
);

const getGravatarUrl = (email) => {
  if (!email) return null;
  // Simple MD5 implementation for gravatar fallback
  function md5cycle(x, k) {
    // ...implementation omitted for brevity...
  }
  function md5blk(s) {
    // ...implementation omitted for brevity...
  }
  function rhex(n) {
    // ...implementation omitted for brevity...
  }
  function hex(x) {
    // ...implementation omitted for brevity...
  }
  function md5(s) {
    // ...implementation omitted for brevity...
  }
  // Use a CDN or npm package for production, this is just a fallback
  return `https://www.gravatar.com/avatar/${window.md5 ? window.md5(email.trim().toLowerCase()) : ''}?d=identicon`;
};

const TopAppBar = ({ toggleSidebar }) => {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const { conversations, user } = useLoaderData();
  const params = useParams();
  const submit = useSubmit();
  const [showMenu, setShowMenu] = useToggle();
  const isDesktop = useIsDesktop();
  const [isPlusActive, setIsPlusActive] = useState(false);
  const plusBtnRef = useRef(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isNormalLoad = navigation.state === 'loading' && !navigation.formData;

  // Try to get Google profile photo from all possible locations
  let googlePhoto =
    user?.prefs?.picture ||
    user?.picture ||
    user?.prefs?.googlePicture ||
    user?.prefs?.avatar ||
    user?.prefs?.profileImage ||
    user?.photoURL ||
    user?.avatarUrl ||
    user?.imageUrl ||
    null;

  // Fallback to Gravatar if no Google photo and user has email
  if (!googlePhoto && user?.email) {
    // Use a simple hash for gravatar fallback
    const hash = window.md5
      ? window.md5(user.email.trim().toLowerCase())
      : null;
    googlePhoto = hash
      ? `https://www.gravatar.com/avatar/${hash}?d=identicon`
      : null;
  }

  // Debug: log user and prefs for troubleshooting
  console.log('User object:', user);
  if (user && user.prefs) {
    Object.entries(user.prefs).forEach(([key, value]) => {
      console.log('prefs.' + key, value);
    });
  }

  // Detect click outside to deactivate plus button
  useEffect(() => {
    if (!isPlusActive) return;
    function handleClickOutside(e) {
      if (plusBtnRef.current && !plusBtnRef.current.contains(e.target)) {
        setIsPlusActive(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPlusActive]);

  // Close menu on outside click
  useEffect(() => {
    if (!showUserMenu) return;
    function handleClickOutside(event) {
      const modal = document.getElementById('topbar-user-logout-modal');
      const btn = document.getElementById('topbar-user-profile-btn');
      if (
        modal &&
        !modal.contains(event.target) &&
        btn &&
        !btn.contains(event.target)
      ) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Disable if on the root page (no conversation)
  const isRootPage = !params.conversationId;

  return (
    <header className='relative flex items-center h-16 px-4'>
      {/* Left: Menu button (mobile only) */}
      <div className='flex items-center gap-1 flex-1'>
        <IconBtn
          icon='menu'
          title='Menu'
          classes='lg:hidden'
          onClick={toggleSidebar}
        />
      </div>

      {/* Center: Logo */}
      <div className={`absolute left-0 right-0 flex justify-center items-center pointer-events-none`}>
        {!isDesktop && (
          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-transparent border-none p-0 m-0 pointer-events-auto"
            aria-label="Home"
            tabIndex={0}
            style={{ lineHeight: 0, display: 'inline-block' }}
          >
            <img
              src={logoDarkNoIcon}
              alt="Phoenix Logo"
              className="h-6 w-auto"
              style={{ objectFit: 'contain', display: 'block' }}
            />
          </button>
        )}
      </div>

      {/* Right: Actions */}
      <div className='menu-wrapper flex items-center gap-2 flex-1 justify-end'>
        <div className="relative">
          {/* Desktop: show user profile and dropdown (unchanged) */}
          {isDesktop ? (
            <button
              id="topbar-user-profile-btn"
              className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
              style={{ minWidth: 0, justifyContent: 'flex-start' }}
              onClick={() => setShowUserMenu(v => !v)}
            >
              {googlePhoto ? (
                <img
                  src={googlePhoto}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="material-symbols-rounded w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-neutral-700 rounded-full text-2xl text-gray-600 dark:text-gray-300">
                  account_circle
                </span>
              )}
              <span className="font-medium text-xs truncate max-w-[100px]">
                {user.name
                  ? (() => {
                      const parts = user.name.trim().split(' ');
                      if (parts.length === 1) return parts[0];
                      return `${parts[0]} ${parts[parts.length - 1]}`;
                    })()
                  : ''}
              </span>
              <span className="material-symbols-rounded ml-1 text-lg flex items-center justify-center h-8">
                expand_more
              </span>
            </button>
          ) : (
            // Mobile: show plus button for new chat, no hover/click background
            <button
              id="topbar-add-chat-btn"
              className="flex items-center justify-center p-0 m-0 bg-transparent border-none shadow-none outline-none"
              style={{
                background: 'none',
                boxShadow: 'none',
                outline: 'none',
                minWidth: 0,
                borderRadius: 0,
                opacity: !params.conversationId ? 0.5 : 1, // visually indicate disabled
                pointerEvents: !params.conversationId ? 'none' : 'auto', // actually disable
              }}
              onClick={() => navigate('/')}
              tabIndex={0}
              aria-label="New chat"
              disabled={!params.conversationId}
            >
              <span className="material-symbols-rounded text-3xl leading-none select-none pointer-events-none">
                add
              </span>
            </button>
          )}

          {/* Desktop: show dropdown for logout */}
          {isDesktop && showUserMenu && (
            <div
              id="topbar-user-logout-modal"
              className="absolute right-0 top-12 z-50 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-lg overflow-hidden min-w-[160px]"
            >
              <button
                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-neutral-800 transition text-sm"
                onClick={async () => {
                  setShowUserMenu(false);
                  await logout();
                  navigate('/login');
                }}
              >
                <span className="material-symbols-rounded align-middle mr-2">logout</span>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isNormalLoad && (
          <LinearProgress classes="fixed top-0 left-0 right-0 z-50" />
        )}
      </AnimatePresence>
    </header>
  );
};

TopAppBar.propTypes = {
  toggleSidebar: PropTypes.func,
};

export default TopAppBar;