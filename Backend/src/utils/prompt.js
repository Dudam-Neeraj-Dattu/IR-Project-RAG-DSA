const createSearchPrompt = (retrievedDocs, query) => {
   const context = retrievedDocs
      .map((doc, index) =>
         `
    Source ${index + 1} (Problem: ${doc.problemName}, Difficulty: ${doc.problemDifficulty
         }):
    ${doc.problemDescription}
    Tags: ${doc.problemTags.join(', ')}
  `
      )
      .join('\n\n');

   const prompt = `
    You are an expert DSA tutor. A user has a question, and I have found some relevant documents from a database of DSA problems. Your task is to answer the user's question based *only* on the provided sources.

    - Do not use any external knowledge.
    - If the sources do not contain the answer, say "I'm sorry, but I couldn't find a relevant answer in the provided documents."
    - Be concise and helpful.
    - Cite your sources at the end of your answer, like [Source 1] or [Source 1, 3].

    ---
    USER'S QUESTION:
    ${query}
    ---
    RELEVANT SOURCES:
    ${context}
    ---
    
    ANSWER:
  `;

   return prompt;
}

export { createSearchPrompt };