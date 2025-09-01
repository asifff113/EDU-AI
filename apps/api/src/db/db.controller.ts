import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('db')
export class DbController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  async health() {
    const rows: Array<{ ok: number }> =
      await this.prisma.$queryRawUnsafe('SELECT 1 as ok');
    return { ok: true, db: rows[0]?.ok === 1 };
  }
}
