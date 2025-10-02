import React, { createContext, useContext, useState, useEffect } from 'react';

const AppointmentContext = createContext();

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState(() => {
    const storedAppointments = localStorage.getItem('appointments');
    if (storedAppointments) {
      try {
        const parsed = JSON.parse(storedAppointments);
        return parsed;
      } catch (error) {
        console.error('Error parsing appointments from localStorage:', error);
        return [];
      }
    } else {
      return [];
    }
  });

  // Save to localStorage whenever appointments change
  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  const addAppointment = (newAppointment) => {
    const appointmentWithId = {
      ...newAppointment,
      id: Date.now(),
      fechaCreacion: new Date().toISOString().split('T')[0],
      estado: newAppointment.estado || 'programada'
    };

    setAppointments(prev => [...prev, appointmentWithId]);
  };

  const updateAppointment = (updatedAppointment) => {
    setAppointments(prev => {
      const newAppointments = prev.map(appointment =>
        appointment.id === updatedAppointment.id ? updatedAppointment : appointment
      );
      // Save immediately to localStorage
      localStorage.setItem('appointments', JSON.stringify(newAppointments));
      return newAppointments;
    });
  };

  const updateAppointmentStatus = (id, newStatus) => {
    setAppointments(prev => {
      const newAppointments = prev.map(appointment =>
        appointment.id === id ? { ...appointment, estado: newStatus } : appointment
      );
      // Save immediately to localStorage
      localStorage.setItem('appointments', JSON.stringify(newAppointments));
      return newAppointments;
    });
  };

  const deleteAppointment = (id) => {
    setAppointments(prev => {
      const newAppointments = prev.filter(appointment => appointment.id !== id);
      // Save immediately to localStorage
      localStorage.setItem('appointments', JSON.stringify(newAppointments));
      return newAppointments;
    });
  };

  const getAppointmentById = (id) => {
    return appointments.find(appointment => appointment.id === id);
  };

  const value = {
    appointments,
    addAppointment,
    updateAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    getAppointmentById
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};
