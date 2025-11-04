import { useState, useMemo } from 'react';
import { Input, Select, Table, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { usePlayerStore } from '../../../stores/playerStore';
import { useTeamStore } from '../../../stores/teamStore';
import { Player, PlayerClass } from '../../../types';
import { getClassColor } from '../../../utils/colorUtils';
import './styles.css';

const { Search } = Input;
const { Option } = Select;

// 可拖拽的玩家行组件
function DraggablePlayerRow({ player }: { player: Player }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: player.id,
    data: { type: 'player', player }
  });

  return (
    <tr
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={isDragging ? 'dragging' : 'draggable'}
      style={{
        backgroundColor: getClassColor(player.class),
        cursor: 'move',
        opacity: isDragging ? 0 : 1,
        transition: 'opacity 0.2s'
      }}
    >
      <td>{player.name}</td>
      <td>{player.combatPower.toLocaleString()}</td>
      <td>{player.class}</td>
    </tr>
  );
}

export function PlayerList() {
  const players = usePlayerStore(state => state.players);
  const configuration = useTeamStore(state => state.configuration);
  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState<'name' | 'combatPower' | 'class'>('combatPower');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterClass, setFilterClass] = useState<PlayerClass | 'all'>('all');

  // 让整个 PlayerList 成为可放置目标
  const { setNodeRef, isOver } = useDroppable({
    id: 'player-list-drop-zone',
    data: { type: 'playerList' }
  });

  // 获取已分配的玩家 ID
  const assignedPlayerIds = useMemo(() => {
    const ids = new Set<string>();
    configuration.regiments.forEach(regiment => {
      regiment.squads.forEach(squad => {
        squad.players.forEach(player => {
          if (player) {
            ids.add(player.id);
          }
        });
      });
    });
    return ids;
  }, [configuration]);

  // 只显示未分配的玩家
  const unassignedPlayers = useMemo(() => {
    return players.filter(player => !assignedPlayerIds.has(player.id));
  }, [players, assignedPlayerIds]);

  // 获取所有职业列表（基于未分配的玩家）
  const allClasses = useMemo(() => {
    const classes = new Set(unassignedPlayers.map(p => p.class));
    return Array.from(classes).sort();
  }, [unassignedPlayers]);

  // 筛选和排序（基于未分配的玩家）
  const filteredAndSortedPlayers = useMemo(() => {
    let result = unassignedPlayers;

    // 搜索过滤
    if (searchText) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.class.includes(searchText)
      );
    }

    // 职业筛选
    if (filterClass !== 'all') {
      result = result.filter(p => p.class === filterClass);
    }

    // 排序
    result = [...result].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      
      return sortOrder === 'asc' 
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return result;
  }, [unassignedPlayers, searchText, filterClass, sortField, sortOrder]);

  // 切换排序
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div 
      ref={setNodeRef}
      className="player-list-container"
      style={{
        border: isOver ? '3px solid #ff4d4f' : '3px solid transparent',
        backgroundColor: isOver ? 'rgba(255, 77, 79, 0.08)' : undefined,
        transition: 'all 0.2s',
        borderRadius: '8px'
      }}
    >
      <div className="player-list-header">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Search
            placeholder="搜索角色名或职业"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Select
            style={{ width: '100%' }}
            value={filterClass}
            onChange={setFilterClass}
            placeholder="筛选职业"
          >
            <Option value="all">全部职业</Option>
            {allClasses.map(cls => (
              <Option key={cls} value={cls}>{cls}</Option>
            ))}
          </Select>
        </Space>
      </div>

      <div className="player-list-stats">
        共 {filteredAndSortedPlayers.length} 名未分配玩家
      </div>

      <div className="player-list-table">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                角色名 {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('combatPower')} style={{ cursor: 'pointer' }}>
                战力 {sortField === 'combatPower' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('class')} style={{ cursor: 'pointer' }}>
                职业 {sortField === 'class' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedPlayers.map(player => (
              <DraggablePlayerRow key={player.id} player={player} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
