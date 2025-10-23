import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/PrivateRoute';
import Home from './components/pages/Home';
import Upload from './components/pages/Upload';
import NewsList from './components/pages/NewsList';
import NewsDetail from './components/pages/NewsDetail';
import Context from './components/pages/Context';
import Perspective from './components/pages/Perspective';
import ContextDetails from './components/pages/ContextDetails';
import PerspectiveDetails from './components/pages/PerspectiveDetails';
import Login from './components/pages/Login';
import Register from './components/pages/Register';

// Import styles
import './styles/main.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/upload" element={
              <PrivateRoute>
                <Upload />
              </PrivateRoute>
            } />
            <Route path="/news" element={
              <PrivateRoute>
                <NewsList />
              </PrivateRoute>
            } />
            <Route path="/news/:id" element={
              <PrivateRoute>
                <NewsDetail />
              </PrivateRoute>
            } />
            <Route path="/context" element={
              <PrivateRoute>
                <Context />
              </PrivateRoute>
            } />
            <Route path="/context/:id" element={
              <PrivateRoute>
                <ContextDetails />
              </PrivateRoute>
            } />
            <Route path="/perspective" element={
              <PrivateRoute>
                <Perspective />
              </PrivateRoute>
            } />
            <Route path="/perspective/:id" element={
              <PrivateRoute>
                <PerspectiveDetails />
              </PrivateRoute>
            } />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
