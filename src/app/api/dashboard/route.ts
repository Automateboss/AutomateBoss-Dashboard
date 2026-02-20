import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const scriptPath = '/Users/joyllc/.openclaw/workspace/scripts/daily_dashboard.py'
    const { stdout } = await execAsync(`python3 ${scriptPath}`)
    
    // Parse the output to extract data
    const lines = stdout.split('\n')
    let revenue: any = {}
    let churn_risks: any[] = []
    let high_priority: any[] = []
    let normal: any[] = []
    let date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    
    let section = ''
    for (let line of lines) {
      if (line.includes('Revenue')) section = 'revenue'
      else if (line.includes('CHURN RISK')) section = 'churn'
      else if (line.includes('High Priority') || line.includes('⚠️')) section = 'high'
      else if (line.includes('Normal')) section = 'normal'
      
      // Extract revenue numbers
      if (line.includes('Active Subscribers:')) {
        revenue.active_count = parseInt(line.match(/\d+/)?.[0] || '0')
      } else if (line.includes('MRR:')) {
        revenue.mrr = parseInt(line.match(/[\d,]+/)?.[0]?.replace(/,/g, '') || '0')
      } else if (line.includes('ARR:')) {
        revenue.arr = parseInt(line.match(/[\d,]+/)?.[0]?.replace(/,/g, '') || '0')
      } else if (line.includes('Churn Rate')) {
        revenue.churn_rate = parseFloat(line.match(/[\d.]+/)?.[0] || '0')
      }
      
      // Extract conversations (simplified)
      if (section === 'churn' && line.includes('**') && line.includes('—')) {
        const name = line.match(/\*\*(.+?)\*\*/)?.[1]
        const body = line.split('—')[1]?.trim()
        if (name && body) {
          churn_risks.push({ name, body, churn_flags: ['detected'] })
        }
      }
    }
    
    return NextResponse.json({
      date,
      revenue,
      churn_risks,
      high_priority,
      normal
    })
  } catch (error: any) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
