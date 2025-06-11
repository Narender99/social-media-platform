import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col">
        <main className="container mx-auto flex flex-1 flex-col px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Welcome to DeSocial
            </h1>
            <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              A decentralized social media platform where you own your data and content
            </p>
            <div className="flex flex-col items-center space-y-4">
              <p className="text-lg font-medium">Connect your wallet to get started</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
