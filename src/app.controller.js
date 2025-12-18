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
import feedbackRouter from "./modules/feedback/feedback.router.js";
import voucherRouter from "./modules/voucher/voucher.controller.js";
import resOrderRouter from "./modules/reseOrderModel/resOrder.controller.js";
import coursesRoutes from "./modules/courses/courses.controller.js";
import bodyParser from "body-parser";
import { auth } from "./midlleware/auth.js";
import { checkRole } from "./midlleware/role.js";
import expenseModel from "./database/model/expense.model.js";
import Order from "./database/model/order.model.js";
import ReservationModel from "./database/model/reservation.model.js";
import Room from "./database/model/room.model.js";
import { StaffModel } from "./database/model/staff.model.js";
import OrderDiscountModel from "./database/model/order.reciption.model.js";
import contactRouter from "./modules/contact/contact.controller.js";
import Product from "./database/model/product.model.js";


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

        app.get('/filter-data', auth, checkRole("Admin", "SAdmin"), async (req, res) => {
            try {
                const { serviceId, branchId } = req.query;
                const page = Math.max(parseInt(req.query.page || '1', 10), 1);
                const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 200);
                const skip = (page - 1) * limit;
                const isAll = (v) => !v || v === 'all' || v === 'undefined' || v === 'null';

                const expenseMatch = isAll(branchId) ? {} : { branch: new mongoose.Types.ObjectId(branchId) };
                const orderMatch = isAll(branchId) ? {} : { branch: new mongoose.Types.ObjectId(branchId) };
                const reservationMatch = isAll(branchId) ? {} : { branchId: new mongoose.Types.ObjectId(branchId) };
                const roomMatch = isAll(branchId) ? {} : { branchId: new mongoose.Types.ObjectId(branchId) };
                const staffMatch = isAll(branchId) ? {} : { branchId: new mongoose.Types.ObjectId(branchId) };

                const [expenseAgg] = await expenseModel.aggregate([
                    { $match: expenseMatch },
                    { $group: { _id: null, totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } }
                ]);

                let ordersTotalAmount = 0; let ordersCount = 0;
                if (isAll(serviceId)) {
                    const [orderAgg] = await Order.aggregate([
                        { $match: orderMatch },
                        { $group: { _id: null, totalAmount: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
                    ]);
                    ordersTotalAmount += orderAgg ? orderAgg.totalAmount : 0;
                    ordersCount += orderAgg ? orderAgg.count : 0;
                } else {
                    const [orderAggByService] = await Order.aggregate([
                        { $match: orderMatch },
                        { $unwind: "$items" },
                        { $match: { "items.service": new mongoose.Types.ObjectId(serviceId) } },
                        { $group: { _id: null, totalAmount: { $sum: "$items.price" }, count: { $sum: 1 } } }
                    ]);
                    ordersTotalAmount += orderAggByService ? orderAggByService.totalAmount : 0;
                    ordersCount += orderAggByService ? orderAggByService.count : 0;
                }

                if (isAll(serviceId)) {
                    const [discAgg] = await OrderDiscountModel.aggregate([
                        { $match: isAll(branchId) ? {} : { branchId: new mongoose.Types.ObjectId(branchId) } },
                        { $group: { _id: null, totalAmount: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
                    ]);
                    ordersTotalAmount += discAgg ? discAgg.totalAmount : 0;
                    ordersCount += discAgg ? discAgg.count : 0;
                } else {
                    const [discAggByService] = await OrderDiscountModel.aggregate([
                        { $match: isAll(branchId) ? {} : { branchId: new mongoose.Types.ObjectId(branchId) } },
                        { $unwind: "$products" },
                        { $match: { "products.productId": new mongoose.Types.ObjectId(serviceId) } },
                        { $group: { _id: null, totalAmount: { $sum: "$products.price" }, count: { $sum: 1 } } }
                    ]);
                    ordersTotalAmount += discAggByService ? discAggByService.totalAmount : 0;
                    ordersCount += discAggByService ? discAggByService.count : 0;
                }

                const reservationPipeline = [{ $match: reservationMatch }];
                if (!isAll(serviceId)) reservationPipeline.push({ $match: { serviceId: new mongoose.Types.ObjectId(serviceId) } });
                reservationPipeline.push({ $group: { _id: null, totalPrice: { $sum: "$price" }, count: { $sum: 1 } } });
                const [reservationAgg] = await ReservationModel.aggregate(reservationPipeline);

                const roomPipeline = [{ $match: roomMatch }];
                if (!isAll(serviceId)) roomPipeline.push({ $match: { selectedServide: new mongoose.Types.ObjectId(serviceId) } });
                roomPipeline.push({
                    $group: {
                        _id: null,
                        totalPrice: { $sum: { $ifNull: ["$priceAfterDiscount", { $ifNull: ["$price", 0] }] } },
                        count: { $sum: 1 }
                    }
                });
                const [roomAgg] = await Room.aggregate(roomPipeline);

                const staffTotals = await StaffModel.aggregate([
                    { $match: staffMatch },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                            active: { $sum: { $cond: [{ $eq: ["$isFired", false] }, 1, 0] } }
                        }
                    }
                ]);
                const staffAgg = staffTotals && staffTotals[0] ? staffTotals[0] : { total: 0, active: 0 };

                // Best ordered services (by revenue and count) across orders + reception orders
                const topOrdersAgg = await Order.aggregate([
                    { $match: orderMatch },
                    { $unwind: "$items" },
                    {
                        $group: {
                            _id: "$items.service",
                            count: { $sum: { $ifNull: ["$items.quantity", 1] } },
                            revenue: { $sum: { $multiply: [{ $ifNull: ["$items.price", 0] }, { $ifNull: ["$items.quantity", 1] }] } }
                        }
                    }
                ]);
                const topReceptionAgg = await OrderDiscountModel.aggregate([
                    { $match: isAll(branchId) ? {} : { branchId: new mongoose.Types.ObjectId(branchId) } },
                    { $unwind: "$products" },
                    {
                        $group: {
                            _id: "$products.productId",
                            count: { $sum: 1 },
                            revenue: { $sum: { $ifNull: ["$products.price", 0] } }
                        }
                    }
                ]);

                const totalsMap = new Map(); // key: serviceId -> { count, revenue }
                const addToMap = (arr) => {
                    for (const row of arr) {
                        if (!row || !row._id) continue;
                        const key = row._id.toString();
                        const prev = totalsMap.get(key) || { count: 0, revenue: 0 };
                        totalsMap.set(key, {
                            count: prev.count + (row.count || 0),
                            revenue: prev.revenue + (row.revenue || 0)
                        });
                    }
                };
                addToMap(topOrdersAgg);
                addToMap(topReceptionAgg);

                const combined = Array.from(totalsMap.entries()).map(([serviceIdStr, v]) => ({
                    serviceId: serviceIdStr,
                    count: v.count,
                    revenue: v.revenue
                }));
                const topByRevenue = combined.sort((a, b) => b.revenue - a.revenue).slice(0, 5);
                const topByCount = combined.sort((a, b) => b.count - a.count).slice(0, 5);

                const ids = Array.from(new Set([...topByRevenue, ...topByCount].map(x => x.serviceId))).map(id => new mongoose.Types.ObjectId(id));
                const products = await Product.find({ _id: { $in: ids } }).select('_id name').lean();
                const nameMap = new Map(products.map(p => [p._id.toString(), p.name]));

                const decorate = (arr) => arr.map(x => ({ ...x, name: nameMap.get(x.serviceId) || null }));
                const bestServices = {
                    topByRevenue: decorate(topByRevenue),
                    topByCount: decorate(topByCount),
                    topService: decorate(topByRevenue)[0] || null
                };

                // Fetch actual data documents with pagination
                const expenseDataPromise = expenseModel
                    .find(expenseMatch)
                    .select('nameExpense amount date branch status createdAt')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean();

                const orderQuery = { ...orderMatch };
                if (!isAll(serviceId)) {
                    orderQuery['items.service'] = new mongoose.Types.ObjectId(serviceId);
                }
                const ordersDataPromise = Order
                    .find(orderQuery)
                    .select('_id branch totalAmount status paymentStatus items createdAt')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean();

                const recepOrderQuery = isAll(branchId) ? {} : { branchId: new mongoose.Types.ObjectId(branchId) };
                if (!isAll(serviceId)) {
                    recepOrderQuery['products.productId'] = new mongoose.Types.ObjectId(serviceId);
                }
                const receptionOrdersDataPromise = OrderDiscountModel
                    .find(recepOrderQuery)
                    .select('_id branchId totalAmount status paymentStatus products createdAt')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean();

                const reservationQuery = { ...reservationMatch };
                if (!isAll(serviceId)) reservationQuery.serviceId = new mongoose.Types.ObjectId(serviceId);
                const reservationsDataPromise = ReservationModel
                    .find(reservationQuery)
                    .select('_id userName userEmail RoomId branchId serviceId price reservationDate createdAt')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean();

                const roomQuery = { ...roomMatch };
                if (!isAll(serviceId)) roomQuery.selectedServide = new mongoose.Types.ObjectId(serviceId);
                const roomsDataPromise = Room
                    .find(roomQuery)
                    .select('_id roomNumber isReserved selectedServide price priceAfterDiscount branchId createdAt')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean();

                const staffsDataPromise = StaffModel
                    .find(staffMatch)
                    .select('_id name role branchId isFired phone createdAt')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean();

                const [
                    expensesData,
                    ordersData,
                    receptionOrdersData,
                    reservationsData,
                    roomsData,
                    staffsData
                ] = await Promise.all([
                    expenseDataPromise,
                    ordersDataPromise,
                    receptionOrdersDataPromise,
                    reservationsDataPromise,
                    roomsDataPromise,
                    staffsDataPromise
                ]);

                return res.json({
                    filters: {
                        branchId: isAll(branchId) ? 'all' : branchId,
                        serviceId: isAll(serviceId) ? 'all' : serviceId
                    },
                    expenses: {
                        totalAmount: expenseAgg ? expenseAgg.totalAmount : 0,
                        count: expenseAgg ? expenseAgg.count : 0
                    },
                    orders: {
                        totalAmount: ordersTotalAmount,
                        count: ordersCount
                    },
                    reservations: {
                        totalPrice: reservationAgg ? reservationAgg.totalPrice : 0,
                        count: reservationAgg ? reservationAgg.count : 0
                    },
                    rooms: {
                        totalPrice: roomAgg ? roomAgg.totalPrice : 0,
                        count: roomAgg ? roomAgg.count : 0
                    },
                    staffs: {
                        total: staffAgg.total || 0,
                        active: staffAgg.active || 0
                    },
                    bestServices,
                    page,
                    limit,
                    data: {
                        expenses: expensesData,
                        orders: ordersData,
                        receptionOrders: receptionOrdersData,
                        reservations: reservationsData,
                        rooms: roomsData,
                        staffs: staffsData
                    }
                });
            } catch (err) {
                return res.status(500).json({ message: 'Failed to fetch analytics', error: err?.message || 'Unknown error' });
            }
        })
        app.use('/api/v1/users', userRouter);
        app.use('/api/v1/branches', branchRouter);
        app.use('/api/v1/products', productRouter);
        app.use('/api/v1/orders', orderRouter);
        app.use('/api/v1/reservations', reservationRouter);
        app.use('/api/v1/rooms', roomsRouter)
        app.use('/api/v1/staff', staffRouter);
        app.use('/api/v1/feedback', feedbackRouter);
        app.use('/api/v1/vouchers', voucherRouter);
        app.use('/api/v1/expense', expenseRouter);
        app.use('/api/v1/resOrder', resOrderRouter);
        app.use('/api/v1/courses', coursesRoutes);
        app.use('/api/v1/contacts', contactRouter);
        app.use(globalErrorHandling);

        console.log("✅ API routes configured successfully");
    } catch (error) {
        console.error("❌ Failed to bootstrap application:", error);
        process.exit(1);
    }
};
