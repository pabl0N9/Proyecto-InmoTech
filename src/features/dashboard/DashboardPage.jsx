import React from 'react';
import { motion } from 'framer-motion';
import { MdTrendingUp, MdHome, MdCalendarToday, MdAttachMoney } from 'react-icons/md';
import DashboardLayout from '../../shared/components/dashboard/Layout/DashboardLayout';

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    transition={{ duration: 0.3 }}
    className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <MdTrendingUp size={16} />
            <span className="text-sm ml-1">+{trend}% este mes</span>
          </div>
        )}
      </div>
      <div className="bg-white/20 p-3 rounded-xl">
        <Icon size={32} />
      </div>
    </div>
  </motion.div>
);

const DashboardContent = () => {
  const stats = [
    {
      title: 'Propiedades Activas',
      value: '156',
      icon: MdHome,
      trend: '12',
      color: 'from-blue-600 to-blue-700'
    },
    {
      title: 'Citas Programadas',
      value: '24',
      icon: MdCalendarToday,
      trend: '8',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Ventas del Mes',
      value: '8',
      icon: MdTrendingUp,
      trend: '25',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Ingresos Generados',
      value: '$2.4M',
      icon: MdAttachMoney,
      trend: '18',
      color: 'from-amber-500 to-amber-600'
    }
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          ¡Bienvenido al Dashboard!
        </h1>
        <p className="text-slate-600 text-lg">
          Gestiona tu negocio inmobiliario de manera eficiente y profesional.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-lg"
      >
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Actividad Reciente
        </h2>
        <div className="space-y-4">
          {[
            { action: 'Nueva propiedad registrada', time: 'Hace 2 horas', type: 'success' },
            { action: 'Cita programada con cliente', time: 'Hace 4 horas', type: 'info' },
            { action: 'Venta completada', time: 'Hace 6 horas', type: 'success' },
            { action: 'Reporte mensual generado', time: 'Hace 1 día', type: 'warning' }
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50/80 transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  activity.type === 'success' ? 'bg-emerald-500' :
                  activity.type === 'info' ? 'bg-blue-500' :
                  'bg-amber-500'
                }`} />
                <span className="text-slate-700">{activity.action}</span>
              </div>
              <span className="text-slate-500 text-sm">{activity.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const DashboardPage = () => {
  return <DashboardContent />;
};

export default DashboardPage;
