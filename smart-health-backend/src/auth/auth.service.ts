//auth.service.ts
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface SafeUser {
    _id: string;
    name: string;
    email: string;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
    ) {}

    async register(dto: RegisterDto): Promise<{ user: SafeUser; message: string }> {
        const existing = await this.usersService.findByEmailLean(dto.email);
        if (existing) {
            throw new BadRequestException('Email already exists');
        }

        const hash = await bcrypt.hash(dto.password, 10);
        const userDoc  = await this.usersService.create({ 
                                                            name: dto.name,
                                                            email: dto.email, 
                                                            password: hash 
                                                        });
        const user = {
                        _id: String(userDoc._id),
                        name: userDoc.name,
                        email: userDoc.email
                    };
        return {
            user: JSON.parse(JSON.stringify(user)),
            message: 'User registered successfully'
        };
    }

    async login(dto: LoginDto): Promise<SafeUser> {
        const user = await this.usersService.findByEmailLean(dto.email);
        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return sanitizeUser(user);
    }
  
    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmailLean(email);
        if (user && await bcrypt.compare(pass, user.password)) {
            return sanitizeUser(user);
        }
        return null;
    }
}

function sanitizeUser(user: any):SafeUser  {
    return {
        _id: String(user._id),
        name: user.name,
        email: user.email,
    };
}