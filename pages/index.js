// pages/index.js

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import TodoList from '../src/components/ui/TodoList';
import Image from 'next/image';
import AppPurpose from '../src/components/AppPurpose';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      // Any authenticated-only logic here
    }
  }, [status, router]);

  const YouTubeVideo = () => (
    <div className="mt-8 w-full max-w-2xl mx-auto">
      <div className="aspect-w-16 aspect-h-9">
        <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/3j2eApYxfgc?si=mILLau3rNYCHPhNA" 
          title="YouTube video player" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          referrerPolicy="strict-origin-when-cross-origin" 
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
      <AppPurpose />
    </div>
  );

  // Only render content for the home page
  if (router.pathname === '/') {
    if (!session) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md mb-8">
            <div className="flex items-center justify-center mb-6">
              <Image src="/tasknest-logo.png" alt="TaskNest Logo" width={300} height={100} />
            </div>
            <h2 className="mb-6 text-xl text-center text-gray-600">Please Sign In to Continue</h2>
            <button
              onClick={() => signIn()}
              className="w-full px-4 py-2 text-white bg-orange-500 rounded hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
            >
              Sign In
            </button>
          </div>
          <YouTubeVideo />
        </div>
      );
    }

    return (
      <div className="w-full min-h-screen bg-gray-100">
        <TodoList />
      </div>
    );
  }

  // For other pages, render a default layout or redirect
  return (
    <div className="w-full min-h-screen bg-gray-100">
      <TodoList />
    </div>
  );
}
