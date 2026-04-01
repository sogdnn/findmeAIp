import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FindMeAPI } from './api'; // Импорт созданного ранее сервиса

const App = () => {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  const handleUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    setFile(URL.createObjectURL(uploadedFile));
    setIsScanning(true);
    
    // Имитация и реальный вызов API
    const data = await FindMeAPI.searchByFace(uploadedFile);
    setResults(data.matches || []);
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#2F2F2F] font-sans p-8">
      {/* Hero Section */}
      <header className="max-w-6xl mx-auto text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-semibold mb-4">Find missing people instantly with AI</motion.h1>
        <p className="text-lg opacity-80">Upload a photo or describe appearance to start the search</p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Search & Upload Panel */}
        <section className="bg-white p-8 rounded-[24px] shadow-sm border border-[#A3B18A]/20">
          <h2 className="text-2xl mb-6">Search Panel</h2>
          <div className="border-2 border-dashed border-[#A3B18A] rounded-[16px] p-12 text-center hover:bg-[#A3B18A]/5 transition-colors relative overflow-hidden">
            <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            <p>Click or drag photo here to upload</p>
            {file && <img src={file} alt="Preview" className="mt-4 h-32 mx-auto rounded-lg" />}
          </div>
          
          <div className="mt-6">
            <input type="text" placeholder="Find this child in red jacket..." 
              className="w-full p-4 rounded-[16px] bg-[#F7F5F2] border-none focus:ring-2 focus:ring-[#A3B18A]" />
          </div>
        </section>

        {/* Real-Time Camera Section */}
        <section className="bg-[#2F2F2F] rounded-[24px] p-4 relative overflow-hidden text-white h-[400px] flex items-center justify-center">
          {isScanning && (
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 border-4 border-[#A3B18A] rounded-[24px] z-10"
            />
          )}
          <p className="z-20">{isScanning ? "Scanning crowd..." : "Camera Standby"}</p>
        </section>
      </main>

      {/* Results Grid */}
      <section className="max-w-6xl mx-auto mt-16">
        <h3 className="text-3xl mb-8">Results</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {results.map((res, i) => (
              <motion.div 
                key={i} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-4 rounded-[24px] shadow-sm">
                <div className="h-48 bg-gray-200 rounded-[16px] mb-4"></div>
                <p className="font-bold">Match: {res.confidence * 100}%</p>
                <p className="text-sm opacity-60">Last seen: Central Park, 12:40</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default App;
