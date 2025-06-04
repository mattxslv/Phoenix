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
  const { conversationId } = params;
  const formData = await request.formData();
  const userPrompt = formData.get('user_prompt');

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
    chatHistory = chatDocs.documents.map(doc => ({
      user_prompt: doc.user_prompt,
      ai_response: doc.ai_response,
    }));
  } catch (err) {
    console.log(`Error fetching chat history: ${err.message}`);
  }

  // Get AI response based on user prompt and chat history
  let aiResponse = '';
  try {
    aiResponse = await getAiResponse(userPrompt, chatHistory);
  } catch (err) {
    console.log(`Error getting Gemini response: ${err.message}`);
  }

  // Store new chat document in separate chats collection
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