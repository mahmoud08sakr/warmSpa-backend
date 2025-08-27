import express from "express";
import { bootstrap } from "./src/app.controller.js";

const app = express();

// Global error handlers to prevent server crashes
process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
    console.error('Stack trace:', error.stack);
    // Don't exit immediately, let the server try to handle it
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit immediately, let the server try to handle it
});

const startServer = async () => {
    try {
        // Wait for bootstrap to complete (including database connection)
        await bootstrap(app, express);

        // Start the server only after bootstrap is successful
        app.listen(3000, () => {
            console.log("🚀 Server started on port 3000");
            console.log("✅ WarmSpa API is ready to accept requests");
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

// Start the server
startServer();