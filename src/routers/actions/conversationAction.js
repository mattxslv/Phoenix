/**
 * Custom modules
 */
import { Query } from 'appwrite';
import { account, databases } from '../../lib/appwrite';
import { getAiResponse } from '../../api/googleAi';
import generateID from '../../utils/generateID';

/**
 * Handles the conversation action, processing the user's prompt and storing the AI response in the database.
 *
 * @async
 * @param {Object} context - The context object containing the request and params.
 * @param {Object} request - The request object containing form data from the client.
 * @param {Object} params - The route parameters.
 * @returns {Promise<null>} Returns null after processing and storing data.
 *
 * @throws Will log an error message to the console if storing data fails.
 */
const conversationAction = async ({ request, params }) => {
  const formData = await request.formData();
  const editingId = formData.get('editing_id');
  const userPrompt = formData.get('user_prompt');
  const conversationId = params.conversationId;
  console.log('editingId:', editingId, 'userPrompt:', userPrompt);

  // Get logged-in user info
  let user = null;
  try {
    user = await account.get();
  } catch (err) {
    console.log(`Error getting user: ${err.message}`);
  }

  // Fetch previous chat messages for this conversation
  let chatHistory = [];
  try {
    const chatDocs = await databases.listDocuments(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_COLLECTION_CHATS_ID,
      [
        Query.equal('conversation', conversationId),
        Query.orderAsc('$createdAt'),
      ]
    );
    // For editing, exclude the one being edited; for new, include all
    chatHistory = editingId
      ? chatDocs.documents.filter(doc => doc.$id !== editingId)
      : chatDocs.documents;
    chatHistory = chatHistory.map(doc => ({
      user_prompt: doc.user_prompt,
      ai_response: doc.ai_response,
    }));
  } catch (err) {
    console.log(`Error fetching chat history: ${err.message}`);
  }

  // Always get AI response
  let aiResponse = '';
  try {
    aiResponse = await getAiResponse(userPrompt, chatHistory);
  } catch (err) {
    console.log(`Error getting Gemini response: ${err.message}`);
  }

  if (editingId) {
    // Fetch all chat documents for this conversation, sorted by $createdAt
    let chatDocs = [];
    try {
      const response = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_COLLECTION_CHATS_ID,
        [
          Query.equal('conversation', conversationId),
          Query.orderAsc('$createdAt'),
        ]
      );
      chatDocs = response.documents;
    } catch (err) {
      console.log(`Error fetching chat docs: ${err.message}`);
    }

    // Find the edited chat
    const editedChat = chatDocs.find(doc => doc.$id === editingId);

    // If found, delete all chats after it
    if (editedChat) {
      const editedTime = editedChat.$createdAt;
      const toDelete = chatDocs.filter(doc => doc.$createdAt > editedTime);
      for (const doc of toDelete) {
        try {
          await databases.deleteDocument(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_COLLECTION_CHATS_ID,
            doc.$id
          );
        } catch (err) {
          console.log(`Error deleting chat ${doc.$id}: ${err.message}`);
        }
      }
    }

    // Update the existing chat document
    try {
      console.log('Attempting to update:', editingId, userPrompt);
      await databases.updateDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_COLLECTION_CHATS_ID,
        editingId,
        {
          title: userPrompt.slice(0, 50),
          user_prompt: userPrompt,
          ai_response: aiResponse,
        }
      );
      console.log('Update successful');
      return null;
    } catch (err) {
      console.log(`Error updating chat: ${err.message}`);
    }
  }

  // If not editing, create a new chat as usual
  try {
    await databases.createDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_COLLECTION_CHATS_ID,
      generateID(),
      {
        title: userPrompt.slice(0, 50),
        user_prompt: userPrompt,
        ai_response: aiResponse,
        conversation: conversationId,
        user_id: user?.$id || null,
      },
    );
  } catch (err) {
    console.log(`Error storing chat: ${err.message}`);
  }

  return null;
};

export default conversationAction;
export { conversationAction as action };