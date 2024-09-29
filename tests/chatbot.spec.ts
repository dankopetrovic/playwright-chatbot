import { test, expect } from '@playwright/test';
import { ChatbotPage } from '../pages/chatbot.po';
import { initializeSentimentPipeline, analyzeSentiment } from '../utils/sentimentAnalysis.js';

let chatbotPage: ChatbotPage;
const conversatonStarters = [
    { 
        conversationStarter: 'How do AeroFlow Electric heaters work?', 
        expectedBotMessage: 'AeroFlow electric heaters' 
    },
    { 
        conversationStarter: 'How to reduce CO2 emissions from heating?', 
        expectedBotMessage: 'CO2 emissions'
    },
    { 
        conversationStarter: 'What energy consumption can be expected?', 
        expectedBotMessage: 'energy consumption'
    },
    { 
        conversationStarter: 'How eco-friendly are electric heaters?', 
        expectedBotMessage: 'eco-friendly'
    }
]

const productRecommendations = [
    { 
        title: "40 square meters",
        productQuery: 'We want to heat a room of 40 square meters. Can you recommend what size radiator to do this please? We want to have them on feet so we can move them.', 
        expectedBotMessages: ['AeroFlow MAXI', 'stand with wheels'] 
    },
    { 
        title: "additional device",
        productQuery: 'Do I need additional device for app control of radiators?', 
        expectedBotMessages: ['FlexiSmart Pro', 'Smartheat4U'] 
    },
    {
        title: "holiday home",
        productQuery: 'Which radiators would you suggest for heating a holiday home of 100 m2?',
        expectedBotMessages: ['MAXI', 'MIDI']
    }
]

test.beforeAll(async () => {
    await initializeSentimentPipeline();
});

test.beforeEach(async ({page}) => {
    chatbotPage = new ChatbotPage(page);
    await page.goto('/')

    await chatbotPage.clickStartChattingButton();
});

test.describe('Chatbot tests', () => {
    test('Verify Greeting Section', async () => {        
        await chatbotPage.verifyGreetingSection();
    });

    test('Verify the conversation starters are displayed', async () => {
        for (const starter of conversatonStarters) {
            await chatbotPage.verifyConversationStartersDisplayed(starter.conversationStarter);
        }
    });

    conversatonStarters.forEach(({ conversationStarter, expectedBotMessage }) => {
        test(`Verify ${conversationStarter} starts the conversation`, async () => {
            await chatbotPage.clickConversationStarter(conversationStarter);
            await chatbotPage.verifyConversationStarted(expectedBotMessage);
        });
    });

    productRecommendations.forEach(({ title, productQuery, expectedBotMessages}) => {
        test(`Verify product recommendation - ${title}`, async () => {
            const responsePromise = chatbotPage.getChatResponse();
            await chatbotPage.askQuestion(productQuery);
            const response = await responsePromise;
            const responseJson = await response.json()
            const messageContent = responseJson['message']['content']
            const sentiment = await analyzeSentiment(messageContent || '');
            console.log(messageContent)
            console.log('Sentiment:', sentiment);

            expect(sentiment).toBe('POSITIVE');
            for (const expectedBotMessage of expectedBotMessages) {
                expect.soft(messageContent).toContain(expectedBotMessage);
            }
        });
    })
});