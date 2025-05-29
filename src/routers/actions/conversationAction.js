/**
 * Custom modules
 */
import { account, databases } from '../../lib/appwrite'; // import account to get user info
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

  let chatHistory = [];
  let aiResponse = '';
  let user = null;

  // Get logged-in user info
  try {
    user = await account.get();
  } catch (err) {
    console.log(`Error getting user: ${err.message}`);
    // Optionally: return or redirect if no user
  }

  // Get previous chats from conversation document
  try {
    const conversationDoc = await databases.getDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_COLLECTION_CONVERSATIONS_ID,
      conversationId,
    );

    const chats = Array.isArray(conversationDoc.chats) ? conversationDoc.chats : [];
    chatHistory = chats.map(({ user_prompt, ai_response }) => ({
      user_prompt,
      ai_response,
    }));
  } catch (err) {
    console.log(`Error getting chat: ${err.message}`);
  }

  // Get AI response based on user prompt and chat history
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
        user_id: user?.$id || null, // use null if no user found
      },
    );
  } catch (err) {
    console.log(`Error storing chat: ${err.message}`);
  }

  // Update conversation document to append new chat to chats array
  try {
    const conversationDoc = await databases.getDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_COLLECTION_CONVERSATIONS_ID,
      conversationId,
    );

    const updatedChats = Array.isArray(conversationDoc.chats) ? conversationDoc.chats : [];

    updatedChats.push({
      user_prompt: userPrompt,
      ai_response: aiResponse,
    });

    await databases.updateDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_COLLECTION_CONVERSATIONS_ID,
      conversationId,
      { chats: updatedChats }
    );
  } catch (err) {
    console.log(`Error updating conversation chats: ${err.message}`);
  }

  return null;
};

export default conversationAction;
export { conversationAction as action };