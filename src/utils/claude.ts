import Anthropic, { APIError } from '@anthropic-ai/sdk';

export interface ClaudeOptions<T = unknown> {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    system?: string;
    signal?: AbortSignal;
}

export class Claude {
    private static client: Anthropic | null = null;

    private static getClient(): Anthropic {
        const key = process.env.ANTHROPIC_API_KEY;
        if (!key) throw new Error('ANTHROPIC_API_KEY is not set');
        if (!this.client) this.client = new Anthropic({ apiKey: key });
        return this.client;
    }

    static async ask<T = unknown>(
        prompt: string,
        options: ClaudeOptions<T> = {},
    ): Promise<T> {
        const {
            model = 'claude-sonnet-4-20250514',
            maxTokens = 4000,
            temperature = 0.1,
            system,
            signal,
        } = options;

        const client = this.getClient();

        const attempt = async (tryNo: number): Promise<T> => {
            try {
                const resp = await client.messages.create(
                    {
                        model,
                        max_tokens: maxTokens,
                        temperature,
                        system,
                        messages: [{ role: 'user', content: prompt }],
                    },
                    { signal },
                );

                const text = resp.content
                    .filter(
                        (b): b is Anthropic.Messages.TextBlock =>
                            b.type === 'text',
                    )
                    .map((b) => b.text)
                    .join('\n')
                    .trim();

                if (!text) throw new Error('No text content in response');

                try {
                    return JSON.parse(text) as T;
                } catch {}

                const m1 = text.match(/```json\s*([\s\S]*?)```/i);
                if (m1) return JSON.parse(m1[1]) as T;

                const m2 = text.match(/```([\s\S]*?)```/);
                if (m2) return JSON.parse(m2[1]) as T;

                const m3 = text.match(/\{[\s\S]*\}/);
                if (m3) return JSON.parse(m3[0]) as T;

                throw new Error('Failed to locate JSON in response text');
            } catch (err) {
                if (err instanceof APIError) {
                    const status = err.status ?? 0;
                    const transient =
                        status === 429 || (status >= 500 && status < 600);
                    if (transient && tryNo < 3) {
                        await new Promise((r) =>
                            setTimeout(r, 250 * 2 ** tryNo),
                        );
                        return attempt(tryNo + 1);
                    }
                    throw new Error(
                        `Claude API failed (${status}): ${err.message}`,
                    );
                }
                if ((err as any).name === 'AbortError') throw err;
                throw err;
            }
        };

        return attempt(0);
    }
}
