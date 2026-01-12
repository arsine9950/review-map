import axios from 'axios';

export const handler = async (event, context) => {
  // 1. 프론트엔드에서 보낸 검색어(query) 받기
  const { query } = event.queryStringParameters;

  if (!query) {
    return { statusCode: 400, body: "검색어가 없습니다." };
  }

  // 2. 네이버 서버로 요청 보내기 (내 키를 몰래 실어서)
  try {
    const response = await axios.get('https://openapi.naver.com/v1/search/local.json', {
      params: {
        query: query,
        display: 10, // 5개만 검색
        start: 1,
        sort: 'random'
      },
      headers: {
        'X-Naver-Client-Id': process.env.NAVER_SEARCH_ID,
        'X-Naver-Client-Secret': process.env.NAVER_SEARCH_SECRET
      }
    });

    // 3. 성공하면 프론트엔드에게 결과 전달
    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };

  } catch (error) {
    console.error("Naver API Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "네이버 API 호출 실패" })
    };
  }
};