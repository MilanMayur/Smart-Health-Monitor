//session-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, 
        UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SessionAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        if (request.session && request.session.user) {
            return true;
        }
        throw new UnauthorizedException('Not authenticated via session');
    }
}