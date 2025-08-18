import { Fragment } from "react";
import { Route, Routes } from "react-router-dom";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
import Album from "./pages/Album";

function App() {
  return (
    <Fragment>
      <Routes>
        <Route path="/sso" element={<AuthenticateWithRedirectCallback />} />
        <Route path="/auth" element={<Auth />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/albums/:albumId" element={<Album />} />
        </Route>
      </Routes>
    </Fragment>
  );
}

export default App;
