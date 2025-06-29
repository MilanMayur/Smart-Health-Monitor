//metrics.controller.ts
import { Controller, Get, Post, Body, Param, Put, Req, Res, 
            UseGuards, NotFoundException, UnauthorizedException, 
            InternalServerErrorException } from '@nestjs/common';
import { Request, Response } from 'express';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { MetricsService } from './metrics.service';
import fetch from 'node-fetch';

@Controller('metric') 
@UseGuards(SessionAuthGuard)
export class MetricsController {
    private flaskUrls: Record<string, string> = {
        diabetes: 'http://<ec2-ip>:5000/predict-diabetes', 
        heart: 'http://<ec2-ip>:5000/predict-heart',
        stroke: 'http://<ec2-ip>:5000/predict-stroke',
    };

    constructor(private readonly metricsService: MetricsService) {}

    @Post('predict/:type')
    async predict(@Param('type') type: string, @Body() body: any, 
                    @Req() req: Request, @Res() res: Response) {
        try {
            const user = req.session?.user;
            
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized - no session' });
            }

            if (!(type in this.flaskUrls)) {
                throw new NotFoundException('Invalid prediction type');
            }

            const flaskRes = await fetch(this.flaskUrls[type], {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(body),
            });

            const text = await flaskRes.text(); 

            if (!flaskRes.ok) {
                throw new InternalServerErrorException(`Flask server error: ${flaskRes.status}`);
            }

            const data = JSON.parse(text);
            
            const predictionFields = {
                                        [`${type}Prediction`]: data.prediction,
                                        [`${type}Probability`]: data.probability,
                                        [`${type}RiskCategory`]: data.riskCategory,
                                    };

            await this.metricsService.saveUnifiedMetric(user._id, body, predictionFields);

            return data;
        } 
        catch (error) {
            console.error(`${type} prediction error:`, error);
            throw new InternalServerErrorException(`Failed to get ${type} prediction`);
        }
    }

    @Get('recent')
    async getRecentMetrics(@Req() req: Request) {
        const userId = req.session?.user?._id;

        if (!userId) {
            throw new UnauthorizedException('User not logged in');
        }

        const metrics = await this.metricsService.getRecentMetrics(userId);

        return metrics;
    }

    @Put('update')
    async updateMetrics(@Req() req: Request, @Body() body: any) {
        const userId = req.session?.user?._id;

        if (!userId) throw new UnauthorizedException('User not authenticated');

        const updated = await this.metricsService.updateUserMetrics(userId, body);

        if (!updated) {
            throw new NotFoundException('Failed to update metrics.');
        }

        return { message: 'Metrics updated successfully', data: updated };
    }
}
