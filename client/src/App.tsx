import { Fragment } from "react";
import { Route, Routes } from "react-router-dom";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { Toaster } from 'react-hot-toast';

import MainLayout from "./layout/MainLayout";
import Home from "./pages/home/Home";
import Auth from "./pages/auth/Auth";
import Chat from "./pages/chat/Chat";
import Album from "./pages/album/Album";
import Admin from "./pages/admin/Admin";

function App() {
  return (
    <Fragment>
      <Routes>
        <Route path="/sso" element={<AuthenticateWithRedirectCallback />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<Admin />}  />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/albums/:albumId" element={<Album />} />
        </Route>
      </Routes>
      <Toaster />
    </Fragment>
  );
}

export default App;
