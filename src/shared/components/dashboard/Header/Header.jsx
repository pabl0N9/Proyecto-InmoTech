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
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-10 pr-4 py-2 bg-slate-100/80 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-300 w-64"
          />
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
        </div>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
        >
          <MdNotifications size={22} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </motion.button>

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