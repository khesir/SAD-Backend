import { eq, and, isNull } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';
import log from '../../../../lib/logger';
import { db } from '../../../../drizzle/pool';
import { payment } from '../../../../drizzle/schema/payment';

// There's a globally used
// middleware like error handling and schema validation

export async function validatePaymentID(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { payment_id } = req.params;

  try {
    const Payment = await db
      .select()
      .from(payment)
      .where(
        and(
          eq(payment.payment_id, Number(payment_id)),
          isNull(payment.deleted_at),
        ),
      );
    if (!Payment[0]) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    next();
  } catch (error) {
    log.error(error);
    res.status(500).json({ message: 'Internal Server Error ' });
  }
}
