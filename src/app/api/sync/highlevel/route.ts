import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getConversations, getContacts, TEAM_MEMBER_IDS } from '@/lib/highlevel';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('🔄 Syncing HighLevel data...');
    
    // Fetch conversations
    const conversations = await getConversations();
    console.log(`📬 Found ${conversations.length} conversations`);
    
    // Fetch contacts
    const contacts = await getContacts();
    console.log(`👥 Found ${contacts.length} contacts`);
    
    // Create a contact lookup map
    const contactMap = new Map(contacts.map(c => [c.id, c]));
    
    // Process conversations
    let syncedConversations = 0;
    let teamStats = new Map<string, { messages: number; conversations: number }>();
    
    for (const conv of conversations) {
      const contact = contactMap.get(conv.contactId);
      
      // Determine priority based on unread count and keywords
      let priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';
      const body = conv.lastMessageBody?.toLowerCase() || '';
      
      if (conv.unreadCount > 5 || body.includes('urgent') || body.includes('asap')) {
        priority = 'urgent';
      } else if (conv.unreadCount > 2 || body.includes('help') || body.includes('issue')) {
        priority = 'high';
      } else if (conv.unreadCount === 0) {
        priority = 'low';
      }
      
      // Upsert conversation
      const { error } = await supabaseAdmin
        .from('support_conversations')
        .upsert({
          hl_conversation_id: conv.id,
          contact_id: conv.contactId,
          contact_name: contact ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim() : null,
          company_name: contact?.companyName || null,
          last_message_date: conv.lastMessageDate,
          last_message_body: conv.lastMessageBody,
          last_message_direction: conv.lastMessageDirection,
          unread_count: conv.unreadCount,
          assigned_to: conv.assignedTo || null,
          priority,
          status: conv.unreadCount > 0 ? 'open' : 'resolved',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'hl_conversation_id'
        });
      
      if (!error) {
        syncedConversations++;
        
        // Track team stats
        if (conv.assignedTo && TEAM_MEMBER_IDS[conv.assignedTo]) {
          const stats = teamStats.get(conv.assignedTo) || { messages: 0, conversations: 0 };
          stats.conversations++;
          teamStats.set(conv.assignedTo, stats);
        }
      }
    }
    
    // Update team performance for today
    const today = new Date().toISOString().split('T')[0];
    for (const [memberId, stats] of teamStats) {
      await supabaseAdmin
        .from('team_performance')
        .upsert({
          date: today,
          team_member: TEAM_MEMBER_IDS[memberId],
          team_member_id: memberId,
          conversations_handled: stats.conversations,
          messages_sent: stats.messages
        }, {
          onConflict: 'date,team_member_id'
        });
    }
    
    // Update sync status
    await supabaseAdmin
      .from('sync_status')
      .upsert({
        source: 'highlevel',
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'success',
        records_synced: syncedConversations
      }, {
        onConflict: 'source'
      });
    
    console.log(`✅ Synced ${syncedConversations} conversations`);
    
    return NextResponse.json({
      success: true,
      synced: syncedConversations,
      teamMembers: teamStats.size
    });
  } catch (error: any) {
    console.error('❌ HighLevel sync error:', error);
    
    // Log error to sync_status
    await supabaseAdmin
      .from('sync_status')
      .upsert({
        source: 'highlevel',
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'error',
        last_error: error.message
      }, {
        onConflict: 'source'
      });
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
