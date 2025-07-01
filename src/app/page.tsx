import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { AnimatedGradient } from "@/components/animated-gradient";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#194826]">
      <header className="flex justify-between items-center p-4 h-16">
        <div className="flex items-center">
          <Image
            src="/chatgpt.svg"
            alt="OpenAI Logo"
            width={32}
            height={32}
            className="mr-2"
          />
          <span className="text-white font-semibold">OpenAI</span>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <a
            href="#"
            className="text-white/80 hover:text-white transition-colors"
          >
            Research
          </a>
          <a
            href="#"
            className="text-white/80 hover:text-white transition-colors"
          >
            Product
          </a>
          <a
            href="#"
            className="text-white/80 hover:text-white transition-colors"
          >
            Safety
          </a>
          <a
            href="#"
            className="text-white/80 hover:text-white transition-colors"
          >
            Company
          </a>
        </nav>
        <div className="flex items-center">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-white/80 hover:text-white font-medium text-sm px-4 py-2 cursor-pointer">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      <main className="flex flex-col md:flex-row px-6 py-16 md:px-16 md:py-24 max-w-7xl mx-auto">
        <div className="w-full md:w-1/2 text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Introducing ChatGPT
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-lg">
            We&apos;ve trained a model called ChatGPT which interacts in a
            conversational way. The dialogue format makes it possible for
            ChatGPT to answer followup questions, admit its mistakes, challenge
            incorrect premises, and reject inappropriate requests.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-white text-[#194826] rounded px-5 py-2 font-medium hover:bg-white/90 transition-colors flex items-center">
                  Try ChatGPT
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/chat"
                className="bg-white text-[#194826] rounded px-5 py-2 font-medium hover:bg-white/90 transition-colors flex items-center"
              >
                Try ChatGPT
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </SignedIn>
            <a
              href="#"
              className="text-white border border-white/30 rounded px-5 py-2 font-medium hover:bg-white/10 transition-colors"
            >
              Read about ChatGPT Plus
            </a>
          </div>
        </div>
        <div className="hidden md:block w-1/2 mt-10 md:mt-0">
          <div className="relative h-full w-full">
            <div className="absolute inset-0 bg-[#194826]/80 rounded-lg overflow-hidden">
              <AnimatedGradient />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
