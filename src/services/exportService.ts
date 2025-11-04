import Papa from 'papaparse';
import html2canvas from 'html2canvas';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { TeamConfiguration, GuildBattleData } from '../types';
import { getClassColor } from '../utils/colorUtils';

// 下载文件（支持 UTF-8 BOM）
function downloadFile(content: string, filename: string, mimeType: string, addBOM: boolean = false): void {
  let blobContent: BlobPart[] = [content];
  
  // 添加 UTF-8 BOM 解决中文乱码
  if (addBOM) {
    const BOM = '\uFEFF';
    blobContent = [BOM + content];
  }
  
  const blob = new Blob(blobContent, { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 导出团队配置为 CSV（按团队结构）
export function exportTeamConfigToCSV(config: TeamConfiguration): void {
  const rows: any[] = [];

  // 格式化日期时间为简短格式
  const dateStr = new Date(config.createdAt).toLocaleDateString('zh-CN').replace(/\//g, '-');
  const timeStr = new Date(config.createdAt).toLocaleTimeString('zh-CN', { hour12: false });

  // 添加配置信息
  rows.push({
    '团队/位置': `配置: ${config.name}`,
    '队伍1': `时间: ${dateStr} ${timeStr}`,
    '队伍2': '',
    '队伍3': '',
    '队伍4': '',
    '队伍5': ''
  });
  rows.push({
    '团队/位置': '',
    '队伍1': '',
    '队伍2': '',
    '队伍3': '',
    '队伍4': '',
    '队伍5': ''
  }); // 空行

  config.regiments.forEach((regiment) => {
    // 团标题
    rows.push({
      '团队/位置': `【${regiment.name}】`,
      '队伍1': '',
      '队伍2': '',
      '队伍3': '',
      '队伍4': '',
      '队伍5': ''
    });

    // 6个位置的数据
    for (let pos = 0; pos < 6; pos++) {
      const row: any = { '团队/位置': `位置${pos + 1}` };
      
      regiment.squads.forEach((squad, squadIdx) => {
        const player = squad.players[pos];
        if (player) {
          row[`队伍${squadIdx + 1}`] = `${player.name} (${player.combatPower})`;
        } else {
          row[`队伍${squadIdx + 1}`] = '';
        }
      });
      
      rows.push(row);
    }

    // 团之间空行
    rows.push({
      '团队/位置': '',
      '队伍1': '',
      '队伍2': '',
      '队伍3': '',
      '队伍4': '',
      '队伍5': ''
    });
  });

  const csv = Papa.unparse(rows);
  downloadFile(csv, `团队配置_${config.name}_${Date.now()}.csv`, 'text/csv;charset=utf-8;', true);
}

// 导出帮战数据为 CSV
export function exportBattleDataToCSV(data: GuildBattleData[]): void {
  const rows: any[] = [];

  data.forEach(guild => {
    guild.records.forEach(record => {
      rows.push({
        '帮会名': record.guildName,
        '玩家': record.playerName,
        '等级': record.level,
        '职业': record.class,
        '所在团长': record.regimentLeader,
        '击败': record.kills,
        '助攻': record.assists,
        '战备资源': record.warResources,
        '对玩家伤害': record.playerDamage,
        '对建筑伤害': record.buildingDamage,
        '治疗值': record.healing,
        '承受伤害': record.damageTaken,
        '重伤': record.criticalInjuries,
        '青灯焚骨': record.qingdengfengu,
        '化羽': record.huayu,
        '控制': record.control
      });
    });
  });

  const csv = Papa.unparse(rows);
  downloadFile(csv, `帮战数据_${Date.now()}.csv`, 'text/csv;charset=utf-8;', true);
}

// 导出团队配置为图片
export async function exportTeamConfigToImage(elementId: string, filename: string): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('找不到要导出的元素');
    }

    // 直接截取组件，html2canvas 会自动处理完整内容
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // 提高清晰度
      logging: false,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false
    });

    // 转换为图片并下载
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  } catch (error) {
    console.error('导出图片失败:', error);
    throw error;
  }
}


