import React from "react";
// import {
//   BrowserRouter as Router,
//   Route,
//   Routes,
//   Navigate,
// } from "react-router-dom";
import Home from "./components/Home";
// import User from "./components/User";
import WalletContextProvider from "./components/walletConnect";

const App: React.FC = () => {
  return (
    <WalletContextProvider>
      <div className="bg-black">
        <Home />
      </div>
    </WalletContextProvider>
  );
};

export default App;
