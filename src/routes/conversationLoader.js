export async function loader({ request, params }) {
  if (request.method === "POST") {
    const formData = await request.formData();
    const userPrompt = formData.get("user_prompt");
    const editingId = formData.get("editing_id"); // send this from frontend if editing

    // Fetch conversation from DB
    let conversation = await getConversation(params.conversationId);

    if (editingId) {
      // Remove the old chat
      conversation.chats = conversation.chats.filter(chat => chat.$id !== editingId);
    }

    // Get AI response (call your AI API)
    const aiResponse = await getAIResponse(userPrompt);

    // Add new chat
    conversation.chats.push({
      $id: Date.now().toString(),
      user_prompt: userPrompt,
      ai_response: aiResponse,
    });

    // Save conversation back to DB
    await saveConversation(conversation);
  }

  // Always return the latest conversation
  return { conversation: await getConversation(params.conversationId) };
}