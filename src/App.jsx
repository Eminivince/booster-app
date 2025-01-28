// frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import WalletGroupsPage from "./pages/WalletGroupsPage";
import CreateWalletGroupPage from "./pages/CreateWalletGroupPage";
import TokensPage from "./pages/TokensPage";
import DistributePage from "./pages/DistributePage";
import CollectFundsPage from "./pages/CollectFundsPage";
import BurnPage from "./pages/BurnPage";
import BuyPage from "./pages/BuyPage";
import SellPage from "./pages/SellPage";
import UsageReportPage from "./pages/UsageReportPage";
import HelpPage from "./pages/HelpPage";
import LoginPage from "./pages/LoginPage";
import ViewWalletGroupPage from "./pages/ViewWalletGroupPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<HomePage />} />
        <Route path="/wallet-group/view" element={<ViewWalletGroupPage />} />
        <Route path="/wallet-groups" element={<WalletGroupsPage />} />
        <Route path="/wallet-group/new" element={<CreateWalletGroupPage />} />
        <Route path="/tokens" element={<TokensPage />} />
        <Route path="/distribute" element={<DistributePage />} />
        <Route path="/collect" element={<CollectFundsPage />} />
        <Route path="/burn" element={<BurnPage />} />
        <Route path="/buy" element={<BuyPage />} />
        <Route path="/sell" element={<SellPage />} />
        <Route path="/usage-report" element={<UsageReportPage />} />
        <Route path="/help" element={<HelpPage />} />
      </Routes>
    </Router>
  );
}

export default App;
