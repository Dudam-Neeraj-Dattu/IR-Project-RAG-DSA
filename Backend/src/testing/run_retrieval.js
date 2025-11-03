import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from '../db/index.js';
import { Problem } from '../models/problem.model.js';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

// --- Setup ---
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Constants ---
const EVAL_LIMIT_K = 10;

// --- Main Evaluation Function ---
const runEvaluation = async () => {
   try {
      // 1. Connect to DB
      await connectDB();
      console.log('MongoDB connected for evaluation.');

      // 2. Init Embedding Model
      const embeddings = new GoogleGenerativeAIEmbeddings({
         model: 'gemini-embedding-001',
         apiKey: process.env.GEMINI_API_KEY,
      });

      // 3. Load Golden Set
      const goldenSetPath = path.resolve(
         __dirname,
         '../data/goldenSet.json'
      );
      const goldenSet = JSON.parse(fs.readFileSync(goldenSetPath, 'utf-8'));
      console.log(`Loaded ${goldenSet.length} queries from Golden Set.`);

      const allRetrievalResults = [];

      // 4. Loop through each query in the Golden Set
      for (let i = 0; i < goldenSet.length; i++) {
         const item = goldenSet[i];
         const { query, relevantDocs: groundTruth } = item;

         console.log(`Processing (${i + 1}/${goldenSet.length}): "${query}"`);

         // 5. Generate embedding for the query
         const queryVector = await embeddings.embedQuery(query);

         // 6. Define the $vectorSearch pipeline for evaluation
         const pipeline = [
            {
               $vectorSearch: {
                  index: 'vector_index',
                  path: 'problemEmbedding',
                  queryVector: queryVector,
                  numCandidates: 222, // Check all documents
                  limit: EVAL_LIMIT_K, // Use our evaluation K
               },
            },
            {
               $project: {
                  // Project only what we need for calculation
                  _id: 0,
                  serialNumber: 1,
                  problemName: 1,
                  score: { $meta: 'vectorSearchScore' },
               },
            },
         ];

         // 7. Run the retrieval
         const retrievedDocs = await Problem.aggregate(pipeline);

         // 8. Store the results for this query
         allRetrievalResults.push({
            query: query,
            groundTruth: groundTruth, // The "correct" answers
            retrieved: retrievedDocs, // The system's "retrieved" answers
         });
      }

      // 9. Save all results to a new JSON file
      const outputDir = __dirname;
      if (!fs.existsSync(outputDir)) {
         fs.mkdirSync(outputDir, { recursive: true });
      }
      const outputPath = path.resolve(
         outputDir,
         'retrieval_results.json'
      );

      fs.writeFileSync(
         outputPath,
         JSON.stringify(allRetrievalResults, null, 2)
      );

      console.log(`\nSuccessfully ran ${goldenSet.length} queries.`);
      console.log(`Retrieval results saved to: ${outputPath}`);
      process.exit(0);

   } catch (error) {
      console.error(`An error occurred during evaluation: ${error.message}`);
      process.exit(1);
   }
};

// --- Run the Script ---
runEvaluation();