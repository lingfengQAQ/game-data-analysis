import { useMemo, useState } from 'react';
import { Table, Select, Space } from 'antd';
import { useBattleDataStore } from '../../../stores/battleDataStore';
import { BattleRecord } from '../../../types';
import { getClassColor } from '../../../utils/colorUtils';
import { BarCell } from '../BarCell';
import './styles.css';

export function BattleDataTable() {
  const guildData = useBattleDataStore(state => state.guildData);
  const viewMode = useBattleDataStore(state => state.viewMode);
  
  // 选择的帮会或团队
  const [selectedGuild, setSelectedGuild] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  // 初始化选择
  useMemo(() => {
    if (guildData.length > 0 && !selectedGuild) {
      setSelectedGuild(guildData[0].guildName);
      if (guildData[0].teams.length > 0) {
        setSelectedTeam(`${guildData[0].guildName}-${guildData[0].teams[0].teamLeader}`);
      }
    }
  }, [guildData, selectedGuild]);

  // 定义表格列
  const columns = [
    {
      title: '玩家',
      dataIndex: 'playerName',
      key: 'playerName',
      fixed: 'left' as const,
      width: 120,
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      width: 80,
    },
    {
      title: '职业',
      dataIndex: 'class',
      key: 'class',
      width: 100,
      render: (text: string, record: BattleRecord) => (
        <div
          style={{
            backgroundColor: getClassColor(record.class),
            padding: '4px 8px',
            borderRadius: '4px',
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: '团长',
      dataIndex: 'regimentLeader',
      key: 'regimentLeader',
      width: 120,
    },
    {
      title: '击败',
      dataIndex: 'kills',
      key: 'kills',
      width: 100,
      sorter: (a: BattleRecord, b: BattleRecord) => a.kills - b.kills,
      render: (value: number) => {
        const max = Math.max(...tableData.map(r => r.kills || 0));
        return <BarCell value={value} maxValue={max} colorScheme="red" />;
      },
    },
    {
      title: '助攻',
      dataIndex: 'assists',
      key: 'assists',
      width: 100,
      sorter: (a: BattleRecord, b: BattleRecord) => a.assists - b.assists,
      render: (value: number) => {
        const max = Math.max(...tableData.map(r => r.assists || 0));
        return <BarCell value={value} maxValue={max} colorScheme="purple" />;
      },
    },
    {
      title: '战备资源',
      dataIndex: 'warResources',
      key: 'warResources',
      width: 120,
      sorter: (a: BattleRecord, b: BattleRecord) => a.warResources - b.warResources,
      render: (value: number) => {
        const max = Math.max(...tableData.map(r => r.warResources || 0));
        return <BarCell value={value} maxValue={max} colorScheme="blue" />;
      },
    },
    {
      title: '总伤害',
      key: 'totalDamage',
      width: 140,
      sorter: (a: BattleRecord, b: BattleRecord) => 
        (a.playerDamage + a.buildingDamage) - (b.playerDamage + b.buildingDamage),
      render: (_: any, record: BattleRecord) => {
        const value = record.playerDamage + record.buildingDamage;
        const max = Math.max(...tableData.map(r => (r.playerDamage || 0) + (r.buildingDamage || 0)));
        return <BarCell value={value} maxValue={max} colorScheme="red" />;
      },
    },
    {
      title: '对玩家伤害',
      dataIndex: 'playerDamage',
      key: 'playerDamage',
      width: 140,
      sorter: (a: BattleRecord, b: BattleRecord) => a.playerDamage - b.playerDamage,
      render: (value: number) => {
        const max = Math.max(...tableData.map(r => r.playerDamage || 0));
        return <BarCell value={value} maxValue={max} colorScheme="red" />;
      },
    },
    {
      title: '对建筑伤害',
      dataIndex: 'buildingDamage',
      key: 'buildingDamage',
      width: 140,
      sorter: (a: BattleRecord, b: BattleRecord) => a.buildingDamage - b.buildingDamage,
      render: (value: number) => {
        const max = Math.max(...tableData.map(r => r.buildingDamage || 0));
        return <BarCell value={value} maxValue={max} colorScheme="red" />;
      },
    },
    {
      title: '治疗值',
      dataIndex: 'healing',
      key: 'healing',
      width: 120,
      sorter: (a: BattleRecord, b: BattleRecord) => a.healing - b.healing,
      render: (value: number) => {
        const max = Math.max(...tableData.map(r => r.healing || 0));
        return <BarCell value={value} maxValue={max} colorScheme="green" />;
      },
    },
    {
      title: '承受伤害',
      dataIndex: 'damageTaken',
      key: 'damageTaken',
      width: 120,
      sorter: (a: BattleRecord, b: BattleRecord) => a.damageTaken - b.damageTaken,
      render: (value: number) => {
        const max = Math.max(...tableData.map(r => r.damageTaken || 0));
        return <BarCell value={value} maxValue={max} colorScheme="purple" />;
      },
    },
    {
      title: '重伤',
      dataIndex: 'criticalInjuries',
      key: 'criticalInjuries',
      width: 100,
      sorter: (a: BattleRecord, b: BattleRecord) => a.criticalInjuries - b.criticalInjuries,
      render: (value: number) => {
        const max = Math.max(...tableData.map(r => r.criticalInjuries || 0));
        return <BarCell value={value} maxValue={max} colorScheme="red" />;
      },
    },
    {
      title: '青灯焚骨',
      dataIndex: 'qingdengfengu',
      key: 'qingdengfengu',
      width: 120,
      sorter: (a: BattleRecord, b: BattleRecord) => a.qingdengfengu - b.qingdengfengu,
      render: (value: number) => {
        const max = Math.max(...tableData.map(r => r.qingdengfengu || 0));
        return <BarCell value={value} maxValue={max} colorScheme="purple" />;
      },
    },
    {
      title: '化羽',
      dataIndex: 'huayu',
      key: 'huayu',
      width: 100,
      sorter: (a: BattleRecord, b: BattleRecord) => a.huayu - b.huayu,
      render: (value: number) => {
        const max = Math.max(...tableData.map(r => r.huayu || 0));
        return <BarCell value={value} maxValue={max} colorScheme="blue" />;
      },
    },
    {
      title: '控制',
      dataIndex: 'control',
      key: 'control',
      width: 100,
      sorter: (a: BattleRecord, b: BattleRecord) => a.control - b.control,
      render: (value: number) => {
        const max = Math.max(...tableData.map(r => r.control || 0));
        return <BarCell value={value} maxValue={max} colorScheme="blue" />;
      },
    },
  ];

  // 获取帮会选项
  const guildOptions = useMemo(() => {
    return guildData.map(guild => ({
      label: guild.guildName,
      value: guild.guildName,
    }));
  }, [guildData]);

  // 获取团队选项
  const teamOptions = useMemo(() => {
    const options: { label: string; value: string }[] = [];
    guildData.forEach(guild => {
      guild.teams.forEach(team => {
        options.push({
          label: `${guild.guildName} - ${team.teamLeader}`,
          value: `${guild.guildName}-${team.teamLeader}`,
        });
      });
    });
    return options;
  }, [guildData]);

  // 准备表格数据
  const tableData = useMemo(() => {
    if (viewMode === 'guild') {
      // 按帮会查看：显示选中帮会的所有成员
      const guild = guildData.find(g => g.guildName === selectedGuild);
      if (!guild) return [];
      
      return guild.records.map(record => ({
        ...record,
        key: record.id,
      }));
    } else {
      // 按团队查看：显示选中团队的成员
      const [guildName, teamLeader] = selectedTeam.split('-');
      const guild = guildData.find(g => g.guildName === guildName);
      if (!guild) return [];
      
      const team = guild.teams.find(t => t.teamLeader === teamLeader);
      if (!team) return [];
      
      return team.records.map(record => ({
        ...record,
        key: record.id,
      }));
    }
  }, [guildData, viewMode, selectedGuild, selectedTeam]);

  return (
    <div className="battle-data-table-container">
      <div className="table-selector">
        <Space size="large">
          {viewMode === 'guild' ? (
            <>
              <span style={{ fontWeight: 600 }}>选择帮会：</span>
              <Select
                style={{ width: 200 }}
                value={selectedGuild}
                onChange={setSelectedGuild}
                options={guildOptions}
              />
            </>
          ) : (
            <>
              <span style={{ fontWeight: 600 }}>选择团队：</span>
              <Select
                style={{ width: 300 }}
                value={selectedTeam}
                onChange={setSelectedTeam}
                options={teamOptions}
              />
            </>
          )}
          <span style={{ color: '#666' }}>
            共 {tableData.length} 名玩家
          </span>
        </Space>
      </div>
      
      <div className="table-wrapper">
        <Table
          columns={columns}
          dataSource={tableData}
          scroll={{ x: 1800, y: 'calc(100vh - 260px)' }}
          pagination={false}
          size="small"
        />
      </div>
    </div>
  );
}
