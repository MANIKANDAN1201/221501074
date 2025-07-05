const axios = require("axios");

const LOG_API_URL = "http://20.244.56.144/evaluation-service/logs";
const BEARER_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMjE1MDEwNzRAcmFqYWxha3NobWkuZWR1LmluIiwiZXhwIjoxNzUxNjkzMTU4LCJpYXQiOjE3NTE2OTIyNTgsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiIxMjU3MzJjNy01ZDZkLTQyMzAtOGY5Ni1lMzIyYWFmNjhiZGQiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJtYW5pa2FuZGFuIGsiLCJzdWIiOiJkZTExYzNiZC1hZGUyLTQwYTItYTRjNy00NjFmMjMyOWY1M2EifSwiZW1haWwiOiIyMjE1MDEwNzRAcmFqYWxha3NobWkuZWR1LmluIiwibmFtZSI6Im1hbmlrYW5kYW4gayIsInJvbGxObyI6IjIyMTUwMTA3NCIsImFjY2Vzc0NvZGUiOiJjV3lhWFciLCJjbGllbnRJRCI6ImRlMTFjM2JkLWFkZTItNDBhMi1hNGM3LTQ2MWYyMzI5ZjUzYSIsImNsaWVudFNlY3JldCI6Inh6VWVmaGJlZVpEYmhZc2gifQ.wQJMelwdh5eRUHgGo8pGAUavjqQciBbrQxX46ErjN4E";

async function Log(stack, level, pkg, message) {
  try {
    await axios.post(
      LOG_API_URL,
      {
        stack,
        level,
        package: pkg,
        message,
      },
      {
        headers: {
          Authorization: BEARER_TOKEN,
        },
      }
    );
  } catch (err) {
  }
}

function logger(req, res, next) {
  Log(
    "backend",
    "info",
    "route",
    `Incoming ${req.method} request to ${req.originalUrl}`
  );
  next();
}

module.exports = logger;
module.exports.Log = Log;
