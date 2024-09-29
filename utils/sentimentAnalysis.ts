const TransformersApi = Function('return import("@xenova/transformers")')();
const { pipeline } = await TransformersApi;

let sentimentPipeline: any = null;

export async function initializeSentimentPipeline() {
  sentimentPipeline = await pipeline(
    'sentiment-analysis',
    'Xenova/bert-base-multilingual-uncased-sentiment'
  );
}

export async function analyzeSentiment(text: string): Promise<string> {
  if (!sentimentPipeline) {
    throw new Error('Sentiment pipeline not initialized.');
  }

  const output = await sentimentPipeline(text);

  const result = output[0];
  const label = result.label;
  const score = result.score; 

  let sentiment;
  if (label === '1 star' || label === '2 stars') {
    sentiment = 'NEGATIVE';
  } else if (label === '3 stars') {
    sentiment = 'NEUTRAL';
  } else if (label === '4 stars' || label === '5 stars') {
    sentiment = 'POSITIVE';
  } else {
    sentiment = 'NEUTRAL';
  }

  return sentiment;
}
