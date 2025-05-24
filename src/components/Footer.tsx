
import { FileText } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-blue-400" />
              <span className="font-bold text-xl">ExamVault</span>
            </div>
            <p className="mt-2 text-gray-400 max-w-md">
              Access previous year question papers for all branches and semesters
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 sm:gap-6">
            <div>
              <h2 className="mb-4 text-sm font-semibold uppercase text-white">Quick Links</h2>
              <ul className="text-gray-400">
                <li className="mb-2">
                  <a href="/" className="hover:text-white">Home</a>
                </li>
                <li className="mb-2">
                  <a href="/branches" className="hover:text-white">Branches</a>
                </li>
                <li>
                  <a href="/search" className="hover:text-white">Search Papers</a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-4 text-sm font-semibold uppercase text-white">Resources</h2>
              <ul className="text-gray-400">
                <li className="mb-2">
                  <a href="#" className="hover:text-white">About Us</a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:text-white">Contact</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">FAQ</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-700 sm:mx-auto lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-400 sm:text-center">
            © {new Date().getFullYear()} ExamVault. All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
