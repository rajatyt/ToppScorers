import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Connections = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/dashboard#connections', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default Connections;
