// Demo data for testing the application
// Run this script to populate Airtable with sample data

const sampleSubmissions = [
  {
    name: "Sarah Johnson",
    instagramHandle: "sarahj_photography",
    imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    status: "approved",
    source: "web",
    phoneNumber: "+1234567890",
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    approvedAt: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
  },
  {
    name: "Mike Chen",
    instagramHandle: "mikechen_tech",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    status: "approved",
    source: "whatsapp",
    phoneNumber: "+1987654321",
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    approvedAt: new Date(Date.now() - 6000000).toISOString(), // 1.5 hours ago
  },
  {
    name: "Emma Wilson",
    instagramHandle: "emma_wilson_art",
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    status: "pending",
    source: "web",
    createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
  },
  {
    name: "Alex Rodriguez",
    instagramHandle: "alex_rodriguez_fitness",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    status: "approved",
    source: "whatsapp",
    phoneNumber: "+1555123456",
    createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    approvedAt: new Date(Date.now() - 9000000).toISOString(), // 2.5 hours ago
  },
  {
    name: "Lisa Park",
    instagramHandle: "lisa_park_design",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    status: "rejected",
    source: "web",
    createdAt: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
  }
];

console.log("Sample submissions data:");
console.log(JSON.stringify(sampleSubmissions, null, 2));

console.log("\nTo use this data:");
console.log("1. Set up your Airtable base with the required fields");
console.log("2. Add your Airtable credentials to .env.local");
console.log("3. Use the Airtable API to insert these records");
console.log("4. Or manually add them through the Airtable interface for testing");

module.exports = sampleSubmissions;