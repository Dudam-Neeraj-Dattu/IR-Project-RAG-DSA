import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const searchProblems = asyncHandler(async (req, res) => {
   const { query } = req.body;

   if(!query || query.trim() === '') {
      throw new ApiError(400, 'Search query cannot be empty');
   }

   console.log(`Received search query: ${query}`);
   
   return res.status(200).json(new ApiResponse(200, { results: [] }, 'Search completed successfully'));
});

export { searchProblems };