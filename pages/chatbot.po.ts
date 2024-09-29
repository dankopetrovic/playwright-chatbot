import { expect } from '@playwright/test';
import { Page } from 'playwright';

export class ChatbotPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get startChattingButton() {
    return this.page.getByRole('button', { name: 'Start Chatting' });
  }

  async clickStartChattingButton() {
    const responsePromise = this.page.waitForResponse('**/api/chat-history/chat-sessions?appNameId=EcoHeating24Chat-13801')
    await this.startChattingButton.click();
    await responsePromise;
  }

  get chatMessageBotContainer() {
    return this.page.getByTestId('chat-message-bot');
  }

  get chatMessageBotImage() {
    return this.chatMessageBotContainer.getByRole('img').first();
  }

  get chatMessageBotText() {
    return this.chatMessageBotContainer.getByText('EcoHeating24 Chat');
  }

  get chatMessageBotGreeting() {
    return this.chatMessageBotContainer.getByText('Hi there! How can I help you today?');
  }

  async verifyGreetingSection() {
    await this.chatMessageBotContainer.waitFor();
    const imageUrl = await this.chatMessageBotImage.getAttribute('src');
    expect(imageUrl).toContain('https://storage.googleapis.com/chipp-images/application-logos/ee6c09b6-d8c5-4b4f-bba6-74e1b4ec5489');
    const text = await this.chatMessageBotText.textContent();
    expect(text).toBe('EcoHeating24 Chat');
    const greeting = await this.chatMessageBotGreeting.textContent();
    expect(greeting).toBe('Hi there! How can I help you today?');
  }

  async verifyConversationStartersDisplayed(conversationStarter: string) {
    await expect(this.page.getByRole('button', { name: conversationStarter })).toBeVisible();
  }

  async clickConversationStarter(buttonText: string) {
    await this.page.getByRole('button', { name: `${buttonText}` }).click();
  }

  async verifyConversationStarted(expectedBotMessage: string) {
    const botMessageLocator = this.page.getByTestId('chat-message-bot').nth(1);
    const responsePromise = this.page.waitForResponse('**/api/chat-history/message?chatSessionId=**');
    await responsePromise;
    await botMessageLocator.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(3000)
    await expect(botMessageLocator).toContainText(expectedBotMessage);
  }

  async askQuestion(question: string) {
    await this.page.getByPlaceholder('Type here to chat').fill(question);
    await this.page.keyboard.press("Enter");
  }

  getChatResponse() {
    const responsePromise = this.page.waitForResponse(async (response) => {
      if (response.url().includes('/api/chat-history/message?chatSessionId=') && response.status() === 200) {
        const request = response.request();
        
        const postData = request.postData();
        if (postData) {
          const jsonData = JSON.parse(postData);
          
          return jsonData.senderType === "BOT";
        }
      }
      
      return false;
    });

    return responsePromise;
  }
}