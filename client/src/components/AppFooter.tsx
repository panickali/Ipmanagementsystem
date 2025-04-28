import { Link } from "wouter";

const AppFooter = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <Link href="/about" className="text-neutral-500 hover:text-neutral-700">
              About
            </Link>
            <Link href="/docs" className="text-neutral-500 hover:text-neutral-700">
              Documentation
            </Link>
            <Link href="/privacy" className="text-neutral-500 hover:text-neutral-700">
              Privacy Policy
            </Link>
            <Link href="/gdpr" className="text-neutral-500 hover:text-neutral-700">
              GDPR
            </Link>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-center text-sm text-neutral-500">
              &copy; {new Date().getFullYear()} IP Chain. All rights reserved. Running locally with Docker.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
