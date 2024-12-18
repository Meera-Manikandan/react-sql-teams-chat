import React from 'react';

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div>
      <h1>Welcome, {user?.username}!</h1>
      <p>This is your dashboard.</p>
    </div>
  );
}

export default Dashboard;
