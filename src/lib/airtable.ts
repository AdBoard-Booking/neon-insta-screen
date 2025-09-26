import Airtable, { FieldSet } from 'airtable';

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY!,
}).base(process.env.AIRTABLE_BASE_ID!);

export interface Submission {
  id: string;
  name: string;
  instagramHandle?: string;
  whatsappContact?: string; // For web form WhatsApp contact
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  source: 'whatsapp' | 'web';
  createdAt: string;
  approvedAt?: string;
  framedImageUrl?: string;
  phoneNumber?: string; // For WhatsApp submissions
}

export const submissionsTable = base(process.env.AIRTABLE_TABLE_NAME!);
const auditLogTableName = process.env.AIRTABLE_AUDIT_TABLE_NAME;
const auditLogTable = auditLogTableName ? base(auditLogTableName) : null;
const usersTableName = process.env.AIRTABLE_USERS_TABLE_NAME;
const usersTable = usersTableName ? base(usersTableName) : null;

interface AuditLogPayload {
  action: string;
  actorEmail?: string;
  actorName?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  result?: string;
}

export async function createSubmission(data: Omit<Submission, 'id' | 'createdAt'>) {
  const fields: FieldSet = {
    Name: data.name,
    'Instagram Handle': data.instagramHandle || '',
    'WhatsApp Contact': data.whatsappContact || '',
    'Image URL': data.imageUrl,
    Status: data.status,
    Source: data.source,
    // 'Phone Number': data.phoneNumber || '',
    'Framed Image URL': data.framedImageUrl || '',
  };

  // Only include 'Approved At' if it's provided and not empty
  if (data.approvedAt) {
    fields['Approved At'] = data.approvedAt;
  }

  const record = await submissionsTable.create([
    {
      fields,
    },
  ]);

  return {
    id: record[0].id,
    ...data,
    createdAt: new Date().toISOString(),
  };
}

export async function updateSubmissionStatus(id: string, status: 'approved' | 'rejected', framedImageUrl?: string) {
  const updateData: FieldSet = {
    Status: status,
  };

  if (status === 'approved') {
    updateData['Approved At'] = new Date().toISOString();
    if (framedImageUrl) {
      updateData['Framed Image URL'] = framedImageUrl;
    }
  } else if (status === 'rejected') {
    // Clear the Approved At field by setting it to null
    // This will remove any existing approval date
    updateData['Approved At'] = '';
  }

  const record = await submissionsTable.update([
    {
      id,
      fields: updateData,
    },
  ]);

  return record[0];
}

export async function getAllSubmissions(limit: number = 100) {
  const records = await submissionsTable.select({
    sort: [{ field: 'Created At', direction: 'desc' }],
    maxRecords: limit,
  }).all();

  return records.map(record => ({
    id: record.id,
    name: record.get('Name') as string,
    instagramHandle: record.get('Instagram Handle') as string,
    whatsappContact: record.get('WhatsApp Contact') as string,
    imageUrl: record.get('Image URL') as string,
    status: record.get('Status') as 'pending' | 'approved' | 'rejected',
    source: record.get('Source') as 'whatsapp' | 'web',
    createdAt: record.get('Created At') as string,
    approvedAt: record.get('Approved At') as string,
    framedImageUrl: record.get('Framed Image URL') as string,
    phoneNumber: record.get('Phone Number') as string,
  }));
}

export async function getApprovedSubmissions(limit: number = 50) {
  const records = await submissionsTable.select({
    filterByFormula: "{Status} = 'approved'",
    sort: [{ field: 'Approved At', direction: 'desc' }],
    maxRecords: limit,
  }).all();

  return records.map(record => ({
    id: record.id,
    name: record.get('Name') as string,
    instagramHandle: record.get('Instagram Handle') as string,
    whatsappContact: record.get('WhatsApp Contact') as string,
    imageUrl: record.get('Image URL') as string,
    status: record.get('Status') as 'approved',
    source: record.get('Source') as 'whatsapp' | 'web',
    createdAt: record.get('Created At') as string,
    approvedAt: record.get('Approved At') as string,
    framedImageUrl: record.get('Framed Image URL') as string,
    phoneNumber: record.get('Phone Number') as string,
  }));
}

export async function deleteSubmission(id: string) {
  const record = await submissionsTable.destroy(id);
  return record;
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

export async function logAdminAction(payload: AuditLogPayload) {
  if (!auditLogTable) {
    return;
  }

  try {
    const fields: FieldSet = {
      Action: payload.action,
      // Timestamp: new Date().toISOString(),
    };

    if (payload.actorEmail) {
      fields['Actor Email'] = payload.actorEmail;
    }

    if (payload.actorName) {
      fields['Actor Name'] = payload.actorName;
    }

    if (payload.targetId) {
      fields['Target ID'] = payload.targetId;
    }

    if (payload.result) {
      fields.Result = payload.result;
    }

    if (payload.details && Object.keys(payload.details).length > 0) {
      fields.Details = JSON.stringify(payload.details);
    }

    await auditLogTable.create([
      {
        fields,
      },
    ]);
  } catch (error) {
    console.error('Failed to write admin audit log', error);
  }
}

export interface AuthorizedUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  isActive: boolean;
}

export async function isUserAuthorized(email: string): Promise<boolean> {
  if (!usersTable) {
    // Fallback to environment variable if no users table is configured
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    return adminEmails.includes(email);
  }

  try {
    const records = await usersTable.select({
      filterByFormula: `AND({Email} = '${email}', {Is Active} = TRUE())`,
    }).all();

    return records.length > 0;
  } catch (error) {
    console.error('Failed to check user authorization in Airtable', error);
    // Fallback to environment variable on error
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    return adminEmails.includes(email);
  }
}

export async function getAuthorizedUser(email: string): Promise<AuthorizedUser | null> {
  if (!usersTable) {
    // Fallback to environment variable if no users table is configured
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    if (adminEmails.includes(email)) {
      return {
        id: email,
        email,
        name: email.split('@')[0],
        role: 'admin',
        isActive: true,
      };
    }
    return null;
  }

  try {
    const records = await usersTable.select({
      filterByFormula: `AND({Email} = '${email}', {Is Active} = TRUE())`,
    }).all();

    if (records.length === 0) {
      return null;
    }

    const record = records[0];
    return {
      id: record.id,
      email: record.get('Email') as string,
      name: record.get('Name') as string,
      role: record.get('Role') as string,
      isActive: record.get('Is Active') as boolean,
    };
  } catch (error) {
    console.error('Failed to get authorized user from Airtable', error);
    return null;
  }
}
