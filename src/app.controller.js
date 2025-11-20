import { connectDB } from "./database/connection.js";
import dotenv from "dotenv";
import userRouter from './modules/user/user.router.js';
import branchRouter from './modules/branch/branch.router.js';
import productRouter from './modules/product/product.router.js';
import { globalErrorHandling } from "./errorHandling/globalErrorHandling.js";
import cors from "cors"
import mongoose from 'mongoose';
import { handleStripeWebhook } from "./modules/order/order.service.js";
import orderRouter from "./modules/order/order.controller.js";
import reservationRouter from "./modules/reservation/reservation.router.js";
import roomsRouter from "./modules/rooms/room.router.js";
import expenseRouter from "./modules/expense/expense.controller.js";
import staffRouter from "./modules/staff/staff.router.js";
import bodyParser from "body-parser";

dotenv.config();

export const bootstrap = async (app, express) => {
    try {
        await connectDB();

        app.use(cors({
            origin: '*', // Replace with your frontend's URL
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            credentials: true, // Allow cookies or auth headers
        }));
        app.post(
            "/stripe-webhook",
            bodyParser.raw({ type: "application/json" }),
            handleStripeWebhook
        );
        app.use(express.json());
        app.get("/health", (req, res) => {
            const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                database: dbStatus,
                uptime: process.uptime()
            });
        });

        app.get("/", (req, res) => {
            res.json({
                message: "Welcome to WarmSpa API",
                version: "1.0.0",
                documentation: "/api-docs", // Add Swagger/OpenAPI docs if available
                health: "/health"
            });
        });
        app.get('/payment/success', (req, res) => {
            res.json('success ya rgola');
        });
        app.use('/api/v1/users', userRouter);
        app.use('/api/v1/branches', branchRouter);
        app.use('/api/v1/products', productRouter);
        app.use('/api/v1/orders', orderRouter);
        app.use('/api/v1/reservations', reservationRouter);
        app.use('/api/v1/rooms', roomsRouter)
        app.use('/api/v1/staff', staffRouter);
        app.use('/api/v1/expense',expenseRouter );
        app.use(globalErrorHandling);

        console.log("✅ API routes configured successfully");
    } catch (error) {
        console.error("❌ Failed to bootstrap application:", error);
        process.exit(1);
    }
};
