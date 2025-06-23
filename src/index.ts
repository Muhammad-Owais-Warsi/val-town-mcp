import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as dotenv from "dotenv"
dotenv.config();

const server = new McpServer({
  name: "val-town-mcp",
  version: "1.0.0",
  capabilities: {
    tools: {}
  }
})

const GetUserData = async () => {
  const data = await fetch("https://api.val.town/v1/me", {
    headers: {
      "Authorization":`Bearer ${process.env.KEY}`
    }
  })
  
  return await data.json();
}

const CreateVal = async ({name, description, privacy}:{name: string | undefined, description:string | undefined, privacy: string | undefined}) => {
  const data = await fetch('https://api.val.town/v2/vals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "Authorization":`Bearer ${process.env.KEY}`
    },
    body: JSON.stringify({
      name:  name || 'myVal',
      description: description || 'My val',
      privacy: privacy || 'private'
    })
  })
  
  return await data.json();
}


server.tool(
  "get-user-data",
  "Gets the data for a user",
  {
    random_string: z.string().optional().describe("Dummy parameter for no-parameter tools")
  },
  async () => {
    const data = await GetUserData();

    if (!data) {
      return {
        content: [
          { type: "text", text: "Error: Failed to get user information" }
        ],
      };
    }

    return {
      content: [
        { type: "text", text: data.username || "No username available" },
        { type: "text", text: data.bio || "No bio available" },
        { type: "text", text: data.url || "No profile URL available" }
      ],
    };
  }
);

server.tool(
  "create-val",
  "creates a new val for the user",
  {
    name: z.string().optional().describe("name of the val"),
    description: z.string().optional().describe("description of the val"),
    privacy: z.string().optional().describe("states wether the val is private or public")
  },
  async({name, description, privacy}) => {
    const data = await CreateVal({name, description, privacy});
    
    if (!data) {
      return {
        content: [
          { type: "text", text: "Error: Failed to get user information" }
        ],
      };
    }
    
    return {
      content: [
        { type: "text", text: data.name || "No name available" },
        { type: "text", text: data.author.username || "No author available" },
        { type: "text", text: data.links.html || "No profile URL available" }
      ],
    };
    
  }
)

export async function main() {
  
  const transport = new StdioServerTransport();
  await server.connect(transport)
  
}

main().catch(console.error);

