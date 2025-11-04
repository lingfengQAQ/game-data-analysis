import { Player, BattleRecord } from '../types';

// 验证玩家数据
export function validatePlayer(player: any): player is Player {
  return (
    typeof player.name === 'string' &&
    player.name.length > 0 &&
    typeof player.combatPower === 'number' &&
    player.combatPower >= 0 &&
    typeof player.class === 'string'
  );
}

// 验证帮战记录
export function validateBattleRecord(record: any): record is BattleRecord {
  return (
    typeof record.guildName === 'string' &&
    typeof record.playerName === 'string' &&
    typeof record.level === 'number' &&
    typeof record.class === 'string' &&
    typeof record.regimentLeader === 'string' &&
    typeof record.kills === 'number' &&
    typeof record.assists === 'number'
  );
}
