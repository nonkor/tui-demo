import { test } from '@playwright/test';

export async function skipWithWarning(
    shouldSkip: boolean,
    reason: string
): Promise<void> {
    if (!shouldSkip) return;

    const formattedReason = `[WARN][SKIP] ${reason}`;
    console.warn(formattedReason);

    test.info().annotations.push({
        type: 'warning',
        description: reason
    });

    await test.info().attach('skip-reason', {
        body: formattedReason,
        contentType: 'text/plain'
    });

    test.skip(true, reason);
}
