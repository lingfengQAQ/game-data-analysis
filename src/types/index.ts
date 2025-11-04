// 玩家职业类型定义
export type PlayerClass =
  | '素问' | '神相' | '铁衣' | '血河'
  | '云瑶' | '鸿音' | '九灵' | '龙吟'
  | '沧澜' | '碎梦' | '荒羽' | '玄机'
  | '潮光' | '其他';

// 玩家数据模型
export interface Player {
  id: string;                    // 唯一标识
  name: string;                  // 角色名
  combatPower: number;           // 战力
  class: PlayerClass;            // 职业
  hall?: string;                 // 分堂（可选）
  position?: string;             // 职位（可选）
  level?: number;                // 等级（可选）
}

// 队伍模型
export interface Squad {
  id: number;                    // 队伍号 (1-5)
  players: (Player | null)[];    // 6个玩家位置
}

// 团模型
export interface Regiment {
  id: number;                    // 团号 (1-4)
  name: string;                  // 团名称
  squads: Squad[];               // 最多5个队伍
}

// 团队配置模型
export interface TeamConfiguration {
  id: string;                    // 配置ID
  name: string;                  // 配置名称
  createdAt: Date;               // 创建时间
  regiments: Regiment[];         // 4个团
}

// 位置信息
export interface Position {
  regimentId: number;
  squadId: number;
  position: number;
}

// 帮战记录模型
export interface BattleRecord {
  id: string;                    // 唯一标识
  guildName: string;             // 帮会名
  playerName: string;            // 玩家名
  level: number;                 // 等级
  class: PlayerClass;            // 职业
  regimentLeader: string;        // 所在团长

  // 战斗数据
  kills: number;                 // 击败
  assists: number;               // 助攻
  warResources: number;          // 战备资源
  playerDamage: number;          // 对玩家伤害
  buildingDamage: number;        // 对建筑伤害
  healing: number;               // 治疗值
  damageTaken: number;           // 承受伤害
  criticalInjuries: number;      // 重伤
  qingdengfengu: number;         // 青灯焚骨
  huayu: number;                 // 化羽
  control: number;               // 控制
}

// 战斗统计汇总
export interface BattleSummary {
  totalKills: number;
  totalAssists: number;
  totalDamage: number;
  totalHealing: number;
  avgKills: number;
  avgDamage: number;
  avgHealing: number;
}

// 团队战斗数据
export interface TeamBattleData {
  teamLeader: string;
  records: BattleRecord[];
  summary: BattleSummary;
}

// 帮会战斗数据
export interface GuildBattleData {
  guildName: string;
  teams: TeamBattleData[];       // 按团长分组
  records: BattleRecord[];       // 所有记录
  summary: BattleSummary;        // 统计汇总
}

// 排序配置
export interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
}

// 筛选配置
export interface FilterConfig {
  guildName?: string;
  class?: PlayerClass;
  teamLeader?: string;
  minKills?: number;
  minDamage?: number;
}

// 视图模式
export type ViewMode = 'guild' | 'guild-team';
