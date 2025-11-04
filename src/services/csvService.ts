import Papa from 'papaparse';
import { Player, BattleRecord, PlayerClass } from '../types';
import { generateId } from '../utils/dataUtils';
import { validatePlayer, validateBattleRecord } from '../utils/validationUtils';

// 解析个人信息 CSV
export async function parsePersonalInfoCSV(file: File): Promise<Player[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      encoding: 'UTF-8',
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const players: Player[] = results.data
            .map((row: any) => ({
              id: generateId(),
              name: row['名称'] || row['name'] || '',
              combatPower: parseInt(row['总战力'] || row['combatPower'] || '0'),
              class: (row['职业'] || row['class'] || '其他') as PlayerClass,
              hall: row['分堂'] || row['hall'],
              position: row['职位'] || row['position'],
              level: parseInt(row['等级'] || row['level'] || '0')
            }))
            .filter(validatePlayer);

          if (players.length === 0) {
            reject(new Error('CSV 文件为空或格式不正确'));
          } else {
            resolve(players);
          }
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error)
    });
  });
}

// 解析帮战数据 CSV
export async function parseBattleDataCSV(file: File): Promise<BattleRecord[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      encoding: 'UTF-8',
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const records: BattleRecord[] = results.data
            .map((row: any) => ({
              id: generateId(),
              guildName: row['帮会名'] || row['guildName'] || '',
              playerName: row['玩家'] || row['playerName'] || '',
              level: parseInt(row['等级'] || row['level'] || '0'),
              class: (row['职业'] || row['class'] || '其他') as PlayerClass,
              regimentLeader: row['所在团长'] || row['regimentLeader'] || '',
              kills: parseInt(row['击败'] || row['kills'] || '0'),
              assists: parseInt(row['助攻'] || row['assists'] || '0'),
              warResources: parseInt(row['战备资源'] || row['warResources'] || '0'),
              playerDamage: parseInt(row['对玩家伤害'] || row['playerDamage'] || '0'),
              buildingDamage: parseInt(row['对建筑伤害'] || row['buildingDamage'] || '0'),
              healing: parseInt(row['治疗值'] || row['healing'] || '0'),
              damageTaken: parseInt(row['承受伤害'] || row['damageTaken'] || '0'),
              criticalInjuries: parseInt(row['重伤'] || row['criticalInjuries'] || '0'),
              qingdengfengu: parseInt(row['青灯焚骨'] || row['qingdengfengu'] || '0'),
              huayu: parseInt(row['化羽'] || row['huayu'] || '0'),
              control: parseInt(row['控制'] || row['control'] || '0')
            }))
            .filter(validateBattleRecord);

          if (records.length === 0) {
            reject(new Error('CSV 文件为空或格式不正确'));
          } else {
            resolve(records);
          }
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error)
    });
  });
}
