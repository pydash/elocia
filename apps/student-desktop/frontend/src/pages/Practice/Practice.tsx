import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';

// Mini-game assets
import seeItSignItImg from '../../assets/See It, Sign It!.png'; 
import puzzleSignImg from '../../assets/Puzzle sign.png';       
import magicFingersImg from '../../assets/Magic fingers.png';

export default function Practice() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FDFEEA]"> 
      
      <Sidebar />

      <main className="main-content-area flex-1 overflow-y-auto p-10">
        
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-gray-800">Time to Practice!</h1>
          <p className="text-lg text-gray-600 mt-2">Keep your fingers flexible and your strokes alive!</p>
        </header>

        {/* Top Widgets: Videos & Recent Errors */}
        <section className="flex gap-6 mb-12">
          {/* Videos Widget */}
          <div className="w-1/2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">📺</span>
              <h3 className="text-xl font-bold text-gray-700">Videos</h3>
              <a href="#" className="ml-auto text-sm text-orange-500 font-semibold hover:underline">View All</a>
            </div>
            <div className="flex gap-4">
              <div className="w-1/2 h-32 bg-gray-200 rounded-xl flex items-center justify-center relative overflow-hidden group cursor-pointer">
                 {/* Placeholder for Video Thumbnail */}
                 <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all"></div>
                 <span className="text-white text-3xl z-10">▶</span>
                 <p className="absolute bottom-2 left-2 text-white font-semibold text-sm z-10">Alphabet Basics</p>
              </div>
              <div className="w-1/2 h-32 bg-gray-200 rounded-xl flex items-center justify-center relative overflow-hidden group cursor-pointer">
                 <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all"></div>
                 <span className="text-white text-3xl z-10">▶</span>
                 <p className="absolute bottom-2 left-2 text-white font-semibold text-sm z-10">Numbers 1-10</p>
              </div>
            </div>
          </div>

          {/* Recent Errors Widget (Tier 4 Fallbacks) */}
          <div className="w-1/2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🔄</span>
              <h3 className="text-xl font-bold text-gray-700">Recent Errors</h3>
              <a href="#" className="ml-auto text-sm text-orange-500 font-semibold hover:underline">View All</a>
            </div>
            <div className="grid grid-cols-2 gap-4 h-32">
              <div className="bg-pink-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-pink-200 transition-colors">
                <span className="font-bold text-pink-600">Letter A</span>
              </div>
              <div className="bg-orange-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-orange-200 transition-colors">
                <span className="font-bold text-orange-600">Number 5</span>
              </div>
              <div className="bg-green-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-green-200 transition-colors">
                <span className="font-bold text-green-600">Greeting</span>
              </div>
              <div className="bg-blue-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-blue-200 transition-colors">
                <span className="font-bold text-blue-600">Letter C</span>
              </div>
            </div>
          </div>
        </section>

        {/* Gamified Mini Games Section */}
        <section className="mb-12 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6">
             <span className="text-2xl">🎮</span>
             <h2 className="text-2xl font-bold text-gray-800">Mini Games</h2>
          </div>
          
          <div className="flex justify-center gap-6 w-full max-w-5xl">
            <button className="flex-1 transition-transform duration-200 hover:-translate-y-2 hover:shadow-xl rounded-2xl overflow-hidden focus:outline-none bg-white">
              <img src={seeItSignItImg} alt="See It, Sign It!" className="w-full h-auto object-cover" />
            </button>
            <button className="flex-1 transition-transform duration-200 hover:-translate-y-2 hover:shadow-xl rounded-2xl overflow-hidden focus:outline-none bg-white">
              <img src={puzzleSignImg} alt="Puzzle Sign" className="w-full h-auto object-cover" />
            </button>
            <button className="flex-1 transition-transform duration-200 hover:-translate-y-2 hover:shadow-xl rounded-2xl overflow-hidden focus:outline-none bg-white">
              <img src={magicFingersImg} alt="Magic Fingers" className="w-full h-auto object-cover" />
            </button>
          </div>
        </section>

        {/* Review Past Stages */}
        <section className="flex flex-col items-center pb-10">
          <div className="flex items-center gap-2 mb-6">
             <span className="text-2xl">⭐</span>
             <h2 className="text-2xl font-bold text-gray-800">Review Past Stages</h2>
          </div>
          <button className="bg-orange-500 hover:bg-orange-600 text-white text-xl font-bold py-4 px-12 rounded-full shadow-md transition-colors w-full max-w-2xl">
            Section 1, Unit 1
          </button>
        </section>

      </main>
    </div>
  );
}