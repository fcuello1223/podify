import { create } from "zustand";
import { io } from "socket.io-client";

import { axiosInstance } from "@/lib/axios";
import type { Message, User } from "@/types";

interface ChatStore {
  users: User[];
  isLoading: boolean;
  error: string | null;
  socket: any;
  isConnected: boolean;
  onlineUsers: Set<string>;
  userActivities: Map<string, string>;
  messages: Message[];
  selectedUser: User | null;

  fetchUsers: () => Promise<void>;
  initializeSocket: (userId: string) => void;
  disconnectSocket: () => void;
  // sendMessage: (senderId: string, receiverId: string, content: string) => void;
  // sendMessage: (senderId: string, receiverId: string, content: string) => void;
  sendMessage: (receiverId: string, content: string) => void;
  fetchMessages: (userId: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
}

const baseUrl = import.meta.env.MODE === 'development' ? "http://localhost:5001" : '/api';

const socket = io(baseUrl, {
  autoConnect: false,
  withCredentials: true,
});

export const useChatStore = create<ChatStore>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,
  socket: socket,
  isConnected: false,
  onlineUsers: new Set(),
  userActivities: new Map(),
  messages: [],
  selectedUser: null,

  setSelectedUser: (user) => set({ selectedUser: user }),

  fetchUsers: async () => {
    set({ isLoading: false, error: null });

    try {
      const response = await axiosInstance.get("/users");
      set({ users: response.data });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  initializeSocket: (userId) => {
    if (!get().isConnected) {
      socket.auth = { userId };
      socket.connect();
      socket.emit("user_connected", userId);

      socket.on("users_online", (users: string[]) => {
        set({ onlineUsers: new Set(users) });
        console.log("CLIENT users_online:", users);
      });

      socket.on("activities", (activities: [string, string][]) => {
        set({ userActivities: new Map(activities) });
      });

      socket.on("user_connected", (userId: string) => {
        set((state) => ({
          onlineUsers: new Set([...state.onlineUsers, userId]),
        }));
      });

      socket.on("user_disconnected", (userId: string) => {
        set((state) => {
          const newOnlineUsers = new Set(state.onlineUsers);
          newOnlineUsers.delete(userId);
          return { onlineUsers: newOnlineUsers };
        });
      });

      socket.on("receive_message", (message: Message) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      });

      socket.on("message_sent", (message: Message) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      });

      socket.on("activity_update", ({ userId, activity }) => {
        set((state) => {
          const newActivities = new Map(state.userActivities);
          newActivities.set(userId, activity);
          return { userActivities: newActivities };
        });
      });

      set({ isConnected: true });
    }
  },

  disconnectSocket: () => {
    if (get().isConnected) {
      socket.disconnect();
      set({ isConnected: false });
    }
  },

  // sendMessage: async (senderId, receiverId, content) => {
  //   const socket = get().socket;

  //   if (!socket) {
  //     return;
  //   }

  //   socket.emit("send_message", { senderId, receiverId, content });
  // },

  sendMessage: async (receiverId, content) => {
    const socket = get().socket;
    if (!socket) return;
    socket.emit("send_message", { receiverId, content });
  },

  fetchMessages: async (userId) => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.get(`/users/messages/${userId}`);
      set({ messages: response.data });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
