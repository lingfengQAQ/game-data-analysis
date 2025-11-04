import { BattleRecord, GuildBattleData, TeamBattleData, BattleSummary } from '../types';

// 按帮会分组
export function groupByGuild(records: BattleRecord[]): GuildBattleData[] {
  const grouped = records.reduce((acc, record) => {
    if (!acc[record.guildName]) {
      acc[record.guildName] = [];
    }
    acc[record.guildName].push(record);
    return acc;
  }, {} as Record<string, BattleRecord[]>);

  return Object.entries(grouped).map(([guildName, records]) => ({
    guildName,
    teams: groupByTeam(records),
    records,
    summary: calculateSummary(records)
  }));
}

// 按团队分组
export function groupByTeam(records: BattleRecord[]): TeamBattleData[] {
  const grouped = records.reduce((acc, record) => {
    if (!acc[record.regimentLeader]) {
      acc[record.regimentLeader] = [];
    }
    acc[record.regimentLeader].push(record);
    return acc;
  }, {} as Record<string, BattleRecord[]>);

  return Object.entries(grouped).map(([teamLeader, records]) => ({
    teamLeader,
    records,
    summary: calculateSummary(records)
  }));
}

// 计算统计汇总
export function calculateSummary(records: BattleRecord[]): BattleSummary {
  if (records.length === 0) {
    return {
      totalKills: 0,
      totalAssists: 0,
      totalDamage: 0,
      totalHealing: 0,
      avgKills: 0,
      avgDamage: 0,
      avgHealing: 0
    };
  }

  const totalKills = records.reduce((sum, r) => sum + r.kills, 0);
  const totalAssists = records.reduce((sum, r) => sum + r.assists, 0);
  const totalDamage = records.reduce((sum, r) => sum + r.playerDamage + r.buildingDamage, 0);
  const totalHealing = records.reduce((sum, r) => sum + r.healing, 0);

  return {
    totalKills,
    totalAssists,
    totalDamage,
    totalHealing,
    avgKills: totalKills / records.length,
    avgDamage: totalDamage / records.length,
    avgHealing: totalHealing / records.length
  };
}

// 生成唯一 ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
