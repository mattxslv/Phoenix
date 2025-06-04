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

/**
 * Components
 */
import Logo from './Logo';
import { IconBtn } from './Button';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  // Extract conversations from loader data if it exists.

  const { conversations } = useLoaderData() || {};
  const conversationData = conversations?.documents || [];

  // Extract the conversationId from the URL parameters using useParams.
  const { conversationId } = useParams();

  // Get a reference to the useSubmit function for submitting forms.
  const submit = useSubmit();
  const navigate = useNavigate(); // Add this line

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

  return (
    <>
      <motion.div
        initial={false}
        animate={{ x: isSidebarOpen ? 0 : -320 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`
    sidebar
    w-80
    fixed
    top-0
    left-0
    h-full
    z-40
    bg-white
    dark:bg-neutral-900
    transition-transform
    duration-300
    lg:static
  `}
      >
        <div className="sidebar-inner h-full flex flex-col" style={{ opacity: 1, visibility: 'visible', zIndex: 10000 }}>
          <div className='h-16 grid items-center px-4 mb-4'>
            <Logo />
          </div>

          <button
            type="button"
            className={`relative flex items-center gap-2 px-4 py-2 mb-4 rounded-full text-primary transition overflow-hidden group
    ${!conversationId ? 'text-gray-400 cursor-not-allowed hover:bg-transparent group-hover:bg-transparent group-focus:bg-transparent' : ''}`}
            onClick={handleNewChat}
            disabled={!conversationId}
          >
            <span className="material-symbols-rounded">add</span>
            <span>New chat</span>
            <div
              className={`state-layer absolute inset-0 rounded-full pointer-events-none transition
      ${!conversationId ? '' : 'group-hover:bg-gray-100 group-focus:bg-gray-100'}`}
            ></div>
          </button>

          <div className='overflow-y-auto -me-2 pe-1'>
            <p className='text-titleSmall h-9 grid items-center px-4'>Recent</p>

            <nav>
              {localConversations.map((item) => {
                const isMenuOpen = menuOpenId === item.$id;
                const isRenaming = renamingId === item.$id;
                return (
                  <div key={item.$id} className="relative group overflow-visible">
                    {/* Only show .state-layer when NOT renaming */}
                    {!isRenaming && (
                      <div className="state-layer absolute inset-0 rounded-full pointer-events-none transition
    group-hover:bg-gray-100 group-focus-within:bg-gray-100 focus-within:bg-gray-100 z-0"></div>
                    )}
                    <NavLink
                      to={item.$id}
                      className='nav-link relative z-10'
                      title={item.title}
                      tabIndex={isRenaming ? -1 : 0}
                    >
                      <span className='material-symbols-rounded icon-small'>chat_bubble</span>
                      {isRenaming ? (
                        <input
                          ref={inputRef}
                          className="truncate bg-transparent outline-none border-none w-full h-12 font-normal rounded-full px-4 transition
      hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
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
                        />
                      ) : (
                        <span className='truncate'>{item.title}</span>
                      )}
                    </NavLink>
                    <button
                      ref={el => buttonRefs.current[item.$id] = el}
                      type="button"
                      className="absolute top-1/2 right-1.5 -translate-y-1/2 z-40 p-1 rounded-full 
          opacity-0 group-hover:opacity-100 transition bg-transparent h-8 flex items-center justify-center"
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

          <div className='mt-4 h-14 px-4 grid items-center text-labelLarge text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant border-t border-light-surfaceContainerHigh dark:border-dark-surfaceContainerHigh truncate'>
            &copy; 2024 mattxslv
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
