//metrics.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MetricDocument = Metric & Document;

@Schema({ timestamps: true })
export class Metric extends Document {
    @Prop({ required: true }) userId: string;

    @Prop() age: number;
    @Prop() sex: number;
    @Prop() bloodPressure: number;
    @Prop() insulin: number;
    @Prop() bmi: number;
    @Prop() glucose: number;
    @Prop() serumCholestoral: number;
    @Prop() skinThickness: number;
    @Prop() diabetesPedigreeFunction: number;
    @Prop() pregnancies: number;

    @Prop() smokingStatus: string;
    @Prop() workType: string;
    @Prop() residenceType: string;
    @Prop() hypertension: number;
    @Prop() heartDisease: number;
    @Prop() chestPainType: number;
    @Prop() restingECG: number;
    @Prop() maxHeartRate: number;
    @Prop() exerciseInducedAngina: number;
    @Prop() oldpeak: number;
    @Prop() stSegment: number;
    @Prop() majorVessels: number;
    @Prop() thalassemia: number;

    // Predictions
    @Prop() diabetesPrediction: string;
    @Prop() diabetesProbability: number;
    @Prop() diabetesRiskCategory: string;

    @Prop() heartPrediction: string;
    @Prop() heartProbability: number;
    @Prop() heartRiskCategory: string;

    @Prop() strokePrediction: string;
    @Prop() strokeProbability: number;
    @Prop() strokeRiskCategory: string;

    @Prop() updatedAt: string;
}

export const MetricSchema = SchemaFactory.createForClass(Metric);
