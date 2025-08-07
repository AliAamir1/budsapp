import { Chat, Match, Message, supabase } from './supabase';

export class ChatService {
  // Get or create a chat between two users
  static async getOrCreateChat(user1Id: string, user2Id: string): Promise<Chat> {
    // First, try to find an existing chat
    const { data: existingChat, error: findError } = await supabase
      .from('chat')
      .select('*')
      .or(`and(recipient_one.eq.${user1Id},recipient_two.eq.${user2Id}),and(recipient_one.eq.${user2Id},recipient_two.eq.${user1Id})`)
      .single();

    if (existingChat) {
      return existingChat;
    }

    // If no chat exists, create a new one
    const { data: newChat, error: createError } = await supabase
      .from('chat')
      .insert({
        recipient_one: user1Id,
        recipient_two: user2Id,
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create chat: ${createError.message}`);
    }

    return newChat;
  }

  // Get all chats for a user
  static async getUserChats(userId: string): Promise<Chat[]> {
    console.log("getUserChats", userId);
    const { data, error } = await supabase
      .from('chat')
      .select('*')
      .or(`recipient_one.eq.${userId},recipient_two.eq.${userId}`)
      .order('updated_at', { ascending: false });

    console.log("getUserChats", data);

    if (error) {
      throw new Error(`Failed to fetch chats: ${error.message}`);
    }

    return data || [];
  }

  // Get messages for a specific chat
  static async getChatMessages(chatId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    console.log("getChatMessages", data, error);
    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    return data || [];
  }

  // Send a message
  static async sendMessage(
    chatId: string,
    senderId: string,
    receiverId: string,
    content: string
  ): Promise<Message> {
    console.log("sendMessage", chatId, senderId, receiverId, content);
    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
      })
      .select()
      .single();

    console.log("sendMessage", data, error);
    if (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }

    // Update the chat's last_message and updated_at
    await supabase
      .from('chat')
      .update({
        last_message: content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', chatId);

    return data;
  }

  // Subscribe to real-time messages for a chat
  static subscribeToChatMessages(
    chatId: string,
    callback: (message: Message) => void
  ) {
    return supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  }

  // Subscribe to chat updates (last message, etc.)
  static subscribeToChatUpdates(
    userId: string,
    callback: (chat: Chat) => void
  ) {
    return supabase
      .channel(`user_chats:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat',
          filter: `recipient_one=eq.${userId},recipient_two=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Chat);
        }
      )
      .subscribe();
  }

  // Get user's matches
  static async getUserMatches(userId: string): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('status', 'matched')
      .order('matched_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch matches: ${error.message}`);
    }

    return data || [];
  }

  // Get user profile by ID
  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }

    return data;
  }
} 