//users.service.ts
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>
    ) {}

    async findByEmailRaw(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findByEmailLean(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).lean().exec();
    }

    async create(data: Partial<User>): Promise<UserDocument> {
        const createdUser  = new this.userModel(data);
        return createdUser.save();
    }

    async findByIdRaw(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }

    async findById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).lean();
    }
    
    async updateUser(id: string, data: Partial<User>) {
        return this.userModel.findByIdAndUpdate(id, data, { new: true }).select('-password').exec();
    }

    async updatePassword(id: string, newHashedPassword: string): Promise<void> {
        await this.userModel.updateOne({ _id: id }, { password: newHashedPassword });
    }

    async deleteById(id: string): Promise<void> {
        await this.userModel.findByIdAndDelete(id);
    }
}
