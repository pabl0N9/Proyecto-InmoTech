import React from 'react';
import { motion } from 'framer-motion';
import { MdNotifications, MdSearch, MdAccountCircle } from 'react-icons/md';

const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm flex items-center justify-between px-6"
    >
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-slate-800">Dashboard Principal</h2>
      </div>

      <div className="flex items-center space-x-4">
        
        
      

        {/* User Profile */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl px-4 py-2 cursor-pointer border border-slate-200/60 hover:border-blue-300/60 transition-all duration-300"
        >
          <MdAccountCircle className="text-slate-600" size={24} />
          <div className="text-sm">
            <p className="font-medium text-slate-800">Juan Pérez</p>
            <p className="text-slate-500">Administrador</p>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;