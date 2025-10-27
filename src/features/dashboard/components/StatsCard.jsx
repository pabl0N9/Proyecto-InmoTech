import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = "bg-gradient-to-r from-blue-500 to-blue-600",
  textColor = "text-blue-600",
  bgColor = "bg-blue-50"
}) => {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;