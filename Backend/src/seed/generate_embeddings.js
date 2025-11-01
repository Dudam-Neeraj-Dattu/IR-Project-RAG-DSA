import dotenv from 'dotenv';
import path from 'path';
import connectDB from '../db/index.js';
import { Problem } from '../models/problem.model.js';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

// --- Setup ---
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// --- Main Function ---
const generateAndStoreEmbeddings = async () => {
   try {
      // 1. Connect to the database
      await connectDB();
      console.log('MongoDB connected successfully.');

      // 2. Instantiate the LangChain embedding model
      const embeddings = new GoogleGenerativeAIEmbeddings({
         model: 'gemini-embedding-001', // This is the recommended model for text embedding
         apiKey: process.env.GEMINI_API_KEY,
      });

      // 3. Fetch all problems from the database
      const problems = await Problem.find({});
      if (problems.length === 0) {
         console.log(
            'No problems found in the database. Please run the seeder first.'
         );
         process.exit(0);
      }
      console.log(`Found ${problems.length} problems to process.`);

      // 4. Loop through each problem, generate embedding, and save
      for (let i = 0; i < problems.length; i++) {
         const problem = problems[i];

         // Skip if embedding already exists to avoid re-processing
         if (
            problem.problemEmbedding &&
            problem.problemEmbedding.length > 0
         ) {
            console.log(
               `(${i + 1}/${problems.length}) Skipping problem #${problem.serialNumber
               } - Embedding already exists.`
            );
            continue;
         }

         console.log(
            `(${i + 1}/${problems.length}) Processing problem #${problem.serialNumber
            }: "${problem.problemName}"`
         );

         // Convert the tags array into a single space-separated string
         const tagsString = problem.problemTags.join(' ');

         // Create the new, richer text to be embedded
         const textToEmbed = `${problem.problemName} ${problem.problemDescription} ${tagsString} ${problem.problemDifficulty}`;

         console.log(`   -> Embedding text: "${textToEmbed.substring(0, 70)}..."`);

         // Generate the embedding vector
         const vector = await embeddings.embedQuery(textToEmbed);

         // Save the vector to the document
         problem.problemEmbedding = vector;
         await problem.save();

         console.log(`   -> Embedding generated and saved successfully.`);
      }

      console.log('\nAll embeddings have been generated and stored!');
      process.exit(0);
   } catch (error) {
      console.error(`An error occurred: ${error.message}`);
      console.error(error.stack);
      process.exit(1);
   }
};

// --- Run the Script ---
generateAndStoreEmbeddings();