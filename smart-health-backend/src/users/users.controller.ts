//users.controller.ts
import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { Request } from 'express';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common/exceptions';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(SessionAuthGuard)
    @Get('me')
    async getProfile(@Req() req: Request) {
        try {
            const sessionUser = req.session?.user;
            if (!sessionUser || !sessionUser._id) {
                throw new NotFoundException('User not found in session');
            }
            const user = await this.usersService.findById(sessionUser._id);
            if (!user) throw new NotFoundException('User not found');

            const safeUser = {
                _id: String(user._id),
                name: user.name,
                email: user.email,
            };

        return { safeUser };
        } 
        catch (error) {
            throw new NotFoundException('User profile not found');
        }
    }

    @UseGuards(SessionAuthGuard)
    @Get(':id')
    async getUser(@Param('id') id: string) {
        try {
            const user = await this.usersService.findById(id);
            if (!user) throw new NotFoundException('User not found');
            const safeUser = {
            name: user.name,
            email: user.email,
        };
            return {safeUser};
        } 
        catch (error) {
            throw new InternalServerErrorException('Failed to fetch user');
        }
    }
}
