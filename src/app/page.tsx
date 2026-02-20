export default async function Home() {
  const data = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/dashboard`, {
    cache: 'no-store'
  }).then(r => r.json()).catch(() => ({ error: 'Loading...' }))

  if (data.error) {
    return (
      <div style={{ padding: '40px', fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>AutomateBoss Dashboard</h1>
        <p>Loading data...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f9fafb' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>🎪 AutomateBoss Dashboard</h1>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>{data.date}</p>

      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>💰 Revenue</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Active Subscribers</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{data.revenue?.active_count || 0}</p>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>MRR</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold' }}>${(data.revenue?.mrr || 0).toLocaleString()}</p>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>ARR</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold' }}>${(data.revenue?.arr || 0).toLocaleString()}</p>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Churn Rate (30d)</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: data.revenue?.churn_rate > 5 ? '#ef4444' : '#10b981' }}>
              {data.revenue?.churn_rate?.toFixed(1) || 0}%
            </p>
          </div>
        </div>
      </div>

      {data.churn_risks && data.churn_risks.length > 0 && (
        <div style={{ backgroundColor: '#fee2e2', padding: '24px', borderRadius: '8px', marginBottom: '24px', border: '2px solid #ef4444' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#991b1b' }}>🚨 CHURN RISKS - Immediate Action</h2>
          {data.churn_risks.map((item: any, i: number) => (
            <div key={i} style={{ marginBottom: '12px', padding: '12px', backgroundColor: 'white', borderRadius: '4px' }}>
              <p style={{ fontWeight: 'bold' }}>{item.name}</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Keywords: {item.churn_flags?.join(', ')}</p>
              <p style={{ fontSize: '14px', marginTop: '4px' }}>{item.body}</p>
            </div>
          ))}
        </div>
      )}

      {data.high_priority && data.high_priority.length > 0 && (
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>⚠️ High Priority</h2>
          {data.high_priority.map((item: any, i: number) => (
            <div key={i} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: i < data.high_priority.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
              <p style={{ fontWeight: 'bold' }}>{item.name}</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>{item.unread_count} unread • {item.type}</p>
              <p style={{ fontSize: '14px', marginTop: '4px' }}>{item.body}</p>
            </div>
          ))}
        </div>
      )}

      {data.normal && data.normal.length > 0 && (
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>📬 Other Unread ({data.normal.length})</h2>
          {data.normal.map((item: any, i: number) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <p style={{ fontSize: '14px' }}><strong>{item.name}:</strong> {item.body?.substring(0, 80)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
