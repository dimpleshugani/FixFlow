const serverless = require("serverless-http");
const { app, connectDatabase } = require("../../server");

const expressHandler = serverless(app, {
  basePath: "/.netlify/functions/api",
});

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    await connectDatabase();
    return await expressHandler(event, context);
  } catch (error) {
    console.error("Netlify API error:", error.message);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "The API is temporarily unavailable." }),
    };
  }
};