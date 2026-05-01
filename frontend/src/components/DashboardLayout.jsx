import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Header />
        <main className="p-8 flex-1 animate-in fade-in duration-500">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
