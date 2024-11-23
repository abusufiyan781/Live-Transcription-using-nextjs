"use client";

import Image from "next/image";
import App from "./components/App";
import GitHubButton from "react-github-btn";

const Home = () => {
  return (
    <>
      <div   className="h-full overflow-hidden bg-[url('https://cdn.pixabay.com/photo/2015/06/27/17/47/background-823673_640.png')] bg-cover bg-center">
        <div className="bg-gradient-to-b from-black/50 to-black/10 backdrop-blur-[2px] h-[4rem] flex items-center">
          <header className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 flex items-center justify-between">  
          </header>
        </div>
        <main className="mx-auto px-4 md:px-6 lg:px-8 h-[calc(100%-4rem)] -mb-[4rem]">
          <App />
        </main>

      </div>
    </>
  );
};

export default Home;
