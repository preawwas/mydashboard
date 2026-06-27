import { test, expect } from '@playwright/test';

test.describe('Vocabulary speech (Chrome)', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            (window as unknown as { __speechCalls: Array<{ text: string; lang: string }> }).__speechCalls =
                [];
            const synth = window.speechSynthesis;
            const originalSpeak = synth.speak.bind(synth);
            synth.speak = (utterance: SpeechSynthesisUtterance) => {
                (window as unknown as { __speechCalls: Array<{ text: string; lang: string }> }).__speechCalls.push(
                    {
                        text: utterance.text,
                        lang: utterance.lang,
                    }
                );
                return originalSpeak(utterance);
            };
        });
    });

    test('should queue speech when clicking the speaker button', async ({ page }) => {
        await page.goto('/vocabulary/review');
        await page.waitForLoadState('networkidle');

        await expect(page.getByRole('heading', { name: 'Vocabulary Review' })).toBeVisible({
            timeout: 15000,
        });

        const speakerButtons = page
            .getByRole('button', { name: /ฟังเสียงคำว่า/i })
            .filter({ has: page.locator('svg') });
        await expect(speakerButtons.first()).toBeVisible({ timeout: 15000 });

        const label = (await speakerButtons.first().getAttribute('aria-label')) || '';
        const wordMatch = label.match(/ฟังเสียงคำว่า\s+(.+)/);
        const expectedWord = wordMatch?.[1]?.trim();

        await speakerButtons.first().click();

        await expect
            .poll(
                async () => {
                    return page.evaluate(() => {
                        const calls = (
                            window as unknown as {
                                __speechCalls?: Array<{ text: string; lang: string }>;
                            }
                        ).__speechCalls;
                        const synth = window.speechSynthesis;
                        return {
                            callCount: calls?.length ?? 0,
                            lastText: calls?.at(-1)?.text ?? '',
                            speaking: synth.speaking,
                            pending: synth.pending,
                        };
                    });
                },
                {
                    timeout: 5000,
                    message: 'speechSynthesis.speak should be called after clicking the speaker button',
                }
            )
            .toMatchObject({
                callCount: expect.any(Number),
            });

        const speechState = await page.evaluate(() => {
            const calls = (
                window as unknown as { __speechCalls?: Array<{ text: string; lang: string }> }
            ).__speechCalls;
            const synth = window.speechSynthesis;
            return {
                calls: calls ?? [],
                speaking: synth.speaking,
                pending: synth.pending,
            };
        });

        expect(speechState.calls.length).toBeGreaterThan(0);

        const spokeExpectedWord = expectedWord
            ? speechState.calls.some((call) => call.text.includes(expectedWord))
            : speechState.calls.some((call) => call.text.trim().length > 0);

        expect(spokeExpectedWord).toBeTruthy();
        expect(speechState.speaking || speechState.pending || speechState.calls.length > 0).toBeTruthy();
    });

    test('should queue speech when clicking the vocabulary word', async ({ page }) => {
        await page.goto('/vocabulary/review');
        await page.waitForLoadState('networkidle');

        const wordButton = page
            .getByRole('button', { name: /ฟังเสียงคำว่า prioritize/i })
            .filter({ hasNot: page.locator('svg') })
            .first();

        await wordButton.scrollIntoViewIfNeeded();
        await wordButton.click();

        const calls = await page.evaluate(() => {
            return (
                window as unknown as { __speechCalls?: Array<{ text: string; lang: string }> }
            ).__speechCalls;
        });

        expect(calls?.length ?? 0).toBeGreaterThan(0);
        expect(calls?.some((call) => call.text.includes('prioritize'))).toBeTruthy();
    });

    test('should expose speech synthesis API in Chrome', async ({ page }) => {
        await page.goto('/vocabulary/review');

        const supported = await page.evaluate(() => {
            return typeof window !== 'undefined' && 'speechSynthesis' in window;
        });

        expect(supported).toBe(true);
    });
});
