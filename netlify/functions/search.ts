import { Handler } from "@netlify/functions";

const handler: Handler = async (event) => {
  const query = event.queryStringParameters?.query;

  if (!query) {
    return { statusCode: 400, body: "검색어가 없습니다." };
  }

  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=10`,
      {
        headers: {
          "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID || "",
          "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET || "",
        },
      }
    );

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: "Search failed" }) };
  }
};

export { handler };