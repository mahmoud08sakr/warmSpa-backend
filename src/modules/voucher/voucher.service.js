import Branch from "../../database/model/branch.model.js";
import Product from "../../database/model/product.model.js";
import { voucherModel } from "../../database/model/voucher.model.js";

export const createVoucher = async ({ code, discountType, discountValue, branchId }) => {
    const exists = await voucherModel.findOne({ code });
    if (exists) {
        return { status: 400, body: { message: "This voucher code already exists in the system" } };
    }

    if (branchId) {
        const branch = await Branch.findById(branchId);
        if (!branch) {
            return { status: 400, body: { message: "The specified branch does not exist" } };
        }
    }

    const voucher = await voucherModel.create({ code, discountType, discountValue, branchId });
    if (!voucher) {
        return { status: 400, body: { message: "Failed to create voucher" } };
    }
    return { status: 201, body: { message: "Voucher created successfully", voucher } };
};

export const getVoucherByBranchId = async (branchId) => {
    const voucher = await voucherModel.find({ branchId });
    return { status: 200, body: { voucher } };
};

export const getAllVouchers = async () => {
    const voucher = await voucherModel.find();
    return { status: 200, body: { voucher } };
};

export const updateVoucher = async (voucherId, { code, discountType, discountValue, branchId }) => {
    const voucher = await voucherModel.findById(voucherId);
    if (!voucher) {
        return { status: 400, body: { message: "Voucher not found" } };
    }
    voucher.code = code;
    voucher.discountType = discountType;
    voucher.discountValue = discountValue;
    voucher.branchId = branchId;
    await voucher.save();
    return { status: 200, body: { message: "Voucher updated successfully" } };
};

export const activateVoucher = async (voucherId) => {
    const voucher = await voucherModel.findById(voucherId);
    if (!voucher) {
        return { status: 400, body: { message: "Voucher not found" } };
    }
    if (voucher.isActive) {
        return { status: 400, body: { message: "Voucher is already active" } };
    }
    voucher.isActive = true;
    await voucher.save();
    return { status: 200, body: { message: "Voucher activated successfully" } };
};

export const deactivateVoucher = async (voucherId) => {
    const voucher = await voucherModel.findById(voucherId);
    if (!voucher) {
        return { status: 400, body: { message: "Voucher not found" } };
    }
    if (!voucher.isActive) {
        return { status: 400, body: { message: "Voucher is already deactivated" } };
    }
    voucher.isActive = false;
    await voucher.save();
    return { status: 200, body: { message: "Voucher deactivated successfully" } };
};

export const applyVoucher = async (serviceId , code) => {
    const voucher = await voucherModel.findOne({code});
    if (!voucher) {
        return { status: 400, body: { message: "Voucher not found" } };
    }
    if (!voucher.isActive) {
        return { status: 400, body: { message: "Voucher is not active" } };
    }
    let serviceDate = await Product.findById(serviceId); 
    if (!serviceDate) {
        return { status: 400, body: { message: "Service not found" } };
    }
    let totalAmount = serviceDate.price;
    let discountAmount = 0;
    if (voucher.discountType === "percentage") {
        discountAmount = (totalAmount * voucher.discountValue) / 100;
    } else {
        discountAmount = voucher.discountValue;
    }
    let finalAmount = totalAmount - discountAmount;
    serviceDate.price = finalAmount;
    return { status: 200, body: { message: "Voucher applied successfully", serviceDate } };
};