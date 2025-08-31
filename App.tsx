
import React from 'react';
import ChatWindow from './components/ChatWindow';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl h-[90vh] max-h-[700px]">
        <ChatWindow />
      </div>
       <footer className="text-center mt-4 text-gray-500 text-sm">
        <p>Built to test your local Botpress instance.</p>
        <p>Provide the tunnel URL and Bot ID in `constants.ts`.</p>
      </footer>
    </div>
  );
};

export default App;