// 导出帮战数据为带格式的 Excel
export async function exportBattleDataToExcel(data: GuildBattleData[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  
  data.forEach(guild => {
    // 按团队分组，每个团队一个工作表
    guild.teams.forEach(team => {
      // 工作表名称：帮会名-团长名
      const sheetName = `${guild.guildName}-${team.teamLeader}`.substring(0, 31); // Excel 限制 31 字符
      const worksheet = workbook.addWorksheet(sheetName);
      
      // 定义列
      worksheet.columns = [
        { header: '玩家', key: 'playerName', width: 15 },
        { header: '等级', key: 'level', width: 8 },
        { header: '职业', key: 'class', width: 12 },
        { header: '击败', key: 'kills', width: 10 },
        { header: '助攻', key: 'assists', width: 10 },
        { header: '战备资源', key: 'warResources', width: 12 },
        { header: '总伤害', key: 'totalDamage', width: 15 },
        { header: '对玩家伤害', key: 'playerDamage', width: 15 },
        { header: '对建筑伤害', key: 'buildingDamage', width: 15 },
        { header: '治疗值', key: 'healing', width: 12 },
        { header: '承受伤害', key: 'damageTaken', width: 12 },
        { header: '重伤', key: 'criticalInjuries', width: 10 },
        { header: '青灯焚骨', key: 'qingdengfengu', width: 12 },
        { header: '化羽', key: 'huayu', width: 10 },
        { header: '控制', key: 'control', width: 10 },
      ];
      
      // 设置表头样式
      worksheet.getRow(1).font = { bold: true, size: 11 };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' }
      };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
      
      // 对数据排序：素问按治疗量降序，铁衣按控制降序，其他按总伤害降序
      const sortedRecords = [...team.records].sort((a, b) => {
        // 素问职业按治疗量降序
        if (a.class === '素问' && b.class === '素问') {
          return b.healing - a.healing;
        }
        if (a.class === '素问') return -1;
        if (b.class === '素问') return 1;
        
        // 铁衣职业按控制降序
        if (a.class === '铁衣' && b.class === '铁衣') {
          return b.control - a.control;
        }
        if (a.class === '铁衣') return -1;
        if (b.class === '铁衣') return 1;
        
        // 其他职业按总伤害降序
        const aTotalDamage = a.playerDamage + a.buildingDamage;
        const bTotalDamage = b.playerDamage + b.buildingDamage;
        return bTotalDamage - aTotalDamage;
      });
      
      // 添加数据
      sortedRecords.forEach(record => {
        const row = worksheet.addRow({
          playerName: record.playerName,
          level: record.level,
          class: record.class,
          kills: record.kills,
          assists: record.assists,
          warResources: record.warResources,
          totalDamage: record.playerDamage + record.buildingDamage,
          playerDamage: record.playerDamage,
          buildingDamage: record.buildingDamage,
          healing: record.healing,
          damageTaken: record.damageTaken,
          criticalInjuries: record.criticalInjuries,
          qingdengfengu: record.qingdengfengu,
          huayu: record.huayu,
          control: record.control,
        });
        
        // 设置职业列颜色
        const classColor = getClassColor(record.class);
        const classCell = row.getCell(3);
        classCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF' + classColor.replace('#', '') }
        };
        classCell.alignment = { vertical: 'middle', horizontal: 'center' };
        
        // 设置数值列的对齐方式
        row.eachCell((cell, colNumber) => {
          if (colNumber >= 4) { // 数值列
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
          }
        });
      });
      
      // 添加条件格式（数据条）
      const dataRowCount = sortedRecords.length;
      if (dataRowCount > 0) {
        // 为数值列添加数据条
        const numericColumns = [
          { col: 4, color: 'FF4472C4' },   // 击败
          { col: 5, color: 'FF9966FF' },   // 助攻
          { col: 6, color: 'FF4472C4' },   // 战备资源
          { col: 7, color: 'FFFF6B6B' },   // 总伤害
          { col: 8, color: 'FFFF6B6B' },   // 对玩家伤害
          { col: 9, color: 'FFFF6B6B' },   // 对建筑伤害
          { col: 10, color: 'FF90EE90' },  // 治疗值（绿色）
          { col: 11, color: 'FF9966FF' },  // 承受伤害
          { col: 12, color: 'FFFF6B6B' },  // 重伤
          { col: 13, color: 'FF9966FF' },  // 青灯焚骨
          { col: 14, color: 'FF4472C4' },  // 化羽
          { col: 15, color: 'FF4472C4' },  // 控制
        ];
        
        numericColumns.forEach(({ col, color }) => {
          worksheet.addConditionalFormatting({
            ref: `${String.fromCharCode(64 + col)}2:${String.fromCharCode(64 + col)}${dataRowCount + 1}`,
            rules: [
              {
                type: 'dataBar',
                priority: 1,
                cfvo: [
                  { type: 'min' },
                  { type: 'max' }
                ],
                // @ts-ignore - ExcelJS 类型定义不完整，但运行时支持
                color: { argb: color },
                showValue: true,
                gradient: true,
                border: false,
                minLength: 0,
                maxLength: 100,
                axisPosition: 'auto',
                direction: 'leftToRight',
                negativeBarColorSameAsPositive: false,
                negativeBarBorderColorSameAsPositive: true,
              }
            ]
          });
        });
      }
    });
  });
  
  // 生成并下载文件
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  saveAs(blob, `帮战数据_${Date.now()}.xlsx`);
}
