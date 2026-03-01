// HighLevel API Client
const HL_BASE_URL = 'https://services.leadconnectorhq.com';
const HL_VERSION = '2021-07-28';

const HL_AGENCY_KEY = process.env.HL_AGENCY_KEY!;
const HL_LOCATION_TOKEN = process.env.HL_LOCATION_TOKEN!;
const HL_LOCATION_ID = process.env.HL_MAIN_LOCATION_ID!;

export interface HLConversation {
  id: string;
  contactId: string;
  locationId: string;
  lastMessageDate: string;
  lastMessageBody: string;
  lastMessageDirection: 'inbound' | 'outbound';
  unreadCount: number;
  assignedTo?: string;
}

export interface HLContact {
  id: string;
  locationId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
}

export interface HLLocation {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  companyId: string;
}

async function hlFetch(endpoint: string, useAgencyKey = false) {
  const apiKey = useAgencyKey ? HL_AGENCY_KEY : HL_LOCATION_TOKEN;
  
  const response = await fetch(`${HL_BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Version': HL_VERSION,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HighLevel API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getConversations(locationId?: string): Promise<HLConversation[]> {
  const locId = locationId || HL_LOCATION_ID;
  const data = await hlFetch(`/conversations/search?locationId=${locId}&limit=100`);
  return data.conversations || [];
}

export async function getConversationMessages(conversationId: string) {
  const data = await hlFetch(`/conversations/${conversationId}/messages`);
  return data.messages || [];
}

export async function getContacts(locationId?: string): Promise<HLContact[]> {
  const locId = locationId || HL_LOCATION_ID;
  const data = await hlFetch(`/contacts/?locationId=${locId}&limit=100`);
  return data.contacts || [];
}

export async function getAllLocations(): Promise<HLLocation[]> {
  // Use agency key to get all locations
  const data = await hlFetch(`/locations/search?companyId=bUnrR3qyq5dibuKkx2cE`, true);
  return data.locations || [];
}

// Team member IDs from spec
export const TEAM_MEMBERS = {
  'Amanda Gilmer': 'Crte5xZvcrQ6ORk41ozV',
  'Sofia Quilo': 'Ebqs5zYLzm2oGIU15qSK',
  'Saul Vinez': 'Olt1fHbfj0nbQzbqmiIz',
  'Mohsin Haider': 'JK7tcTRWvnXXAs5glrAH',
  'Arnel Morgado': 'XVluS6vkXVbJh3YqTu0J',
  'Ashley Travis': 'ef3LRE61NEs3XupiT62U'
};

export const TEAM_MEMBER_IDS = Object.entries(TEAM_MEMBERS).reduce((acc, [name, id]) => {
  acc[id] = name;
  return acc;
}, {} as Record<string, string>);
