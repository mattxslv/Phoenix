import { databases } from '../lib/appwrite';

const deleteConversation = async ({ id, submit }) => {
  try {
    await databases.deleteDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_COLLECTION_CONVERSATIONS_ID,
      id
    );
    // Optionally, you can also delete all related chats here if needed
    // Then revalidate or reload the conversations list
    if (submit) {
      submit(null, { method: 'get', action: '/' }); // This will revalidate loader data
    }
  } catch (err) {
    console.error('Error deleting conversation:', err);
  }
};

export default deleteConversation;
