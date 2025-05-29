
/**
 * Node modules
 */
import { redirect } from 'react-router-dom';
import { Query } from 'appwrite';


/**
 * Custom modules
 */
import { account, databases } from '../../lib/appwrite';

const conversationLoader = async ({ params }) => {
  const { conversationId } = params;
  const data = {};

  try {
    data.user = await account.get();
  } catch (err) {
    console.log(`Error getting user account: ${err.message}`);
    return redirect('/login');
  }

  try {
    // Get the conversation metadata (title, etc.)
    data.conversation = await databases.getDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_COLLECTION_CONVERSATIONS_ID,
      conversationId
    );

    // 🔥 Manually fetch the related chat messages
    const chatsResponse = await databases.listDocuments(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_COLLECTION_CHATS_ID,
      [
        Query.equal('conversation', [conversationId]),
        Query.orderAsc('$createdAt') // Optional: sort by time
      ]
    );

    data.conversation.chats = chatsResponse.documents;

  } catch (err) {
    console.log(`Error getting conversation or chats: ${err.message}`);
    throw err;
  }

  return data;
};

export default conversationLoader;
