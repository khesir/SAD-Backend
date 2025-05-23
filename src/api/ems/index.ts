import { Router } from 'express';

import departmentRoute from './department/department.route';
import designationRoute from './designation/designation.route';
import employeeRoute from './employee/employee/employee.route';

import employeeroleRoute from './roles/roles.route';
import employeeRolesRoute from './employeeRoles/employeeRoles.route';
import positionRoute from './position/position.route';

const emsRoute = Router({ mergeParams: true });

emsRoute.use('/department', departmentRoute);

emsRoute.use('/designation', designationRoute);

emsRoute.use('/employees', employeeRoute);

emsRoute.use('/roles', employeeroleRoute);

emsRoute.use('/employeeRoles', employeeRolesRoute);

emsRoute.use('/position', positionRoute);

export default emsRoute;
