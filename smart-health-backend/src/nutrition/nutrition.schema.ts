//nutrition.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type Diet  = DietPlan & Document;

@Schema()
export class DietPlan  {
    @Prop({ required: true }) 
        day: string; 
    @Prop({ required: true }) 
        meal: string[]; //Breakfast, Lunch, Dinner
    @Prop({ required: true, enum: ['high_bmi', 'normal_bmi', 'low_bmi'] }) 
        bmiCategory: 'high_bmi' | 'normal_bmi' | 'low_bmi';   
}

export const NutritionSchema = SchemaFactory.createForClass(DietPlan);