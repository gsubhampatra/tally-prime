"use server";

import { VoucherService } from "../services/voucher.service";
import { VoucherInput, VoucherSchema } from "../validators/voucher.schema";

export async function createVoucherAction(data: VoucherInput) {
  try {
    // 1. Zod Server-side Validation
    const parsed = VoucherSchema.parse(data);

    // 2. Call our robust Service layer via Transaction
    const voucher = await VoucherService.createVoucher({
      ...parsed,
      // Date coercion from string if coming directly from client action
      date: new Date(parsed.date),
    });

    // 3. Return success
    return { success: true, data: voucher };
  } catch (error: any) {
    console.error("Voucher Creation Error:", error);
    return { 
      success: false, 
      error: error.message || "Failed to create voucher" 
    };
  }
}

export async function updatePurchaseVoucherAction(voucherId: string, data: VoucherInput) {
  try {
    const parsed = VoucherSchema.parse(data);

    const voucher = await VoucherService.updatePurchaseVoucher(voucherId, {
      ...parsed,
      date: new Date(parsed.date),
    });

    return { success: true, data: voucher };
  } catch (error: any) {
    console.error("Purchase Voucher Update Error:", error);
    return {
      success: false,
      error: error.message || "Failed to update purchase voucher",
    };
  }
}
