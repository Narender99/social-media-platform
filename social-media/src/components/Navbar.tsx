'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import WalletConnect from './WalletConnect';
import { HomeIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { isConnected } = useAccount();
  const pathname = usePathname();

  const navigation = [
    { name: 'Feed', href: '/feed', icon: HomeIcon },
    { name: 'Profile', href: '/profile', icon: UserCircleIcon },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-black/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold text-primary">
          DeSocial
        </Link>

        <div className="flex items-center gap-6">
          {isConnected && (
            <div className="hidden sm:flex sm:items-center sm:gap-6">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-primary'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          )}
          <WalletConnect />
        </div>
      </div>

      {/* Mobile navigation */}
      {isConnected && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-black/80 sm:hidden">
          <div className="container mx-auto flex h-16 items-center justify-around px-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
