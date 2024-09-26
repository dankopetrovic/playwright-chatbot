import { test, expect } from '@playwright/test';
import { ChatbotPage } from '../pages/chatbot.po';

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
        expectedBotMessage: 'eco-friendly.'
    }
]

const productRecommendations = [
    { 
        productQuery: 'We want to heat a room of 40 square meters. Can you recommend what size radiator to do this please? We want to have them on feet so we can move them.', 
        expectedBotMessage: ['AeroFlow MAXI', 'stand with wheels'] 
    },
    { 
        productQuery: 'Do I need additional device for app control of radiators?', 
        expectedBotMessage: ['FlexiSmart Pro controller', 'Smartheat4U'] 
    },
    {
        productQuery: 'Which radiators would you suggest for heating a holiday home of 100 m2?',
        expectedBotMessage: ['multiple radiators']
    }
]

test.beforeEach(async ({page}) => {
    chatbotPage = new ChatbotPage(page);
    await page.goto('/')

    await chatbotPage.clickStartChattingButton();
})

test.describe('Functional chatbot tests', () => {
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

    test("Verify product recommendations from chat", async () => {
        for (const productRecommendation of productRecommendations)
        {
            const question = productRecommendation.productQuery
            const expectedResponses = productRecommendation.expectedBotMessage
            const responsePromise = chatbotPage.getChatResponse();
            await chatbotPage.askQuestion(question);
            const response = await responsePromise;
            const responseJson = await response.json()
            for (const expectedResponse of expectedResponses) {
                expect.soft(responseJson['message']['content']).toContain(expectedResponse);
            }
        }
    });
});