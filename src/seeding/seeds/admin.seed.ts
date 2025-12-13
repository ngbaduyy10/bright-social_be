import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { AdminEntity } from '@/entities/admin.entity';
import { AdminRole } from '@/utils/constant';

export default class AdminSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    const adminFactory = factoryManager.get(AdminEntity);
    const adminRepository = dataSource.getRepository(AdminEntity);
    
    // Create 12 regular admins
    const admins: AdminEntity[] = [];
    for (let i = 0; i < 12; i++) {
      const admin = await adminFactory.make();
      admin.role = AdminRole.ADMIN;
      admins.push(admin);
    }
    
    // Create 3 super admins
    const superAdmins: AdminEntity[] = [];
    for (let i = 0; i < 3; i++) {
      const superAdmin = await adminFactory.make();
      superAdmin.role = AdminRole.SUPER_ADMIN;
      superAdmins.push(superAdmin);
    }
    
    await adminRepository.save([...admins, ...superAdmins]);
    
    console.log('✅ 12 admins and 3 super admins created successfully!');
  }
}

