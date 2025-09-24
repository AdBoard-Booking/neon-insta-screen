import Airtable from 'airtable';

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY!,
}).base(process.env.AIRTABLE_BASE_ID!);

export interface Submission {
  id: string;
  name: string;
  instagramHandle?: string;
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  source: 'whatsapp' | 'web';
  createdAt: string;
  approvedAt?: string;
  framedImageUrl?: string;
  phoneNumber?: string; // For WhatsApp submissions
}

export const submissionsTable = base(process.env.AIRTABLE_TABLE_NAME!);

export async function createSubmission(data: Omit<Submission, 'id' | 'createdAt'>) {
  const record = await submissionsTable.create([
    {
      fields: {
        Name: data.name,
        'Instagram Handle': data.instagramHandle || '',
        'Image URL': data.imageUrl,
        Status: data.status,
        Source: data.source,
        'Phone Number': data.phoneNumber || '',
        'Framed Image URL': data.framedImageUrl || '',
        'Approved At': data.approvedAt || '',
      },
    },
  ]);

  return {
    id: record[0].id,
    ...data,
    createdAt: new Date().toISOString(),
  };
}

export async function updateSubmissionStatus(id: string, status: 'approved' | 'rejected', framedImageUrl?: string) {
  const updateData: any = {
    Status: status,
  };

  if (status === 'approved') {
    updateData['Approved At'] = new Date().toISOString();
    if (framedImageUrl) {
      updateData['Framed Image URL'] = framedImageUrl;
    }
  }

  const record = await submissionsTable.update([
    {
      id,
      fields: updateData,
    },
  ]);

  return record[0];
}

export async function getAllSubmissions() {
  const records = await submissionsTable.select({
    sort: [{ field: 'Created At', direction: 'desc' }],
  }).all();

  return records.map(record => ({
    id: record.id,
    name: record.get('Name') as string,
    instagramHandle: record.get('Instagram Handle') as string,
    imageUrl: record.get('Image URL') as string,
    status: record.get('Status') as 'pending' | 'approved' | 'rejected',
    source: record.get('Source') as 'whatsapp' | 'web',
    createdAt: record.get('Created At') as string,
    approvedAt: record.get('Approved At') as string,
    framedImageUrl: record.get('Framed Image URL') as string,
    phoneNumber: record.get('Phone Number') as string,
  }));
}

export async function getApprovedSubmissions() {
  const records = await submissionsTable.select({
    filterByFormula: "{Status} = 'approved'",
    sort: [{ field: 'Approved At', direction: 'desc' }],
  }).all();

  return records.map(record => ({
    id: record.id,
    name: record.get('Name') as string,
    instagramHandle: record.get('Instagram Handle') as string,
    imageUrl: record.get('Image URL') as string,
    status: record.get('Status') as 'approved',
    source: record.get('Source') as 'whatsapp' | 'web',
    createdAt: record.get('Created At') as string,
    approvedAt: record.get('Approved At') as string,
    framedImageUrl: record.get('Framed Image URL') as string,
    phoneNumber: record.get('Phone Number') as string,
  }));
}

export async function getSubmissionStats() {
  const records = await submissionsTable.select().all();
  
  const stats = {
    total: records.length,
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  records.forEach(record => {
    const status = record.get('Status') as string;
    if (status === 'pending') stats.pending++;
    else if (status === 'approved') stats.approved++;
    else if (status === 'rejected') stats.rejected++;
  });

  return stats;
}