import { HttpException, HttpStatus, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ACCOUNT_ROLE } from 'src/enums/user-status-role';

@Injectable()
export class JwtAuthAdminMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

        if (!token) {
            throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const role = decoded['role']
            if (role != ACCOUNT_ROLE.ADMIN) {
                throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
            }
            req['user'] = decoded;
            next();

        } catch (error) {
            throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
        }
    }
}
