import { Fragment } from "react";
import { Route, Routes } from "react-router-dom";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import MainLayout from "./layout/MainLayout";
import Chat from "./pages/Chat";

function App() {
  return (
    <Fragment>
      <Routes>
        <Route path="/sso" element={<AuthenticateWithRedirectCallback />} />
        <Route path="/auth" element={<Auth />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
        </Route>
      </Routes>
    </Fragment>
  );
}

export default App;
