import React from 'react';

const Dashboard = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-[80vh] flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to CineMind Admin</h1>
                <p className="text-gray-500">Select an option from the sidebar to manage the system.</p>
            </div>
        </div>
    );
};

export default Dashboard;
