import { db } from "@/lib/db";
import { VoucherInput } from "../validators/voucher.schema";

export class VoucherService {
  static async createVoucher(data: VoucherInput) {
    return db.$transaction(async (tx) => {
      // 1. Create Voucher and VoucherItems
      const voucher = await tx.voucher.create({
        data: {
          type: data.type,
          date: data.date,
          ledgerId: data.ledgerId,
          totalAmount: data.totalAmount,
          note: data.note,
          items: {
            create: data.items?.map((item) => ({
              itemId: item.itemId,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // 2. Handle Stock Movements
      if (data.items && data.items.length > 0) {
        if (data.type === "SALE" || data.type === "PURCHASE") {
          const stockMoveType = data.type === "SALE" ? "OUT" : "IN";
          await tx.stockMove.createMany({
            data: data.items.map((item) => ({
              itemId: item.itemId,
              quantity: item.quantity,
              type: stockMoveType,
              refType: voucher.type,
              refId: voucher.id,
            })),
          });
        }
      }

      // 3. Handle Ledger Entries (Double Entry Bookkeeping)
      const ledgerEntries = [];

      switch (data.type) {
        case "SALE":
          // Debit Customer
          ledgerEntries.push({
            ledgerId: data.ledgerId,
            date: data.date,
            debit: data.totalAmount,
            credit: 0,
            refType: voucher.type,
            refId: voucher.id,
          });
          // Credit Revenue / Sales Account (if provided)
          if (data.offsetLedgerId) {
            ledgerEntries.push({
              ledgerId: data.offsetLedgerId,
              date: data.date,
              debit: 0,
              credit: data.totalAmount,
              refType: voucher.type,
              refId: voucher.id,
            });
          }
          break;

        case "PURCHASE":
          // Credit Supplier
          ledgerEntries.push({
            ledgerId: data.ledgerId,
            date: data.date,
            debit: 0,
            credit: data.totalAmount,
            refType: voucher.type,
            refId: voucher.id,
          });
          // Debit Purchase / Inventory Account (if provided)
          if (data.offsetLedgerId) {
            ledgerEntries.push({
              ledgerId: data.offsetLedgerId,
              date: data.date,
              debit: data.totalAmount,
              credit: 0,
              refType: voucher.type,
              refId: voucher.id,
            });
          }
          break;

        case "PAYMENT":
          // Debit Supplier
          ledgerEntries.push({
            ledgerId: data.ledgerId,
            date: data.date,
            debit: data.totalAmount,
            credit: 0,
            refType: voucher.type,
            refId: voucher.id,
          });
          // Credit Cash/Bank
          if (data.offsetLedgerId) {
            ledgerEntries.push({
              ledgerId: data.offsetLedgerId,
              date: data.date,
              debit: 0,
              credit: data.totalAmount,
              refType: voucher.type,
              refId: voucher.id,
            });
          }
          break;

        case "RECEIPT":
          // Credit Customer
          ledgerEntries.push({
            ledgerId: data.ledgerId,
            date: data.date,
            debit: 0,
            credit: data.totalAmount,
            refType: voucher.type,
            refId: voucher.id,
          });
          // Debit Cash/Bank
          if (data.offsetLedgerId) {
            ledgerEntries.push({
              ledgerId: data.offsetLedgerId,
              date: data.date,
              debit: data.totalAmount,
              credit: 0,
              refType: voucher.type,
              refId: voucher.id,
            });
          }
          break;
      }

      if (ledgerEntries.length > 0) {
        await tx.ledgerEntry.createMany({
          data: ledgerEntries,
        });
      }

      return voucher;
    }, {
      maxWait: 10000,  // Max time to acquire a connection (10s for Neon cold starts)
      timeout: 15000,  // Max time for the transaction to complete
    });
  }
}
