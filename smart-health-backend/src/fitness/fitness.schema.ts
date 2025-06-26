//fitness.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type Fitness = FitnessPlan & Document;

@Schema()
export class FitnessPlan {
    @Prop({ required: true }) 
        condition: string; //diabetes, heart, stroke
    @Prop({ required: true }) 
        risk: string; //high, medium, low
    @Prop({ type: [{
                    day: String,
                    workout: String,
                    description: String,
                    duration: Number,
                }]})
        days: {
            day: string;
            workout: string;
            description: string;
            duration: number;
        }[];
}

export const FitnessSchema = SchemaFactory.createForClass(FitnessPlan);
