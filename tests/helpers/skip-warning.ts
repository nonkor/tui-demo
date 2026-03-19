import { test } from '@playwright/test';

export async function skipWithWarning(reason: string): Promise<boolean> {
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

    test.info().skip(true, reason);
    return true;
}
