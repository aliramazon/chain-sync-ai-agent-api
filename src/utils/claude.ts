import Anthropic from '@anthropic-ai/sdk';

interface ClaudeOptions {
    model?: string;
    maxTokens?: number;
    temperature?: number;
}

export class Claude {
    private static client: Anthropic;

    private static getClient(): Anthropic {
        if (!this.client) {
            this.client = new Anthropic({
                apiKey: process.env.ANTHROPIC_API_KEY!,
            });
        }
        return this.client;
    }

    static async ask(
        prompt: string,
        options: ClaudeOptions = {},
    ): Promise<any> {
        const {
            model = 'claude-3-5-sonnet-20241022',
            maxTokens = 4000,
            temperature = 0.1,
        } = options;

        try {
            const response = await this.getClient().messages.create({
                model,
                max_tokens: maxTokens,
                temperature,
                messages: [{ role: 'user', content: prompt }],
            });

            const content = response.content[0];
            if (content.type !== 'text') {
                throw new Error('Invalid response type');
            }

            // Extract and parse JSON
            const jsonMatch = content.text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            if (error instanceof Anthropic.APIError) {
                throw new Error(`Claude API failed: ${error.message}`);
            }
            throw error;
        }
    }
}
