import { NextRequest, NextResponse } from 'next/server'
import { handleHighLevelWebhook } from '@/app/actions/integrations'

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json()

        // Basic security: Check for a secret header (optional, but recommended)
        /*
        const authToken = req.headers.get('x-automateboss-webhook-secret')
        if (authToken !== process.env.HL_WEBHOOK_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        */

        const result = await handleHighLevelWebhook(payload)

        if (result.success) {
            return NextResponse.json({ message: 'Webhook processed successfully' })
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 })
        }
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
}
