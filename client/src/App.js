import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import ShareRecipe from './pages/ShareRecipe';
import ChatBot from './components/ChatBot';
import Admin from './pages/Admin';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/recipes/:id" element={<RecipeDetail />} />
              <Route path="/share" element={<ShareRecipe />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <ChatBot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;