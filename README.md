# Groupomania

This is a full stack project for building a organizational Chat platform using React and MySQL

# Front-end:

Steps to set up ReactJS with Vite:

Step 1: Now, switch to react-sql-teams-chat directory

    cd react-sql-teams-chat

Step 2: Switch inside frontend folder - since this app is a combination of UI and BE.

    cd frontend

Step 3: Install Dependencies

    npm install

Step 4: Start Server, make sure check your port no on the terminal it may be different for your system.

    npm run dev

Step 5: You can now see app on port 5173

    local --> http://localhost:5173/

# Database setup

Step 1: Install SQL DataBase locally - https://dev.mysql.com/doc/mysql-getting-started/en/

Step 2: Open Terminal, execute Database schema file which creates tables, PRIMARY KEY and FOREIGN KEY

    mysql -u root -p chat_app < chat_app_database_schema.sql

# Backend API Setup

Step 1: Once you follow steps till 5 from frontend steps, we will need to enter inside backend folder.
        
        cd backend

Step 2: Create .env file for configuration - refer .env.example for the variables used, replace the placeholder values

Step 2: Install Dependencies

    npm install

Step 3: Start Backend API server at Port 5001

        node server.js
