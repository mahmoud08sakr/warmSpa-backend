import Branch from "../../database/model/branch.model.js";
import Product from "../../database/model/product.model.js";
import { voucherModel } from "../../database/model/voucher.model.js";
import { handleAsyncError } from "../../errorHandling/handelAsyncError.js";
import { AppError } from "../../errorHandling/AppError.js";

export const createVoucher = handleAsyncError(async (req, res) => {
    const { code, discountType, discountValue, branchId, products } = req.body;
    const exists = await voucherModel.findOne({ code });
    if (exists) {
        return res.status(400).json({ message: "This voucher code already exists in the system" });
    }

    if (branchId) {
        const branch = await Branch.findById(branchId);
        if (!branch) {
            return res.status(400).json({ message: "The specified branch does not exist" });
        }
    }
    if (products) {

    }
    const voucher = await voucherModel.create({ code, discountType, discountValue, branchId, products });
    if (!voucher) {
        return res.status(400).json({ message: "Failed to create voucher" });
    }
    return res.status(201).json({ message: "Voucher created successfully", voucher });
});

export const getVoucherByBranchId = handleAsyncError(async (req, res) => {
    const { branchId } = req.params;
    const voucher = await voucherModel.find({ branchId });
    return res.status(200).json({ voucher });
});

export const getAllVouchers = handleAsyncError(async (req, res) => {
    const voucher = await voucherModel.find();
    return res.status(200).json({ voucher });
});

export const updateVoucher = handleAsyncError(async (req, res) => {
    const { voucherId } = req.params;
    const { code, discountType, discountValue, branchId, serviceId } = req.body;
    const voucher = await voucherModel.findById(voucherId);
    if (!voucher) {
        return res.status(400).json({ message: "Voucher not found" });
    }
    voucher.code = code;
    voucher.discountType = discountType;
    voucher.discountValue = discountValue;
    voucher.branchId = branchId;
    voucher.serviceId = serviceId;
    await voucher.save();
    return res.status(200).json({ message: "Voucher updated successfully" });
});

export const activateVoucher = handleAsyncError(async (req, res) => {
    const { voucherId } = req.params;
    const voucher = await voucherModel.findById(voucherId);
    if (!voucher) {
        return res.status(400).json({ message: "Voucher not found" });
    }
    if (voucher.isActive) {
        return res.status(400).json({ message: "Voucher is already active" });
    }
    voucher.isActive = true;
    await voucher.save();
    return res.status(200).json({ message: "Voucher activated successfully" });
});

export const deactivateVoucher = handleAsyncError(async (req, res) => {
    const { voucherId } = req.params;
    const voucher = await voucherModel.findById(voucherId);
    if (!voucher) {
        return res.status(400).json({ message: "Voucher not found" });
    }
    if (!voucher.isActive) {
        return res.status(400).json({ message: "Voucher is already deactivated" });
    }
    voucher.isActive = false;
    await voucher.save();
    return res.status(200).json({ message: "Voucher deactivated successfully" });
});

export const applyVoucher = handleAsyncError(async (req, res) => {
    const { serviceId } = req.params;
    const { code } = req.body;
    const voucher = await voucherModel.findOne({ code });
    if (!voucher) {
        return res.status(400).json({ message: "Voucher not found" });
    }
    if (!voucher.isActive) {
        return res.status(400).json({ message: "Voucher is not active" });
    }
    const service = await Product.findById(serviceId);
    if (!service) {
        return res.status(400).json({ message: "Service not found" });
    }
    const totalAmount = service.price;
    let discountAmount = 0;
    if (voucher.discountType === "percentage") {
        discountAmount = (totalAmount * voucher.discountValue) / 100;
    } else {
        discountAmount = voucher.discountValue;
    }
    const finalAmount = Math.max(0, totalAmount - discountAmount);
    return res.status(200).json({
        message: "Voucher applied successfully",
        originalPrice: totalAmount,
        discountAmount,
        finalPrice: finalAmount,
    });
});

export const deleteVoucher = handleAsyncError(async (req, res, next) => {
    const { voucherId } = req.params;
    const voucher = await voucherModel.findByIdAndDelete(voucherId);
    if (!voucher) {
        return next(new AppError('No voucher found with that ID', 404));
    }
    return res.status(200).json({
        status: 'success',
        message: 'Voucher deleted successfully',
    });
});