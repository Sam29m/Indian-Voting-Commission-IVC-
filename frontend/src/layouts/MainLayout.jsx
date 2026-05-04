import React from 'react';
import { Outlet } from 'react-router-dom';
import MitraChat from '../components/MitraChat';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-ivc-light flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Indian Voting Commission</h1>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        <Outlet />
      </main>
      <MitraChat />
      <footer className="bg-ivc-dark text-white p-4 text-center">
        <p>&copy; 2026 Indian Voting Commission. All rights reserved.</p>
      </footer>
    </div>
  );
}
