import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema(
   {
      serialNumber: {
         type: Number,
         required: [true, 'Serial number is required'],
         unique: true, // Ensures no duplicate problems
         index: true, // Adds an index for faster lookups
      },
      problemName: {
         type: String,
         required: [true, 'Problem name is required'],
         trim: true,
      },
      problemDescription: {
         type: String,
         required: [true, 'Problem description is required'],
         trim: true,
      },
      problemTags: {
         type: [String], // Defines an array of strings
         default: [],
      },
      problemDifficulty: {
         type: String,
         required: [true, 'Difficulty is required'],
         enum: ['easy', 'medium', 'hard'], // Ensures only these values are allowed
      },
      problemEmbedding: {
         type: [Number], // Array of numbers for the embedding vector
         default: [],
      },
   },
   {
      timestamps: true, // Automatically adds createdAt and updatedAt fields
   }
);

export const Problem = mongoose.model('Problem', problemSchema);