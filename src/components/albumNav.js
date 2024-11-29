// Navbar.js
import { useState } from 'react';
import AlbumModal from './AlbumModal';
import { Button } from 'antd';

function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-white">
      <h1 className="text-xl font-bold md:text-2xl">Albums</h1>
      <Button
        type="none"
        onClick={handleModalOpen}
        className="bg-green-600 border-none text-white hover:bg-green-500 font-semibold transition-colors duration-300 transform hover:scale-105"
      >
        Add Album
      </Button>
      {isModalOpen && <AlbumModal onClose={handleModalClose} />}
    </nav>
  );
}

export default Navbar;
