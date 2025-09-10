import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './components/pages/Home';
import Upload from './components/pages/Upload';
import NewsList from './components/pages/NewsList';
import NewsDetail from './components/pages/NewsDetail';
import Context from './components/pages/Context';
import Perspective from './components/pages/Perspective';
import ContextDetails from './components/pages/ContextDetails';
import PerspectiveDetails from './components/pages/PerspectiveDetails';

// Import styles
import './styles/main.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/news" element={<NewsList />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/context" element={<Context />} />
          <Route path="/context/:id" element={<ContextDetails />} />
          <Route path="/perspective" element={<Perspective />} />
          <Route path="/perspective/:id" element={<PerspectiveDetails />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
