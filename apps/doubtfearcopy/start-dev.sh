#!/bin/bash

# Start backend server
cd backend
echo "Installing backend dependencies..."
npm install
echo "Starting backend server..."
npm run dev &
BACKEND_PID=$!

# Start frontend server
cd ../frontend
echo "Installing frontend dependencies..."
npm install
echo "Starting frontend server..."
npm start &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID