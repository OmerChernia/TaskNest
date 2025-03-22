import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-white py-3 border-t">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">© 2023 TaskNest. All rights reserved.</p>
        </div>
        <div>
          <Link href="/privacy-policy">
            <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">Privacy Policy</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;