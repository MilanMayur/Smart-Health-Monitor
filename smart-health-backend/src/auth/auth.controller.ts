//auth.controller.ts
import { Controller, Post, Body, Get, 
        Res, Req, UseGuards, BadRequestException, 
        UnauthorizedException, Delete  } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MetricsService } from '../metrics/metrics.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { SessionAuthGuard } from '../auth/session-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, 
                private readonly usersService: UsersService,
                private readonly metricsService: MetricsService) {}

    @Post('register')
    async register(@Body() dto: RegisterDto, @Req() req: Request, 
                    @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.register(dto);
        const safeUser = sanitizeUser(result.user);
        req.session.user = safeUser;
        return res.json({ 
            message: 'Registration successful', 
            user: JSON.parse(JSON.stringify(safeUser)) 
        });
    }
 
    @Post('login')
    @UseGuards(AuthGuard('local'))
    async login(@Body() dto: LoginDto, 
                @Req() req: Request & { user?: any }, 
                @Res({ passthrough: true }) res: Response) {
        const user = await this.authService.login(dto);
        const safeUser = sanitizeUser(user); 
        req.session.user = safeUser;
        return { 
            message: 'Login successful', 
            user: JSON.parse(JSON.stringify(safeUser)) 
        };
    }

    @Get('logout')
    @UseGuards(SessionAuthGuard)
    logout(@Req() req: Request, @Res() res: Response) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                return res.status(500).json({ message: 'Logout failed' });
            }
            res.clearCookie('connect.sid'); 
            return res.json({ message: 'Logged out' });
        });
    }

    @Get('profile')
    @UseGuards(SessionAuthGuard)
    async getProfile(@Req() req: Request) {
        const user = req.session?.user;
        if (!user ) {
            throw new UnauthorizedException('User not logged in');
        }
        return user;
    }

    @Get('check')
    check(@Req() req: Request, @Res() res: Response) {
        const sessionUser = req.session?.user;
        if (sessionUser) {
            const safeUser = sanitizeUser(sessionUser);
            return res.json({ 
                authenticated: true, 
                user: JSON.parse(JSON.stringify(safeUser)) 
            });
        } 
        else {
            return res.status(401).json({ authenticated: false });
        }
    }

    @Post('change-password')
    @UseGuards(SessionAuthGuard)
    async changePassword( @Req() req: Request, @Body() body: ChangePasswordDto) {
        const userId = req.session?.user?._id;
        if (!userId) {
            throw new BadRequestException('User ID not found in session');
        }
        const user = await this.usersService.findById(userId);
        if (!user || !(await bcrypt.compare(body.currentPassword, user.password))) {
            throw new BadRequestException('Current password is incorrect');
        }
        const newHashedPassword= await bcrypt.hash(body.newPassword, 10);
        await this.usersService.updatePassword(userId, newHashedPassword);

        return { message: 'Password updated successfully' };
    }

    @Delete('delete-account')
    @UseGuards(SessionAuthGuard)
    async deleteAccount(@Req() req: Request, @Res() res: Response) {
        try {
            const userId = req.session?.user?._id;
            if (!userId) {
                console.error('User ID missing from session');
                throw new UnauthorizedException('User not authenticated');
            }
            const user = await this.usersService.findById(userId);
            if (!user) {
                console.error('User not found in DB');
                throw new BadRequestException('User not found');
            }
            await this.metricsService.deleteByUserId(userId);
            await this.usersService.deleteById(userId);
            req.session.destroy(() => null);
            res.clearCookie('connect.sid');
            return res.json({ message: 'Account deleted successfully' });
        } 
        catch (error) {
            console.error('Delete account error:', error);
            return res.status(500).json({ 
                message: 'Failed to delete account', 
                error: error.message 
            });
        }
    }
}

function sanitizeUser(user: any) {
    return {
        _id: String(user._id),
        name: user.name,
        email: user.email,
    };
}