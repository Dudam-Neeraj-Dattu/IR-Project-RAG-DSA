import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../db/index.js';
import { Problem } from '../models/problem.model.js';

// --- Setup ---
// Configure environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// --- Get Absolute Path for __dirname ---
// This is needed for ES modules to correctly locate files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Database Connection ---
const start = async () => {
   try {
      await connectDB();
      console.log('MongoDB connected successfully for seeder.');

      // --- Command Line Argument Handling ---
      if (process.argv[2] === '-i') {
         await importData();
      } else if (process.argv[2] === '-d') {
         await destroyData();
      } else {
         console.log(
            'Invalid argument. Use -i to import data or -d to destroy data.'
         );
         process.exit();
      }
   } catch (error) {
      console.error(`Seeder Error: ${error.message}`);
      process.exit(1);
   }
};

// --- Import Function ---
const importData = async () => {
   try {
      // 1. Clear existing problems
      await Problem.deleteMany();
      console.log('Existing data destroyed...');

      // 2. Read the JSON file
      // Note: We are in 'src/seed', so we go up two levels to 'backend/'
      const jsonPath = path.resolve(
         __dirname,
         '../data/problemData.json'
      );
      const data = fs.readFileSync(jsonPath, 'utf-8');
      const problems = JSON.parse(data);

      // 3. Insert into database
      await Problem.insertMany(problems);
      console.log('Data imported successfully!');
      process.exit();
   } catch (error) {
      console.error(`Error importing data: ${error.message}`);
      process.exit(1);
   }
};

// --- Destroy Function ---
const destroyData = async () => {
   try {
      await Problem.deleteMany();
      console.log('Data destroyed successfully!');
      process.exit();
   } catch (error) {
      console.error(`Error destroying data: ${error.message}`);
      process.exit(1);
   }
};

// --- Run the Seeder ---
start();