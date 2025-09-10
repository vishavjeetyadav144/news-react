import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="app">
      <Header />
      <main className="container mt-4">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
