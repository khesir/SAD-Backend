import { eq, and, isNull } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';

import log from '../../../../../lib/logger';
import { HttpStatus } from '../../../../../lib/HttpStatus';
import { db } from '../../../../../drizzle/pool';
import {
  employee,
  personalInformation,
} from '../../../../../drizzle/schema/ems';

export async function validatePersonalId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { personalInfo_id } = req.params;

  try {
    const activity = await db
      .select()
      .from(personalInformation)
      .where(
        and(
          eq(personalInformation.personal_info_id, Number(personalInfo_id)),
          isNull(personalInformation.deleted_at),
        ),
      );
    if (!activity[0]) {
      return res
        .status(404)
        .json({ message: 'Personal Information not found' });
    }
    next();
  } catch (error) {
    log.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function validateEmployeeId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { employee_id } = req.params;

  try {
    if (employee_id === undefined) {
      next();
    } else {
      const data = await db
        .select()
        .from(employee)
        .where(
          and(
            eq(employee.employee_id, Number(employee_id)),
            isNull(employee.deleted_at),
          ),
        );
      if (!data[0]) {
        return res
          .status(HttpStatus.NOT_FOUND.code)
          .json({ message: 'Employee not found' });
      }
      next();
    }
  } catch (error) {
    console.log(error);
    log.error(error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR.code)
      .json({ message: 'Internal server error' });
  }
}
