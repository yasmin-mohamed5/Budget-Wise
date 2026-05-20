import mongoose from 'mongoose';
import Category from '../backEnd/src/models/Category';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../backEnd/src/.env') });

const cleanup = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not found');
        
        await mongoose.connect(uri);
        await Category.deleteMany({}); 
        console.log('Cleaned up all categories for manual start.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

cleanup();
