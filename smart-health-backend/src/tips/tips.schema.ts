//tips.schema.ts
import { Schema, model, Document } from 'mongoose';

export interface TipLevel {
    tip1: string;
    tip2: string;
    tip3: string;
    tip4: string;
    tip5: string;
}
export interface TipDocument extends Document {
    category: string;
    tips: {
        [level: string]: TipLevel;
    };
}

const TipLevelSchema = new Schema<TipLevel>({   
                            tip1: String,
                            tip2: String,
                            tip3: String,
                            tip4: String,
                            tip5: String,
                        }, { _id: false });

export const TipSchema = new Schema<TipDocument>({
                        category: { 
                            type: String, 
                            required: true, 
                            unique: true 
                        },
                        tips: {
                            type: Map,
                            of: TipLevelSchema
                        }
                    });

export const TipModel = model<TipDocument>('Tip', TipSchema);
