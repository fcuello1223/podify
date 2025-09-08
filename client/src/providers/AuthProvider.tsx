import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Loader } from "lucide-react";

import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/AuthStore";
import { useChatStore } from "@/stores/ChatStore";

const updateApiToken = (token: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken, userId } = useAuth();

  const [loading, setLoading] = useState(true);

  const { checkAdminStatus } = useAuthStore();
  const { initializeSocket, disconnectSocket } = useChatStore();
  

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await getToken();
        updateApiToken(token);
        if (token) {
          await checkAdminStatus();

          //Initialize Socket
          if (userId) {
            initializeSocket(userId);
          }
        }
      } catch (error) {
        updateApiToken(null);
        console.log("Authorization Provider Error!", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => disconnectSocket();
  }, [getToken, userId, checkAdminStatus, initializeSocket, disconnectSocket]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader className="size-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return <div>{children}</div>;
};

export default AuthProvider;
