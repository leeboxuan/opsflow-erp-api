import { PrismaClient, Role, MembershipStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Get Supabase user email from environment or prompt
  const supabaseUserEmail = process.env.SUPABASE_USER_EMAIL;

  if (!supabaseUserEmail) {
    console.error('❌ SUPABASE_USER_EMAIL environment variable is required');
    console.log('\nPlease set SUPABASE_USER_EMAIL to the email of the logged-in Supabase user.');
    console.log('Example: SUPABASE_USER_EMAIL=user@example.com pnpm db:seed\n');
    process.exit(1);
  }

  console.log(`📧 Using Supabase user email: ${supabaseUserEmail}\n`);

  // Create or get tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-logistics' },
    update: {},
    create: {
      name: 'Demo Logistics',
      slug: 'demo-logistics',
    },
  });

  console.log(`✅ Tenant: ${tenant.name} (${tenant.slug})`);

  // Create or get user
  const user = await prisma.user.upsert({
    where: { email: supabaseUserEmail },
    update: {},
    create: {
      email: supabaseUserEmail,
      name: null,
    },
  });

  console.log(`✅ User: ${user.email}`);

  // Create or get membership
  const membership = await prisma.tenantMembership.upsert({
    where: {
      tenantId_userId: {
        tenantId: tenant.id,
        userId: user.id,
      },
    },
    update: {
      role: Role.Admin,
      status: MembershipStatus.Active,
    },
    create: {
      tenantId: tenant.id,
      userId: user.id,
      role: Role.Admin,
      status: MembershipStatus.Active,
    },
  });

  console.log(`✅ Membership: ${user.email} → ${tenant.name} (${membership.role})\n`);

  console.log('🎉 Seed completed successfully!\n');
  console.log('You can now use:');
  console.log(`  - Tenant ID: ${tenant.id}`);
  console.log(`  - Tenant Slug: ${tenant.slug}`);
  console.log(`  - User Email: ${user.email}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
