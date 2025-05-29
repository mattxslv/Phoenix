  

/**
 * Node modules
 */
import { redirect } from 'react-router-dom';
import { Query } from 'appwrite';

/**
 * Custom modules
 */
import { account, databases } from '../../lib/appwrite';

const appLoader = async () => {
  const data = {};

  try {
    // Attempt to retrieve the user's account information
    data.user = await account.get();
  } catch (err) {
    console.log(`Error getting user session: ${err.message}`);
    // Redirect to login page if account retrieval fails
    return redirect('/login');
  }

  try {
    data.conversations = await databases.listDocuments(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_COLLECTION_CONVERSATIONS_ID, 
      [
        Query.select(['$id', 'title']),
        Query.orderDesc('$createdAt'),
        Query.equal('user_id', data.user.$id),
      ],
    );
  } catch (err) {
    console.log(`Error getting conversations: ${err.message}`);
  }

  return data;
};

export default appLoader;
