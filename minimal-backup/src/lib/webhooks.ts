export interface WebhookPayload {
    event: string
    projectId: string
    organizationId?: string
    fromStatus?: string
    toStatus: string
    timestamp: string
}

export async function fireProjectMoveWebhook(payload: WebhookPayload) {
    const webhookUrls = [
        process.env.PROJECT_MOVE_WEBHOOK_URL,
        // Add other webhook URLs from HighLevel config if needed
    ].filter(Boolean) as string[]

    if (webhookUrls.length === 0) {
        console.log('No webhooks configured for project movement.')
        return
    }

    console.log(`Firing project move webhooks for project ${payload.projectId}...`)

    const results = await Promise.allSettled(
        webhookUrls.map(url =>
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.WEBHOOK_SECRET}`
                },
                body: JSON.stringify(payload)
            })
        )
    )

    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            if (result.value.ok) {
                console.log(`Webhook ${index + 1} fired successfully to ${webhookUrls[index]}`)
            } else {
                console.error(`Webhook ${index + 1} failed with status ${result.value.status}`)
            }
        } else {
            console.error(`Webhook ${index + 1} error:`, result.reason)
        }
    })
}
