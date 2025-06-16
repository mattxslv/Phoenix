/**
 * Node modules
 */
import PropTypes from 'prop-types';
import { NavLink, useLoaderData, useSubmit, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import React from 'react';

/**
 * Custom modules
 */
import deleteConversation from '../utils/deleteConversation';
import { logout } from '../utils/logout';

/**
 * Components
 */
import Logo from './Logo';
import { IconBtn } from './Button';
import logoDark from '../assets/logo-dark.svg';
import logoIcon from '../assets/logo-icon.svg';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isDesktop;
}

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  // Extract conversations and user from loader data if they exist.
  const { conversations, user } = useLoaderData() || {};
  const conversationData = conversations?.documents || [];

  // Extract the conversationId from the URL parameters using useParams.
  const { conversationId } = useParams();

  // Get a reference to the useSubmit function for submitting forms.
  const submit = useSubmit();
  const navigate = useNavigate();

  // State to track which chat's menu is open
  const [menuOpenId, setMenuOpenId] = useState(null);
  const menuRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0 });
  const buttonRefs = useRef({});

  // Rename state
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const inputRef = useRef(null);

  // Local state for conversations
  const [localConversations, setLocalConversations] = useState(conversationData);

  // State for delete confirmation modal
  const [confirmDelete, setConfirmDelete] = useState({ open: false, chat: null });

  // State for toast notifications
  const [toast, setToast] = useState({ open: false, message: '' });
  const [toastClosing, setToastClosing] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false); // <-- Add this line

  const showToast = (message) => {
    setToast({ open: true, message });
    setToastClosing(false);
    setTimeout(() => setToastClosing(true), 2700); // Start fade-out before hiding
    setTimeout(() => setToast({ open: false, message: '' }), 3000);
  };

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpenId) return;
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpenId]);

  // Focus and select input when renaming starts
  useEffect(() => {
    if (renamingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renamingId]);

  // Update local conversations when loader data changes
  useEffect(() => {
    setLocalConversations(conversationData);
  }, [conversationData]);

  // Handler for renaming a chat
  const handleRename = (chat) => {
    const newTitle = prompt('Enter new chat name:', chat.title);
    if (newTitle && newTitle !== chat.title) {
      // Implement your rename logic here (API call or state update)
      // Example: renameConversation({ id: chat.$id, title: newTitle, submit });
      alert(`Rename "${chat.title}" to "${newTitle}" (implement logic)`);
    }
    setMenuOpenId(null);
  };

  // Handler for starting rename
  const startRename = (chat) => {
    setMenuOpenId(null);
    setRenamingId(chat.$id);
    setRenameValue(chat.title);
  };

  // Handler for finishing rename
  const finishRename = (chat) => {
    if (renameValue.trim() && renameValue !== chat.title) {
      setLocalConversations(prev =>
        prev.map(c =>
          c.$id === chat.$id ? { ...c, title: renameValue } : c
        )
      );
    }
    setRenamingId(null);
  };

  // Handler for deleting a chat (open modal)
  const handleDelete = (chat) => {
    setConfirmDelete({ open: true, chat });
    setMenuOpenId(null);
  };

  // Handler for confirming delete
  const confirmDeleteChat = () => {
    if (confirmDelete.chat) {
      deleteConversation({
        id: confirmDelete.chat.$id,
        title: confirmDelete.chat.title,
        submit,
      });
      setLocalConversations(prev =>
        prev.filter(c => c.$id !== confirmDelete.chat.$id)
      );
      showToast(`Deleted "${confirmDelete.chat.title}"`);
    }
    setConfirmDelete({ open: false, chat: null });
  };

  // Handler for cancelling delete
  const cancelDelete = () => {
    setConfirmDelete({ open: false, chat: null });
  };

  // Open menu and set its position
  const handleMenuOpen = (e, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      left: rect.left,
      top: rect.bottom + 4, // 4px below the button
    });
    setMenuOpenId(id);
  };

  // Handler for creating a new chat
  const handleNewChat = () => {
    navigate('/'); // Use React Router navigation (no reload)
    // Remove or comment out the next line to prevent sidebar toggling
    // if (typeof toggleSidebar === 'function') toggleSidebar();
  };

  const isDesktop = useIsDesktop();

  // Add this hook near your other useEffect hooks
  useEffect(() => {
    if (!showUserMenu) return;
    function handleClickOutside(event) {
      // Close if click is outside the modal and button
      const modal = document.getElementById('user-logout-modal');
      const btn = document.getElementById('user-profile-btn');
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

  console.log('Sidebar user:', user);

  return (
    <>
      <motion.div
        initial={false}
        animate={
          isDesktop
            ? { x: 0 }
            : { x: isSidebarOpen ? 0 : '-100%' }
        }
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={`
          sidebar
          w-64
          lg:w-80
          ${isDesktop ? 'static' : 'fixed'}
          top-0
          left-0
          h-full
          z-40
          bg-white
          dark:bg-neutral-900
          transition-transform
          duration-150
        `}
      >
        <div className="sidebar-inner h-full flex flex-col lg:pl-6" style={{ opacity: 1, visibility: 'visible', zIndex: 10000, overflowY: 'auto', height: '100vh' }}>
          <div className='flex items-center justify-between px-3' style={{ height: isDesktop ? 64 : 48, marginTop: isDesktop ? 16 : 4, marginBottom: isDesktop ? 16 : 4 }}>
            <button
              onClick={() => {
                handleNewChat();
                if (!isDesktop) toggleSidebar();
              }}
              className="p-0 bg-transparent border-none cursor-pointer"
              style={{ lineHeight: 0, display: 'inline-block' }}
              aria-label="New chat"
            >
              <img
                src={isDesktop ? logoDark : logoIcon}
                alt="Phoenix Logo"
                className={isDesktop ? "h-7 w-auto" : "h-6 w-auto"}
                style={{ objectFit: 'contain', display: 'block' }}
              />
            </button>
            {!isDesktop && (
              <button
                onClick={toggleSidebar}
                aria-label="Close sidebar"
                style={{ marginRight: -8 }}
              >
                <span className="material-symbols-rounded text-xl">close</span>
              </button>
            )}
          </div>

          <button
            type="button"
            className={`relative flex items-center gap-2 px-2 py-2 mb-4 rounded-full text-primary transition overflow-hidden group
    ${!conversationId ? 'text-gray-400 cursor-not-allowed hover:bg-transparent group-hover:bg-transparent group-focus:bg-transparent' : ''}`}
            onClick={() => {
              handleNewChat();
              if (!isDesktop) toggleSidebar();
            }}
            disabled={!conversationId}
          >
            <span className="material-symbols-rounded">add</span>
            <span>New chat</span>
          </button>

          <div className='overflow-y-auto -me-2 pe-1'>
            <p className='text-titleSmall h-9 grid items-center px-2 text-gray-400 dark:text-gray-500 font-semibold'>Chats</p>
            <nav>
              {localConversations.map((item) => {
                const isMenuOpen = menuOpenId === item.$id;
                const isRenaming = renamingId === item.$id;
                return (
                  <div key={item.$id} className="relative group overflow-visible">
                    {/* Only show .state-layer when NOT renaming */}

                    <NavLink
                      to={item.$id}
                      className={({ isActive }) =>
                        `nav-link relative z-10 px-2 pr-8 flex items-center gap-2
    ${isActive
      ? 'bg-gray-200 dark:bg-neutral-800 text-gray-900 dark:text-white rounded-xl'
      : 'rounded-xl transition-colors'}
    hover:bg-gray-100 dark:hover:bg-neutral-700`
                      }
                      title={item.title}
                      tabIndex={isRenaming ? -1 : 0}
                      onClick={() => {
                        if (!isDesktop) toggleSidebar();
                      }}
                    >
                      {isRenaming ? (
                        <input
                          ref={inputRef}
                          className="truncate bg-transparent outline-none border-none w-full h-12 font-normal px-2"
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onBlur={() => finishRename(item)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              finishRename(item);
                            } else if (e.key === 'Escape') {
                              setRenamingId(null);
                            }
                          }}
                          style={{ maxWidth: 'calc(100% - 2rem)' }}
                        />
                      ) : (
                        <span className='truncate block grow mr-6 lg:mr-0'>{item.title}</span>
                      )}
                    </NavLink>
                    <button
                      ref={el => buttonRefs.current[item.$id] = el}
                      type="button"
                      className={`
      absolute top-1/2 right-1.5 -translate-y-1/2 z-40 p-1 rounded-xl
      bg-transparent h-8 flex items-center justify-center
      lg:opacity-0 lg:group-hover:opacity-100
    `}
                      onClick={e => {
                        e.stopPropagation();
                        handleMenuOpen(e, item.$id);
                      }}
                      tabIndex={0}
                    >
                      <span className="material-symbols-rounded">more_horiz</span>
                    </button>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Dropdown menu, rendered once after the map */}
          {menuOpenId && (
            <div
              ref={menuRef}
              className="fixed z-[10000] bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-lg overflow-hidden pointer-events-auto"
              style={{
                left: dropdownPosition.left,
                top: dropdownPosition.top,
              }}
            >
              <button
                className="flex items-center gap-2 w-full text-left px-4 py-2 transition-colors hover:bg-primary/10 dark:hover:bg-primary/20"
                style={{ borderRadius: 0 }}
                onClick={() => startRename(conversationData.find(c => c.$id === menuOpenId))}
              >
                <span className="material-symbols-rounded">edit</span>
                Rename
              </button>
              <button
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-600 transition-colors bg-transparent dark:bg-transparent"
                style={{ borderRadius: 0 }}
                onClick={() => handleDelete(conversationData.find(c => c.$id === menuOpenId))}
              >
                <span className="material-symbols-rounded">delete</span>
                Delete
              </button>
            </div>
          )}

          {/* Delete confirmation modal */}
          {confirmDelete.open && (
            <>
              {/* Overlay */}
              <div className="fixed inset-0 bg-black bg-opacity-50 z-[20000]"></div>
              {/* Modal */}
              <div className="fixed inset-0 flex items-center justify-center z-[20001]">
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl p-6 max-w-xs w-full text-center">
                  <div className="mb-4 text-lg font-medium">
                    Delete "{confirmDelete.chat?.title}"?
                  </div>
                  <div className="mb-6 text-gray-500 dark:text-gray-400">
                    Are you sure you want to delete this chat? This action cannot be undone.
                  </div>
                  <div className="flex gap-2 justify-center">
                    <button
                      className="px-4 py-2 rounded bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-neutral-600 transition"
                      onClick={cancelDelete}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
                      onClick={confirmDeleteChat}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Toast notification */}
          {toast.open && (
            <div className={`fixed bottom-6 right-6 z-[20010] bg-gray-900 text-white px-4 py-2 rounded shadow-lg ${toastClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
              {toast.message}
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 flex flex-col">
            {/* ...your logo, new chat button, chats list, etc... */}
          </div>

          {/* Bottom section: horizontal line, user, copyright */}
          <div className="mt-0 relative">
            {/* Horizontal line */}
            <div className="border-t border-light-surfaceContainerHigh dark:border-dark-surfaceContainerHigh w-full mb-1"></div>
            
            {/* User section for mobile only */}
            <div className="lg:hidden px-2 pb-2 pt-2 relative flex">
              {/* Logout modal */}
              {showUserMenu && (
                <div
                  id="user-logout-modal"
                  className="absolute left-0 right-0 -top-16 z-50 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-lg overflow-hidden"
                >
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-neutral-800 transition text-sm"
                    onClick={async () => {
                      setShowUserMenu(false);
                      await logout(); // Make sure logout clears session/token
                      navigate('/login'); // This will redirect to your login page
                    }}
                  >
                    <span className="material-symbols-rounded align-middle mr-2">logout</span>
                    Log out
                  </button>
                </div>
              )}
              <button
                id="user-profile-btn"
                className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 transition w-full"
                style={{ minWidth: 0, justifyContent: 'flex-start' }}
                onClick={() => setShowUserMenu(v => !v)}
              >
                {/* Use the same icon as TopAppBar (account_circle, styled as a circle) */}
                <span className="material-symbols-rounded w-7 h-7 flex items-center justify-center bg-gray-200 dark:bg-neutral-700 rounded-full text-xl text-gray-600 dark:text-gray-300">
                  account_circle
                </span>
                <span className="font-medium text-xs truncate">
                  {user.name
                    ? (() => {
                        const parts = user.name.trim().split(' ');
                        if (parts.length === 1) return parts[0];
                        // Always show first and last name only
                        return `${parts[0]} ${parts[parts.length - 1]}`;
                      })()
                    : ''}
                </span>
                {/* Center the expand_more icon vertically */}
                <span className="material-symbols-rounded ml-auto text-lg flex items-center justify-center h-7">
                  expand_more
                </span>
              </button>
            </div>

            {/* Copyright always at the very bottom */}
            <div className='h-14 px-4 grid items-center text-labelLarge text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant truncate'>
              &copy; 2024 mattxslv
            </div>
          </div>
        </div>
      </motion.div>
      <div
        className={`overlay ${isSidebarOpen ? 'active' : ''}`}
        onClick={toggleSidebar}
      ></div>
    </>
  );
};

Sidebar.propTypes = {
  isSidebarOpen: PropTypes.bool,
  toggleSidebar: PropTypes.func,
};

export default Sidebar;
