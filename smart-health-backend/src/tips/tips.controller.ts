//tips.controller.ts
import { Controller, Get, Query, UseGuards, Post, Body, 
    BadRequestException, NotFoundException } from '@nestjs/common';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { TipsService } from './tips.service';

@Controller('tips')
@UseGuards(SessionAuthGuard)
export class TipsController {
    constructor(private readonly tipsService: TipsService) {}

    @Get()
    async getTips(@Query('category') category: string, 
                    @Query('level') level: string) {
        if (!category || !level) {
            throw new BadRequestException('Missing category or level');
        }

        const tips  = await this.tipsService.getTipsByCategory(category, level);

        if (!tips ) {
            throw new NotFoundException(`No tips found for category "${category}" and level "${level}".`);
        }
        return tips ;
    }

    @Post('suggested')
    getSuggestedTips(@Body() metrics: Record<string, any>) {
        return this.tipsService.getSuggestedTips(metrics);
    }
}
