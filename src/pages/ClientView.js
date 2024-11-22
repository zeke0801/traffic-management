import React from 'react';
import ClientMapComponent from '../components/Map/ClientMapComponent';

const ClientView = () => {
  return (
    <div className="client-view">
      <header className="client-header">
        <h1>Traffic Alert System - Naga City</h1>
        <p>Live traffic and road condition updates</p>
      </header>
      <ClientMapComponent />
    </div>
  );
};

export default ClientView;
