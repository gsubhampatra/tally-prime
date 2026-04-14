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

  static async updatePurchaseVoucher(voucherId: string, data: VoucherInput) {
    if (data.type !== "PURCHASE") {
      throw new Error("Only purchase vouchers can be updated with this flow.");
    }

    return db.$transaction(async (tx) => {
      const existingVoucher = await tx.voucher.findUnique({
        where: { id: voucherId },
        include: { items: true },
      });

      if (!existingVoucher) {
        throw new Error("Purchase voucher not found.");
      }

      await tx.voucherItem.deleteMany({ where: { voucherId } });
      await tx.stockMove.deleteMany({ where: { refId: voucherId, refType: existingVoucher.type } });
      await tx.ledgerEntry.deleteMany({ where: { refId: voucherId, refType: existingVoucher.type } });

      const voucher = await tx.voucher.update({
        where: { id: voucherId },
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

      if (data.items && data.items.length > 0) {
        const stockMoveType = "IN";
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

      const ledgerEntries = [
        {
          ledgerId: data.ledgerId,
          date: data.date,
          debit: 0,
          credit: data.totalAmount,
          refType: voucher.type,
          refId: voucher.id,
        },
      ];

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

      await tx.ledgerEntry.createMany({
        data: ledgerEntries,
      });

      return voucher;
    }, {
      maxWait: 10000,
      timeout: 15000,
    });
  }
}
