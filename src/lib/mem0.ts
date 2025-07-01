import { createMem0 } from "@mem0/vercel-ai-provider";

// Create Mem0 instance with global configuration
// Note: user_id should be passed dynamically when calling retrieveMemories/addMemories
// using the Clerk userId from getAuth(req).userId
const mem0 = createMem0({
  provider: "openai",
  mem0ApiKey: process.env.MEM0_API_KEY,
  apiKey: process.env.OPENAI_API_KEY,
  config: {
    compatibility: "strict",
  },
  // Optional Mem0 Global Config
  mem0Config: {
    org_id: process.env.MEM0_ORG_ID,
    project_id: process.env.MEM0_PROJECT_ID,
  },
});

