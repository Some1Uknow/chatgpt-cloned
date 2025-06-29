import { 
  SignInButton, 
  SignUpButton, 
  SignedIn, 
  SignedOut, 
  UserButton 
} from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex justify-end items-center p-4 gap-4 h-16">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="text-gray-600 hover:text-gray-900 font-medium text-sm sm:text-base px-4 py-2 cursor-pointer">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer hover:bg-[#5a3ee6] transition-colors">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </header>
      
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to ChatGPT Clone
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
          Experience the power of AI conversation with our modern ChatGPT clone.
          Sign in to start chatting!
        </p>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-[#6c47ff] text-white rounded-full font-medium text-base h-12 px-8 cursor-pointer hover:bg-[#5a3ee6] transition-colors">
              Get Started
            </button>
          </SignInButton>
        </SignedOut>
      </main>
    </div>
  );
}
