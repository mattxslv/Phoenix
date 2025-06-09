const deleteConversation = ({ id, title, submit }) => {
  submit(
    {
      request_type: 'delete_conversation',
      conversation_id: id,
      conversation_title: title,
    },
    {
      method: 'DELETE',
      encType: 'application/x-www-form-urlencoded',
      action: `/${conversationId}`,
    },
  );
};

export default deleteConversation;
