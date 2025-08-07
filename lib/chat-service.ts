import { Chat, Match, Message, supabase } from "./supabase";

export class ChatService {
  // Get or create a chat between two users
  static async getOrCreateChat(user1Id: string, user2Id: string): Promise<Chat> {
    // First, try to find an existing chat
    const { data: existingChats, error: findError } = await supabase
      .from("chat")
      .select("*")
      .or(
        `and(recipient_one.eq.${user1Id},recipient_two.eq.${user2Id}),and(recipient_one.eq.${user2Id},recipient_two.eq.${user1Id})`
      )
      .order("created_at", { ascending: false })
      // .limit(1);

    console.log("getOrCreateChat", existingChats, findError, user1Id, user2Id);
    if (findError) {
      throw new Error(`Failed to fetch existing chat: ${findError.message}`);
    }

    if (existingChats && existingChats.length > 0) {
      return existingChats[0];
    }

    // If no chat exists, create a new one
    console.log("Creating new chat between", user1Id, "and", user2Id);
    const { data: newChat, error: createError } = await supabase
      .from("chat")
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
      .from("chat")
      .select("*")
      .or(`recipient_one.eq.${userId},recipient_two.eq.${userId}`)
      .order("updated_at", { ascending: false });

    console.log("getUserChats", data);

    if (error) {
      throw new Error(`Failed to fetch chats: ${error.message}`);
    }

    return data || [];
  }

  // Get messages for a specific chat
  static async getChatMessages(chatId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: false });

    console.log("getChatMessages", data, error, chatId);
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
      .from("messages")
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
      .from("chat")
      .update({
        last_message: content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", chatId);

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
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          console.log("subscribeToChatMessages", payload);
          callback(payload.new as Message);
        }
      )
      .subscribe();
  }

  // Subscribe to chat updates
  static subscribeToChatUpdates(
    userId: string,
    callback: (chat: Chat) => void
  ) {
    return supabase
      .channel(`user_chats:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat",
          filter: `recipient_one=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Chat);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat",
          filter: `recipient_two=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Chat);
        }
      )
      .subscribe();
  }

  // Subscribe to match updates for a user
  static subscribeToMatchUpdates(
    userId: string,
    callback: (match: Match) => void
  ) {
    return supabase
      .channel(`user_matches:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `user1_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Match update received (user1)", payload);
          callback(payload.new as Match);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `user2_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Match update received (user2)", payload);
          callback(payload.new as Match);
        }
      )
      .subscribe();
  }

  // Get user matches from Supabase (if needed)
  static async getUserMatches(userId: string): Promise<Match[]> {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq("status", "matched");

    if (error) {
      throw new Error(`Failed to fetch matches: ${error.message}`);
    }

    return data || [];
  }

  // Get user profile
  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }

    return data;
  }
}
