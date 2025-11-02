import { Problem } from "../models/problem.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { createSearchPrompt } from "../utils/prompt.js";

const embeddings = new GoogleGenerativeAIEmbeddings({
   model: 'gemini-embedding-001',
   apiKey: process.env.GEMINI_API_KEY,
});

const chatModel = new ChatGoogleGenerativeAI({
   model: 'gemini-2.5-pro',
   apiKey: process.env.GEMINI_API_KEY,
});

const searchProblems = asyncHandler(async (req, res) => {
   const { query } = req.body;

   if (!query || query.trim() === '') {
      throw new ApiError(400, 'Search query cannot be empty');
   }

   console.log(`Received search query: ${query}`);

   const queryVector = await embeddings.embedQuery(query);
   console.log('Query vector generated.');

   const pipeline = [
      {
         $vectorSearch: {
            index: 'vector_index', // The name of the index you created in Atlas
            path: 'problemEmbedding', // The field in your documents that contains the vector
            queryVector: queryVector, // The vector to search for
            numCandidates: 222, // Number of candidates to consider (since we have 222 problems)
            limit: 5, // Return the top 5 most similar results
         },
      },
      {
         $project: {
            // Project only the fields we want to return
            _id: 0,
            serialNumber: 1,
            problemName: 1,
            problemDescription: 1,
            problemDifficulty: 1,
            problemTags: 1,
            score: { $meta: 'vectorSearchScore' }, // Include the similarity score
         },
      },
   ];

   const retrievedDocs = await Problem.aggregate(pipeline);
   console.log('Vector search completed.');

   if (!retrievedDocs || retrievedDocs.length === 0) {
      throw new ApiError(404, 'No relevant documents found for your query.');
   }

   console.log('Generating final answer with chat model...');
   const prompt = createSearchPrompt(retrievedDocs, query);
   const response = await chatModel.invoke(prompt);
   const finalAnswer = response.content;

   return res.status(200).json(
      new ApiResponse(
         200,
         {
            answer: finalAnswer,
            sources: retrievedDocs,
         },
         'Search and generation completed successfully'
      )
   );
});

export { searchProblems };