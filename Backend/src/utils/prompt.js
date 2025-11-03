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
    You are an expert DSA tutor. A user has a question. Use the following relevant documents to provide a comprehensive, accurate, and helpful answer.

    INSTRUCTIONS:
    - Your tone should be that of a helpful expert.
    - Synthesize the information from the sources to form a single, high-quality answer.
    - **Format your entire answer in GitHub-flavored Markdown.** (Use bullet points, bold text, etc., for readability).
    - **DO NOT** use phrases like "Based on the provided documents..." or "The sources say...". Present the information directly as your own explanation.
    - You **MUST** cite the relevant sources by appending [Source 1], [Source 2, 5], etc., to the end of the sentences or paragraphs they support.

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